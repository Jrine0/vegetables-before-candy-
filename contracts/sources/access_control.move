module future_me::access_control {
    use std::signer;
    use std::string::String;
    use std::vector;
    use future_me::achievement_nft;

    const E_NOT_ADMIN: u64 = 1;
    const E_ACCESS_DENIED: u64 = 2;
    const E_ALREADY_INITIALIZED: u64 = 3;
    const E_UNSUPPORTED_REQUIRED_TYPE: u64 = 4;

    struct AccessAdminCap has key {}

    struct AccessController has key {
        nft_registry_owner: address,
    }

    public entry fun initialize(admin: &signer, nft_registry_owner: address) {
        let admin_addr = signer::address_of(admin);
        assert!(!exists<AccessController>(admin_addr), E_ALREADY_INITIALIZED);

        move_to(admin, AccessAdminCap {});
        move_to(admin, AccessController {
            nft_registry_owner,
        });
    }

    public entry fun assert_access(
        admin: &signer,
        user: address,
        opportunity_id: String,
        required_types: vector<String>,
        checked_at_unix_seconds: u64,
    ) acquires AccessController {
        let admin_addr = signer::address_of(admin);
        assert!(exists<AccessAdminCap>(admin_addr), E_NOT_ADMIN);
        assert_required_types(required_types);

        let controller = borrow_global_mut<AccessController>(admin_addr);
        let granted = achievement_nft::has_any_required_type(controller.nft_registry_owner, user, required_types);

        let _opportunity = opportunity_id;
        let _checked = checked_at_unix_seconds;

        assert!(granted, E_ACCESS_DENIED);
    }

    public fun can_access(
        controller_owner: address,
        user: address,
        required_types: vector<String>,
    ): bool acquires AccessController {
        assert_required_types(required_types);
        let controller = borrow_global<AccessController>(controller_owner);
        achievement_nft::has_any_required_type(controller.nft_registry_owner, user, required_types)
    }

    fun assert_required_types(required_types: vector<String>) {
        let len = vector::length(&required_types);
        let i = 0;
        while (i < len) {
            let t_ref = vector::borrow(&required_types, i);
            assert!(achievement_nft::is_supported_type_ref(t_ref), E_UNSUPPORTED_REQUIRED_TYPE);
            i = i + 1;
        };
    }
}
