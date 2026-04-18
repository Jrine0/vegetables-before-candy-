"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multiChainService = exports.MultiChainService = void 0;
const ethers_1 = require("ethers");
const server_1 = require("../server");
class MultiChainService {
    static getSupportedChains() {
        return Object.values(this.SUPPORTED_CHAINS);
    }
    static getChainConfig(chainName) {
        return this.SUPPORTED_CHAINS[chainName] || null;
    }
    static getProvider(chainName) {
        const config = this.getChainConfig(chainName);
        if (!config)
            return null;
        return new ethers_1.ethers.JsonRpcProvider(config.rpcUrl);
    }
    static async mintNFTOnChain(nftId, chainName, userAddress) {
        const nft = await server_1.prisma.nFTToken.findUnique({
            where: { id: nftId },
            include: { achievement: true, user: true }
        });
        if (!nft) {
            throw new Error('NFT not found');
        }
        const chainConfig = this.getChainConfig(chainName);
        if (!chainConfig || !chainConfig.contractAddress) {
            throw new Error(`Chain ${chainName} not supported or contract not deployed`);
        }
        const provider = this.getProvider(chainName);
        if (!provider) {
            throw new Error(`Failed to create provider for ${chainName}`);
        }
        const simulatedTxHash = `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
        const simulatedTokenId = `${chainConfig.chainId}_${Date.now()}`;
        await server_1.prisma.nFTToken.update({
            where: { id: nftId },
            data: {
                blockchain: chainName,
                contractAddress: chainConfig.contractAddress,
                tokenId: simulatedTokenId,
                metadataUri: `${process.env.API_URL}/api/nfts/metadata/${nft.achievementId}?chain=${chainName}`,
                minted: true,
                mintedAt: new Date()
            }
        });
        console.log(`🔗 Minted NFT ${nftId} on ${chainName} - TX: ${simulatedTxHash}`);
        return {
            txHash: simulatedTxHash,
            tokenId: simulatedTokenId
        };
    }
    static async bridgeNFT(nftId, fromChain, toChain, userAddress) {
        const nft = await server_1.prisma.nFTToken.findUnique({
            where: { id: nftId },
            include: { user: true }
        });
        if (!nft) {
            throw new Error('NFT not found');
        }
        if (nft.blockchain !== fromChain) {
            throw new Error(`NFT is not on ${fromChain} chain`);
        }
        const fromConfig = this.getChainConfig(fromChain);
        const toConfig = this.getChainConfig(toChain);
        if (!fromConfig || !toConfig) {
            throw new Error('Invalid chain configuration');
        }
        const bridgeFee = fromConfig.bridgeFee + toConfig.bridgeFee;
        const bridgeTxHash = `bridge_0x${Date.now().toString(16)}${Math.random().toString(16).slice(2)}`;
        const bridgeTransaction = {
            fromChain,
            toChain,
            tokenId: nft.tokenId,
            txHash: bridgeTxHash,
            status: 'pending',
            bridgeFee
        };
        setTimeout(async () => {
            await this.completeBridge(nftId, toChain, toConfig.contractAddress);
        }, 3000);
        console.log(`🌉 Bridging NFT ${nftId} from ${fromChain} to ${toChain}`);
        return bridgeTransaction;
    }
    static async completeBridge(nftId, toChain, contractAddress) {
        const newTokenId = `${this.getChainConfig(toChain)?.chainId}_${Date.now()}`;
        await server_1.prisma.nFTToken.update({
            where: { id: nftId },
            data: {
                blockchain: toChain,
                contractAddress,
                tokenId: newTokenId,
                metadataUri: `${process.env.API_URL}/api/nfts/metadata/${nftId}?chain=${toChain}`
            }
        });
        console.log(`✅ Bridge completed - NFT ${nftId} now on ${toChain}`);
    }
    static async getGasPrice(chainName) {
        const provider = this.getProvider(chainName);
        if (!provider) {
            throw new Error(`Provider not available for ${chainName}`);
        }
        try {
            const feeData = await provider.getFeeData();
            const gasPrice = feeData.gasPrice || ethers_1.ethers.parseUnits('20', 'gwei');
            return {
                gasPrice: gasPrice.toString(),
                gasPriceGwei: ethers_1.ethers.formatUnits(gasPrice, 'gwei')
            };
        }
        catch (error) {
            console.error(`Failed to get gas price for ${chainName}:`, error);
            return {
                gasPrice: ethers_1.ethers.parseUnits('20', 'gwei').toString(),
                gasPriceGwei: '20'
            };
        }
    }
    static async estimateBridgeCost(fromChain, toChain) {
        const fromConfig = this.getChainConfig(fromChain);
        const toConfig = this.getChainConfig(toChain);
        if (!fromConfig || !toConfig) {
            throw new Error('Invalid chain configuration');
        }
        const bridgeFee = fromConfig.bridgeFee + toConfig.bridgeFee;
        const fromGas = await this.getGasPrice(fromChain);
        const toGas = await this.getGasPrice(toChain);
        const estimatedFromGasCost = ethers_1.ethers.formatEther(BigInt(fromGas.gasPrice) * BigInt(150000));
        const estimatedToGasCost = ethers_1.ethers.formatEther(BigInt(toGas.gasPrice) * BigInt(100000));
        const ethPriceUSD = 2000;
        const maticPriceUSD = 1;
        const gasCostUSD = (parseFloat(estimatedFromGasCost) *
            (fromConfig.nativeToken === 'ETH' ? ethPriceUSD : maticPriceUSD)) + (parseFloat(estimatedToGasCost) *
            (toConfig.nativeToken === 'ETH' ? ethPriceUSD : maticPriceUSD));
        const totalCostUSD = (bridgeFee / 100) + gasCostUSD;
        let estimatedTime = '5-10 minutes';
        if (fromChain === 'ethereum' || toChain === 'ethereum') {
            estimatedTime = '10-20 minutes';
        }
        return {
            bridgeFee,
            estimatedGasCost: `${estimatedFromGasCost} ${fromConfig.nativeToken} + ${estimatedToGasCost} ${toConfig.nativeToken}`,
            totalCostUSD: Math.round(totalCostUSD * 100) / 100,
            estimatedTime
        };
    }
    static async getCrossChainPortfolio(userId) {
        const nfts = await server_1.prisma.nFTToken.findMany({
            where: { userId, minted: true },
            include: { achievement: true }
        });
        const portfolioByChain = nfts.reduce((acc, nft) => {
            if (!acc[nft.blockchain]) {
                acc[nft.blockchain] = {
                    chain: this.getChainConfig(nft.blockchain),
                    nfts: [],
                    totalValue: 0,
                    count: 0
                };
            }
            acc[nft.blockchain].nfts.push(nft);
            acc[nft.blockchain].count++;
            acc[nft.blockchain].totalValue += nft.evolutionPoints * 10;
            return acc;
        }, {});
        const totalPortfolioValue = Object.values(portfolioByChain).reduce((sum, chain) => sum + chain.totalValue, 0);
        return {
            portfolioByChain,
            totalNFTs: nfts.length,
            totalChains: Object.keys(portfolioByChain).length,
            totalPortfolioValue,
            supportedChains: this.getSupportedChains()
        };
    }
    static async batchMintAcrossChains(nftId, chains, userAddress) {
        const results = [];
        const errors = [];
        for (const chain of chains) {
            try {
                const result = await this.mintNFTOnChain(nftId, chain, userAddress);
                results.push({ chain, ...result });
            }
            catch (error) {
                errors.push({ chain, error: error.message });
            }
        }
        return { results, errors };
    }
    static async getChainHealthStatus() {
        const healthStatus = {};
        for (const [chainName, config] of Object.entries(this.SUPPORTED_CHAINS)) {
            try {
                const provider = this.getProvider(chainName);
                if (!provider) {
                    healthStatus[chainName] = { status: 'unavailable', error: 'Provider not configured' };
                    continue;
                }
                const blockNumber = await provider.getBlockNumber();
                const gasPrice = await this.getGasPrice(chainName);
                healthStatus[chainName] = {
                    status: 'healthy',
                    blockNumber,
                    gasPrice: gasPrice.gasPriceGwei,
                    rpcUrl: config.rpcUrl,
                    lastChecked: new Date().toISOString()
                };
            }
            catch (error) {
                healthStatus[chainName] = {
                    status: 'unhealthy',
                    error: error.message,
                    lastChecked: new Date().toISOString()
                };
            }
        }
        return healthStatus;
    }
    static async getOptimalChainRecommendation(considerGasCost = true, preferredFeatures = []) {
        const chainHealth = await this.getChainHealthStatus();
        const healthyChains = Object.entries(chainHealth)
            .filter(([_, health]) => health.status === 'healthy')
            .map(([chain, _]) => chain);
        if (healthyChains.length === 0) {
            throw new Error('No healthy chains available');
        }
        let recommendedChain = 'polygon';
        let reason = 'Lowest transaction costs and fast confirmations';
        if (considerGasCost) {
            if (healthyChains.includes('polygon')) {
                recommendedChain = 'polygon';
                reason = 'Lowest gas fees and fastest confirmations (~2 seconds)';
            }
            else if (healthyChains.includes('base')) {
                recommendedChain = 'base';
                reason = 'Low gas fees and good ecosystem support';
            }
        }
        if (preferredFeatures.includes('security') && healthyChains.includes('ethereum')) {
            recommendedChain = 'ethereum';
            reason = 'Highest security and decentralization';
        }
        const alternatives = healthyChains
            .filter(chain => chain !== recommendedChain)
            .map(chain => {
            const config = this.getChainConfig(chain);
            const pros = [];
            const cons = [];
            switch (chain) {
                case 'ethereum':
                    pros.push('Highest security', 'Largest ecosystem', 'Most liquidity');
                    cons.push('Higher gas fees', 'Slower confirmations');
                    break;
                case 'polygon':
                    pros.push('Very low fees', 'Fast confirmations', 'Ethereum compatible');
                    cons.push('Less decentralized', 'Newer ecosystem');
                    break;
                case 'base':
                    pros.push('Low fees', 'Coinbase backed', 'Growing ecosystem');
                    cons.push('Newer network', 'Smaller ecosystem');
                    break;
                case 'arbitrum':
                    pros.push('Lower fees than Ethereum', 'High security', 'Ethereum compatible');
                    cons.push('More complex architecture', 'Withdrawal delays');
                    break;
            }
            return { chain, pros, cons };
        });
        return {
            recommendedChain,
            reason,
            alternatives
        };
    }
}
exports.MultiChainService = MultiChainService;
MultiChainService.SUPPORTED_CHAINS = {
    ethereum: {
        chainId: 11155111,
        name: 'Ethereum Sepolia',
        rpcUrl: process.env.ETHEREUM_RPC_URL || 'https://sepolia.infura.io/v3/demo',
        nativeToken: 'ETH',
        blockExplorer: 'https://sepolia.etherscan.io',
        contractAddress: process.env.ETHEREUM_CONTRACT_ADDRESS,
        gasMultiplier: 1.2,
        bridgeFee: 500
    },
    polygon: {
        chainId: 80001,
        name: 'Polygon Mumbai',
        rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-mumbai.g.alchemy.com/v2/demo',
        nativeToken: 'MATIC',
        blockExplorer: 'https://mumbai.polygonscan.com',
        contractAddress: process.env.POLYGON_CONTRACT_ADDRESS,
        gasMultiplier: 1.1,
        bridgeFee: 100
    },
    base: {
        chainId: 84531,
        name: 'Base Goerli',
        rpcUrl: process.env.BASE_RPC_URL || 'https://goerli.base.org',
        nativeToken: 'ETH',
        blockExplorer: 'https://goerli.basescan.org',
        contractAddress: process.env.BASE_CONTRACT_ADDRESS,
        gasMultiplier: 1.0,
        bridgeFee: 200
    },
    arbitrum: {
        chainId: 421613,
        name: 'Arbitrum Goerli',
        rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://goerli-rollup.arbitrum.io/rpc',
        nativeToken: 'ETH',
        blockExplorer: 'https://goerli.arbiscan.io',
        contractAddress: process.env.ARBITRUM_CONTRACT_ADDRESS,
        gasMultiplier: 1.0,
        bridgeFee: 150
    }
};
exports.multiChainService = MultiChainService;
