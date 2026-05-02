import { Server, Networks, Keypair, TransactionBuilder, Operation, Asset, Contract } from '@stellar/stellar-sdk';
import { Contract as SorobanContract } from 'soroban-client';

export interface StellarNetworkConfig {
    name: string;
    network: Networks;
    rpcUrl: string;
    horizonUrl: string;
    friendbotUrl?: string;
}

type TaskRequest = {
    userAddress: string;
    description: string;
    rewardAmount: string; // in stroops
};

export class SorobanChainService {
    private readonly networkConfig: StellarNetworkConfig;
    private readonly server: Server;
    private readonly adminKeypair: Keypair;
    private readonly contractId: string;
    private readonly tokenId: string; // Native XLM or token contract

    constructor() {
        const envNetwork = (process.env.STELLAR_NETWORK || 'testnet').toLowerCase();

        this.networkConfig = envNetwork === 'mainnet'
            ? {
                name: 'Stellar Mainnet',
                network: Networks.PUBLIC,
                rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-rpc.mainnet.stellar.org',
                horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon.stellar.org',
            }
            : {
                name: 'Stellar Testnet',
                network: Networks.TESTNET,
                rpcUrl: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
                horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
                friendbotUrl: 'https://friendbot.stellar.org',
            };

        const privateKey = process.env.STELLAR_ADMIN_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('STELLAR_ADMIN_PRIVATE_KEY is required');
        }

        this.server = new Server(this.networkConfig.rpcUrl);
        this.adminKeypair = Keypair.fromSecret(privateKey);
        this.contractId = process.env.SOROBAN_CONTRACT_ID || '';
        this.tokenId = process.env.STELLAR_TOKEN_ID || Asset.native().toString(); // Default to XLM
    }

    public getNetworkConfig(): StellarNetworkConfig {
        return this.networkConfig;
    }

    public getExplorerTxnUrl(txnHash: string): string {
        const networkName = this.networkConfig.network === Networks.PUBLIC ? 'mainnet' : 'testnet';
        return `https://stellar.expert/explorer/${networkName}/tx/${txnHash}`;
    }

    public async createTask(request: TaskRequest): Promise<{ txHash: string; taskId: number }> {
        const contract = new SorobanContract(this.contractId);

        // Load admin account
        const adminAccount = await this.server.loadAccount(this.adminKeypair.publicKey());

        // Build transaction
        const transaction = new TransactionBuilder(adminAccount, {
            fee: '100',
            networkPassphrase: this.networkConfig.network,
        })
        .addOperation(contract.call('create_task',
            request.userAddress,
            request.description,
            request.rewardAmount
        ))
        .setTimeout(30)
        .build();

        // Sign and submit
        transaction.sign(this.adminKeypair);
        const result = await this.server.submitTransaction(transaction);

        // Parse task ID from result (assuming it's returned)
        const taskId = 1; // TODO: Parse from contract return

        return { txHash: result.hash, taskId };
    }

    public async submitTaskCompletion(userAddress: string, taskId: number): Promise<{ txHash: string }> {
        const contract = new SorobanContract(this.contractId);

        // Load user account (assuming we have their keypair or use admin for now)
        const userKeypair = Keypair.fromPublicKey(userAddress); // For read-only, but need to sign
        // Actually, for user actions, we'd need their signature, but for now using admin
        const account = await this.server.loadAccount(this.adminKeypair.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: this.networkConfig.network,
        })
        .addOperation(contract.call('submit_completion', userAddress, taskId.toString()))
        .setTimeout(30)
        .build();

        transaction.sign(this.adminKeypair);
        const result = await this.server.submitTransaction(transaction);

        return { txHash: result.hash };
    }

    public async verifyTask(taskOwner: string, taskId: number): Promise<{ txHash: string }> {
        const contract = new SorobanContract(this.contractId);

        const account = await this.server.loadAccount(this.adminKeypair.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: this.networkConfig.network,
        })
        .addOperation(contract.call('verify_task', taskOwner, taskId.toString()))
        .setTimeout(30)
        .build();

        transaction.sign(this.adminKeypair);
        const result = await this.server.submitTransaction(transaction);

        return { txHash: result.hash };
    }

    public async claimReward(userAddress: string, taskId: number): Promise<{ txHash: string }> {
        const contract = new SorobanContract(this.contractId);

        const account = await this.server.loadAccount(this.adminKeypair.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: this.networkConfig.network,
        })
        .addOperation(contract.call('claim_reward', userAddress, taskId.toString()))
        .setTimeout(30)
        .build();

        transaction.sign(this.adminKeypair);
        const result = await this.server.submitTransaction(transaction);

        return { txHash: result.hash };
    }

    public async getUserTasks(userAddress: string): Promise<any[]> {
        const contract = new SorobanContract(this.contractId);

        const account = await this.server.loadAccount(this.adminKeypair.publicKey());

        const transaction = new TransactionBuilder(account, {
            fee: '100',
            networkPassphrase: this.networkConfig.network,
        })
        .addOperation(contract.call('get_user_tasks', userAddress))
        .setTimeout(30)
        .build();

        transaction.sign(this.adminKeypair);
        const result = await this.server.simulateTransaction(transaction);

        // Parse tasks from result
        return []; // TODO: Parse tasks
    }

    public async getTaskEvents(limit = 50): Promise<any[]> {
        // Get contract events
        const events = await this.server.events()
            .forContract(this.contractId)
            .limit(limit)
            .call();

        return events.records;
    }
}

export const sorobanChainService = new SorobanChainService();