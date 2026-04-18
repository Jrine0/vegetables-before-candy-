"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aptosChainService = exports.AptosChainService = void 0;
const ts_sdk_1 = require("@aptos-labs/ts-sdk");
class AptosChainService {
    constructor() {
        const envNetwork = (process.env.APTOS_NETWORK || 'testnet').toLowerCase();
        this.networkConfig = envNetwork === 'mainnet'
            ? {
                name: 'Aptos Mainnet',
                chainId: 1,
                network: ts_sdk_1.Network.MAINNET,
                fullnode: process.env.APTOS_FULLNODE_URL || 'https://api.mainnet.aptoslabs.com/v1',
                explorerBaseUrl: 'https://explorer.aptoslabs.com/txn',
            }
            : {
                name: 'Aptos Testnet',
                chainId: 2,
                network: ts_sdk_1.Network.TESTNET,
                fullnode: process.env.APTOS_FULLNODE_URL || 'https://api.testnet.aptoslabs.com/v1',
                faucet: process.env.APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com',
                explorerBaseUrl: 'https://explorer.aptoslabs.com/txn',
            };
        const privateKeyHex = process.env.APTOS_ADMIN_PRIVATE_KEY;
        if (!privateKeyHex) {
            throw new Error('APTOS_ADMIN_PRIVATE_KEY is required');
        }
        const aptosConfig = new ts_sdk_1.AptosConfig({
            network: this.networkConfig.network,
            fullnode: this.networkConfig.fullnode,
            faucet: this.networkConfig.faucet,
        });
        this.aptos = new ts_sdk_1.Aptos(aptosConfig);
        this.adminAccount = ts_sdk_1.Account.fromPrivateKey({
            privateKey: new ts_sdk_1.Ed25519PrivateKey(privateKeyHex),
        });
        this.moduleAddress = process.env.APTOS_MODULE_ADDRESS || this.adminAccount.accountAddress.toString();
        this.accessModuleAddress = process.env.APTOS_ACCESS_MODULE_ADDRESS || this.moduleAddress;
    }
    getNetworkConfig() {
        return this.networkConfig;
    }
    getExplorerTxnUrl(txnHash) {
        const networkName = this.networkConfig.network.toString().toLowerCase();
        return `${this.networkConfig.explorerBaseUrl}/${txnHash}?network=${networkName}`;
    }
    async mintSoulboundAchievementNFT(request) {
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
    async verifyOwnershipByType(ownerAddress, achievementType) {
        const result = await this.aptos.view({
            payload: {
                function: `${this.moduleAddress}::achievement_nft::has_achievement_type`,
                functionArguments: [this.moduleAddress, ownerAddress, achievementType],
            },
        });
        return Boolean(Array.isArray(result) ? result[0] : false);
    }
    async verifyAnyRequiredOwnership(ownerAddress, requiredTypes) {
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
    async assertOpportunityAccess(ownerAddress, opportunityId, requiredTypes) {
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
    async getMintAndVerificationEvents(limit = 50) {
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
exports.AptosChainService = AptosChainService;
exports.aptosChainService = new AptosChainService();
