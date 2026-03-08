import { apiService } from './api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export interface WalletInfo {
  address: string;
  balance: string;
  swtBalance: string;
  connected: boolean;
}

class Web3Service {
  private ethereum = window.ethereum;

  async isMetaMaskInstalled(): Promise<boolean> {
    return typeof this.ethereum !== 'undefined' && this.ethereum.isMetaMask;
  }

  async connectWallet(): Promise<WalletInfo | null> {
    if (!await this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask to continue.');
    }

    try {
      // Request account access
      const accounts = await this.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found. Please unlock MetaMask.');
      }

      const address = accounts[0];

      // Get ETH balance
      const balance = await this.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });

      // Convert balance from wei to ETH
      const ethBalance = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);

      // Get SWT token balance from backend
      let swtBalance = '0';
      try {
        const tokenResponse = await apiService.getTokenBalance(address);
        swtBalance = tokenResponse.data?.balance || '0';
      } catch (error) {
        console.warn('Could not fetch SWT balance:', error);
      }

      // Sign a message to verify ownership
      const message = `Connect wallet ${address.toLowerCase()} to SpendWise AI account - ${Date.now()}`;
      const signature = await this.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });

      // Send wallet info to backend
      try {
        await apiService.connectWallet(address, signature, message);
      } catch (error) {
        console.warn('Could not save wallet to backend:', error);
      }

      const walletInfo: WalletInfo = {
        address,
        balance: ethBalance,
        swtBalance,
        connected: true,
      };

      // Store wallet info locally
      localStorage.setItem('spendwise_wallet', JSON.stringify(walletInfo));

      return walletInfo;
    } catch (error: any) {
      if (error.code === 4001) {
        throw new Error('User rejected the connection request.');
      }
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async disconnectWallet(): Promise<void> {
    try {
      await apiService.disconnectWallet();
    } catch (error) {
      console.warn('Could not disconnect wallet from backend:', error);
    }
    
    localStorage.removeItem('spendwise_wallet');
  }

  async getConnectedWallet(): Promise<WalletInfo | null> {
    const stored = localStorage.getItem('spendwise_wallet');
    if (!stored) return null;

    try {
      const walletInfo = JSON.parse(stored);
      
      // Verify the wallet is still connected
      if (await this.isMetaMaskInstalled()) {
        const accounts = await this.ethereum.request({ method: 'eth_accounts' });
        if (accounts.includes(walletInfo.address)) {
          // Update SWT balance
          try {
            const tokenResponse = await apiService.getTokenBalance(walletInfo.address);
            walletInfo.swtBalance = tokenResponse.data?.balance || '0';
          } catch (error) {
            console.warn('Could not update SWT balance:', error);
          }
          
          return walletInfo;
        }
      }
      
      // Wallet is no longer connected
      localStorage.removeItem('spendwise_wallet');
      return null;
    } catch (error) {
      localStorage.removeItem('spendwise_wallet');
      return null;
    }
  }

  async switchToPolygonAmoy(): Promise<void> {
    if (!await this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      await this.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x13882' }], // Polygon Amoy testnet
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (switchError.code === 4902) {
        try {
          await this.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x13882',
                chainName: 'Polygon Amoy Testnet',
                nativeCurrency: {
                  name: 'MATIC',
                  symbol: 'MATIC',
                  decimals: 18,
                },
                rpcUrls: ['https://rpc-amoy.polygon.technology/'],
                blockExplorerUrls: ['https://amoy.polygonscan.com/'],
              },
            ],
          });
        } catch (addError) {
          throw new Error('Failed to add Polygon Amoy network to MetaMask');
        }
      } else {
        throw new Error('Failed to switch to Polygon Amoy network');
      }
    }
  }

  async earnSWTTokens(activity: string, amount: number): Promise<any> {
    try {
      return await apiService.earnRewards(activity, amount);
    } catch (error) {
      throw new Error(`Failed to earn SWT tokens: ${error}`);
    }
  }

  async getRewardOpportunities(): Promise<any> {
    try {
      return await apiService.getRewardOpportunities();
    } catch (error) {
      console.warn('Could not fetch reward opportunities:', error);
      return { data: { opportunities: [] } };
    }
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  async addSWTTokenToMetaMask(): Promise<void> {
    if (!await this.isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    try {
      const contractInfo = await apiService.getContractInfo();
      const tokenAddress = contractInfo.data?.contractAddress;

      if (!tokenAddress) {
        throw new Error('SWT token contract not deployed yet');
      }

      await this.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: tokenAddress,
            symbol: 'SWT',
            decimals: 18,
            image: 'https://via.placeholder.com/64x64?text=SWT',
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to add SWT token to MetaMask: ${error}`);
    }
  }
}

export const web3Service = new Web3Service();
export default web3Service;
