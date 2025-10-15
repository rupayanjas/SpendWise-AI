import { ethers } from 'ethers';

// SpendWise Token ABI (Application Binary Interface)
const SWT_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address, uint256) returns (bool)",
  "function distributeReward(address, uint256, string) returns (bool)",
  "function batchDistributeRewards(address[], uint256[], string) returns (bool)",
  "function storeTransactionProof(bytes32) returns (bool)",
  "function verifyTransactionProof(bytes32) view returns (bool)",
  "function batchStoreProofs(bytes32[]) returns (bool)",
  "function getRewardPool() view returns (uint256)",
  "function getContractInfo() view returns (string, string, uint8, uint256, address, address)",
  "event RewardDistributed(address indexed to, uint256 amount, string reason)",
  "event TransactionProofStored(bytes32 indexed proofHash, address indexed user)"
];

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private contract: ethers.Contract | null = null;
  private contractAddress: string;

  constructor() {
    const rpcUrl = process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.contractAddress = process.env.CONTRACT_ADDRESS || '';

    if (process.env.PRIVATE_KEY) {
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
      if (this.contractAddress) {
        this.contract = new ethers.Contract(this.contractAddress, SWT_ABI, this.wallet);
      }
    }
  }

  // Check if blockchain service is properly configured
  isConfigured(): boolean {
    return !!(this.wallet && this.contract && this.contractAddress);
  }

  // Get token balance for an address
  async getTokenBalance(walletAddress: string): Promise<string> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const balance = await this.contract.balanceOf(walletAddress);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error('Failed to get token balance');
    }
  }

  // Distribute reward tokens to a user
  async distributeReward(
    recipientAddress: string,
    amount: string,
    reason: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      // Convert amount to wei (18 decimals)
      const amountWei = ethers.parseEther(amount);

      // Check if we have enough balance
      const rewardPool = await this.contract.getRewardPool();
      if (rewardPool < amountWei) {
        throw new Error('Insufficient reward pool balance');
      }

      // Send transaction
      const tx = await this.contract.distributeReward(recipientAddress, amountWei, reason);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error distributing reward:', error);
      return {
        success: false,
        error: error.message || 'Failed to distribute reward'
      };
    }
  }

  // Batch distribute rewards to multiple users
  async batchDistributeRewards(
    recipients: string[],
    amounts: string[],
    reason: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      if (recipients.length !== amounts.length) {
        throw new Error('Recipients and amounts arrays must have the same length');
      }

      // Convert amounts to wei
      const amountsWei = amounts.map(amount => ethers.parseEther(amount));

      // Check total amount against reward pool
      const totalAmount = amountsWei.reduce((sum, amount) => sum + amount, 0n);
      const rewardPool = await this.contract.getRewardPool();
      if (rewardPool < totalAmount) {
        throw new Error('Insufficient reward pool balance');
      }

      // Send transaction
      const tx = await this.contract.batchDistributeRewards(recipients, amountsWei, reason);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error batch distributing rewards:', error);
      return {
        success: false,
        error: error.message || 'Failed to batch distribute rewards'
      };
    }
  }

  // Store transaction proof hash on blockchain
  async storeTransactionProof(
    proofHash: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      // Convert hash to bytes32 format
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(proofHash));

      // Send transaction
      const tx = await this.contract.storeTransactionProof(hashBytes32);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error storing transaction proof:', error);
      return {
        success: false,
        error: error.message || 'Failed to store transaction proof'
      };
    }
  }

  // Verify if a transaction proof exists on blockchain
  async verifyTransactionProof(proofHash: string): Promise<boolean> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      // Convert hash to bytes32 format
      const hashBytes32 = ethers.keccak256(ethers.toUtf8Bytes(proofHash));

      const exists = await this.contract.verifyTransactionProof(hashBytes32);
      return exists;
    } catch (error) {
      console.error('Error verifying transaction proof:', error);
      return false;
    }
  }

  // Batch store multiple transaction proofs
  async batchStoreProofs(
    proofHashes: string[]
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      if (!this.contract || !this.wallet) {
        throw new Error('Contract or wallet not initialized');
      }

      // Convert hashes to bytes32 format
      const hashesBytes32 = proofHashes.map(hash => 
        ethers.keccak256(ethers.toUtf8Bytes(hash))
      );

      // Send transaction
      const tx = await this.contract.batchStoreProofs(hashesBytes32);
      const receipt = await tx.wait();

      return {
        success: true,
        txHash: receipt.hash
      };
    } catch (error: any) {
      console.error('Error batch storing proofs:', error);
      return {
        success: false,
        error: error.message || 'Failed to batch store proofs'
      };
    }
  }

  // Get contract information
  async getContractInfo(): Promise<{
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
    owner: string;
    rewardDistributor: string;
    rewardPool: string;
  }> {
    try {
      if (!this.contract) {
        throw new Error('Contract not initialized');
      }

      const [name, symbol, decimals, totalSupply, owner, rewardDistributor] = 
        await this.contract.getContractInfo();
      const rewardPool = await this.contract.getRewardPool();

      return {
        name,
        symbol,
        decimals: Number(decimals),
        totalSupply: ethers.formatEther(totalSupply),
        owner,
        rewardDistributor,
        rewardPool: ethers.formatEther(rewardPool)
      };
    } catch (error) {
      console.error('Error getting contract info:', error);
      throw new Error('Failed to get contract information');
    }
  }

  // Get network information
  async getNetworkInfo(): Promise<{
    chainId: number;
    name: string;
    rpcUrl: string;
  }> {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: Number(network.chainId),
        name: network.name,
        rpcUrl: process.env.RPC_URL || 'https://rpc-amoy.polygon.technology/'
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw new Error('Failed to get network information');
    }
  }

  // Get gas price estimation
  async getGasPrice(): Promise<string> {
    try {
      const gasPrice = await this.provider.getFeeData();
      return ethers.formatUnits(gasPrice.gasPrice || 0n, 'gwei');
    } catch (error) {
      console.error('Error getting gas price:', error);
      return '0';
    }
  }

  // Check if an address is a valid Ethereum address
  static isValidAddress(address: string): boolean {
    try {
      return ethers.isAddress(address);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
