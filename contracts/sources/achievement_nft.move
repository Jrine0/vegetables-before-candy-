module future_me::achievement_nft {
    use std::bcs;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_std::table::{Self, Table};

    const E_NOT_ADMIN: u64 = 1;
    const E_NOT_MINTER: u64 = 2;
    const E_TOKEN_NOT_FOUND: u64 = 3;
    const E_ALREADY_INITIALIZED: u64 = 4;
    const E_UNSUPPORTED_TYPE: u64 = 5;
    const E_SOULBOUND_NON_TRANSFERABLE: u64 = 6;

    const TYPE_GPA: vector<u8> = b"gpa_guardian";
    const TYPE_RESEARCH: vector<u8> = b"research_rockstar";
    const TYPE_LEADERSHIP: vector<u8> = b"leadership_legend";

    struct AdminCap has key {}
    struct MintCap has key {}

    struct Token has copy, drop, store {
        token_id: u64,
        owner: address,
        achievement_type: String,
        achievement_id: String,
        metadata_uri: String,
        university: String,
        minted_at_unix_seconds: u64,
        soulbound: bool,
    }

    struct Registry has key {
        resource_account: address,
        next_token_id: u64,
        tokens: Table<u64, Token>,
        owner_tokens: Table<address, vector<u64>>,
        owner_type_index: Table<vector<u8>, bool>,
    }

    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);

        assert!(!exists<Registry>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, AdminCap {});
        move_to(admin, MintCap {});

        move_to(admin, Registry {
            resource_account: admin_addr,
            next_token_id: 1,
            tokens: table::new<u64, Token>(),
            owner_tokens: table::new<address, vector<u64>>(),
            owner_type_index: table::new<vector<u8>, bool>(),
        });
    }

    public entry fun mint_soulbound(
        admin: &signer,
        recipient: address,
        achievement_type: String,
        achievement_id: String,
        metadata_uri: String,
        university: String,
        minted_at_unix_seconds: u64,
    ) acquires Registry {
        let admin_addr = signer::address_of(admin);
        assert!(exists<MintCap>(admin_addr), E_NOT_MINTER);
        assert!(is_supported_type(achievement_type), E_UNSUPPORTED_TYPE);

        let registry = borrow_global_mut<Registry>(admin_addr);
        let token_id = registry.next_token_id;
        registry.next_token_id = token_id + 1;

        let token = Token {
            token_id,
            owner: recipient,
            achievement_type,
            achievement_id,
            metadata_uri,
            university,
            minted_at_unix_seconds,
            soulbound: true,
        };

        table::add(&mut registry.tokens, token_id, token);

        if (!table::contains(&registry.owner_tokens, recipient)) {
            table::add(&mut registry.owner_tokens, recipient, vector::empty<u64>());
        };

        let owner_token_ids = table::borrow_mut(&mut registry.owner_tokens, recipient);
        vector::push_back(owner_token_ids, token_id);

        let idx_key = owner_type_key(recipient, &table::borrow(&registry.tokens, token_id).achievement_type);
        if (!table::contains(&registry.owner_type_index, idx_key)) {
            table::add(&mut registry.owner_type_index, idx_key, true);
        };

    }

    public fun has_achievement_type(registry_owner: address, owner: address, achievement_type: String): bool acquires Registry {
        has_achievement_type_ref(registry_owner, owner, &achievement_type)
    }

    public fun has_achievement_type_ref(registry_owner: address, owner: address, achievement_type: &String): bool acquires Registry {
        let registry = borrow_global<Registry>(registry_owner);
        let key = owner_type_key(owner, achievement_type);
        if (!table::contains(&registry.owner_type_index, key)) {
            return false
        };

        true
    }

    public fun has_any_required_type(registry_owner: address, owner: address, required_types: vector<String>): bool acquires Registry {
        let len = vector::length(&required_types);
        let i = 0;
        while (i < len) {
            let t_ref = vector::borrow(&required_types, i);
            if (has_achievement_type_ref(registry_owner, owner, t_ref)) {
                return true
            };
            i = i + 1;
        };
        false
    }

    public entry fun emit_verification(
        admin: &signer,
        owner: address,
        achievement_type: String,
        checked_at_unix_seconds: u64,
    ) acquires Registry {
        let admin_addr = signer::address_of(admin);
        assert!(exists<AdminCap>(admin_addr), E_NOT_ADMIN);
        let _ = has_achievement_type(admin_addr, owner, achievement_type);
        let _checked = checked_at_unix_seconds;
    }

    public entry fun transfer_soulbound(_owner: &signer, _token_id: u64, _to: address) {
        abort E_SOULBOUND_NON_TRANSFERABLE
    }

    public fun is_supported_type(achievement_type: String): bool {
        is_supported_type_ref(&achievement_type)
    }

    public fun is_supported_type_ref(achievement_type: &String): bool {
        let bytes = string::bytes(achievement_type);
        let gpa = TYPE_GPA;
        let research = TYPE_RESEARCH;
        let leadership = TYPE_LEADERSHIP;
        bytes_equal(bytes, &gpa) || bytes_equal(bytes, &research) || bytes_equal(bytes, &leadership)
    }

    public fun token_by_id(registry_owner: address, token_id: u64): Token acquires Registry {
        let registry = borrow_global<Registry>(registry_owner);
        assert!(table::contains(&registry.tokens, token_id), E_TOKEN_NOT_FOUND);
        *table::borrow(&registry.tokens, token_id)
    }

    public fun resource_account(registry_owner: address): address acquires Registry {
        let registry = borrow_global<Registry>(registry_owner);
        registry.resource_account
    }

    fun owner_type_key(owner: address, achievement_type: &String): vector<u8> {
        let key = vector::empty<u8>();
        let owner_bytes = bcs::to_bytes(&owner);
        let ach_bytes = string::bytes(achievement_type);

        vector::append(&mut key, owner_bytes);
        vector::append(&mut key, b"::");
        append_ref_bytes(&mut key, ach_bytes);
        key
    }

    fun append_ref_bytes(target: &mut vector<u8>, src: &vector<u8>) {
        let len = vector::length(src);
        let i = 0;
        while (i < len) {
            vector::push_back(target, *vector::borrow(src, i));
            i = i + 1;
        };
    }

    fun bytes_equal(a: &vector<u8>, b: &vector<u8>): bool {
        if (vector::length(a) != vector::length(b)) {
            return false
        };

        let len = vector::length(a);
        let i = 0;
        while (i < len) {
            if (*vector::borrow(a, i) != *vector::borrow(b, i)) {
                return false
            };
            i = i + 1;
        };

        true
    }
}
