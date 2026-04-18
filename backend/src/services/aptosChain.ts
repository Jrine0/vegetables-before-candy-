import {
    Account,
    Aptos,
    AptosConfig,
    Ed25519PrivateKey,
    Network,
} from '@aptos-labs/ts-sdk';

export interface AptosNetworkConfig {
    name: string;
    chainId: number;
    network: Network;
    fullnode: string;
    faucet?: string;
    explorerBaseUrl: string;
}

type MintRequest = {
    recipientAddress: string;
    achievementType: string;
    achievementId: string;
    metadataUri: string;
    university: string;
};

export class AptosChainService {
    private readonly networkConfig: AptosNetworkConfig;
    private readonly aptos: Aptos;
    private readonly adminAccount: Account;
    private readonly moduleAddress: string;
    private readonly accessModuleAddress: string;

    constructor() {
        const envNetwork = (process.env.APTOS_NETWORK || 'testnet').toLowerCase();

        this.networkConfig = envNetwork === 'mainnet'
            ? {
                name: 'Aptos Mainnet',
                chainId: 1,
                network: Network.MAINNET,
                fullnode: process.env.APTOS_FULLNODE_URL || 'https://api.mainnet.aptoslabs.com/v1',
                explorerBaseUrl: 'https://explorer.aptoslabs.com/txn',
            }
            : {
                name: 'Aptos Testnet',
                chainId: 2,
                network: Network.TESTNET,
                fullnode: process.env.APTOS_FULLNODE_URL || 'https://api.testnet.aptoslabs.com/v1',
                faucet: process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com',
                explorerBaseUrl: 'https://explorer.aptoslabs.com/txn',
            };

        const privateKeyHex = process.env.APTOS_ADMIN_PRIVATE_KEY;
        if (!privateKeyHex) {
            throw new Error('APTOS_ADMIN_PRIVATE_KEY is required');
        }

        const aptosConfig = new AptosConfig({
            network: this.networkConfig.network,
            fullnode: this.networkConfig.fullnode,
            faucet: this.networkConfig.faucet,
        });

        this.aptos = new Aptos(aptosConfig);
        this.adminAccount = Account.fromPrivateKey({
            privateKey: new Ed25519PrivateKey(privateKeyHex),
        });

        this.moduleAddress = process.env.APTOS_MODULE_ADDRESS || this.adminAccount.accountAddress.toString();
        this.accessModuleAddress = process.env.APTOS_ACCESS_MODULE_ADDRESS || this.moduleAddress;
    }

    public getNetworkConfig(): AptosNetworkConfig {
        return this.networkConfig;
    }

    public getExplorerTxnUrl(txnHash: string): string {
        const networkName = this.networkConfig.network.toString().toLowerCase();
        return `${this.networkConfig.explorerBaseUrl}/${txnHash}?network=${networkName}`;
    }

    public async mintSoulboundAchievementNFT(request: MintRequest): Promise<{ txHash: string; tokenId: string }> {
        const now = Math.floor(Date.now() / 1000);

        const transaction = await this.aptos.transaction.build.simple({
            sender: this.adminAccount.accountAddress,
            data: {
                function: `${this.moduleAddress}::achievement_nft::mint_soulbound`,
                functionArguments: [
                    request.recipientAddress,
                    request.achievementType,
                    request.achievementId,
                    request.metadataUri,
                    request.university,
                    now,
                ],
            },
        });

        const submitted = await this.aptos.signAndSubmitTransaction({
            signer: this.adminAccount,
            transaction,
        });

        await this.aptos.waitForTransaction({ transactionHash: submitted.hash });

        const tokenId = `${request.achievementType}:${request.achievementId}:${now}`;
        return { txHash: submitted.hash, tokenId };
    }

    public async verifyOwnershipByType(ownerAddress: string, achievementType: string): Promise<boolean> {
        const result = await this.aptos.view({
            payload: {
                function: `${this.moduleAddress}::achievement_nft::has_achievement_type`,
                functionArguments: [this.moduleAddress, ownerAddress, achievementType],
            },
        });

        return Boolean(Array.isArray(result) ? result[0] : false);
    }

    public async verifyAnyRequiredOwnership(ownerAddress: string, requiredTypes: string[]): Promise<boolean> {
        if (!requiredTypes.length) {
            return true;
        }

        const result = await this.aptos.view({
            payload: {
                function: `${this.moduleAddress}::achievement_nft::has_any_required_type`,
                functionArguments: [this.moduleAddress, ownerAddress, requiredTypes],
            },
        });

        return Boolean(Array.isArray(result) ? result[0] : false);
    }

    public async assertOpportunityAccess(
        ownerAddress: string,
        opportunityId: string,
        requiredTypes: string[],
    ): Promise<{ txHash: string; granted: boolean }> {
        const now = Math.floor(Date.now() / 1000);

        const transaction = await this.aptos.transaction.build.simple({
            sender: this.adminAccount.accountAddress,
            data: {
                function: `${this.accessModuleAddress}::access_control::assert_access`,
                functionArguments: [ownerAddress, opportunityId, requiredTypes, now],
            },
        });

        const submitted = await this.aptos.signAndSubmitTransaction({
            signer: this.adminAccount,
            transaction,
        });

        await this.aptos.waitForTransaction({ transactionHash: submitted.hash });

        return {
            txHash: submitted.hash,
            granted: true,
        };
    }

    public async getMintAndVerificationEvents(limit = 50): Promise<any[]> {
        const account = this.moduleAddress;
        const minted = await this.aptos.getAccountEventsByEventType({
            accountAddress: account,
            eventType: `${account}::achievement_nft::MintedEvent`,
            options: { limit },
        });

        const verified = await this.aptos.getAccountEventsByEventType({
            accountAddress: account,
            eventType: `${account}::achievement_nft::VerificationEvent`,
            options: { limit },
        });

        return [...minted, ...verified];
    }
}

export const aptosChainService = new AptosChainService();