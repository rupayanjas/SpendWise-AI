import { useState, useEffect, useCallback } from 'react';
import { web3Service, WalletInfo } from '../services/web3';
import { toast } from 'sonner';

export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        const connectedWallet = await web3Service.getConnectedWallet();
        setWallet(connectedWallet);
      } catch (error) {
        console.warn('Error checking wallet connection:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkWalletConnection();
  }, []);

  // Listen for MetaMask account changes
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          // User disconnected wallet
          setWallet(null);
          localStorage.removeItem('spendwise_wallet');
          toast.info('Wallet disconnected');
        } else if (wallet && accounts[0] !== wallet.address) {
          // User switched accounts
          connectWallet();
        }
      };

      const handleChainChanged = () => {
        // Reload the page when chain changes
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
          window.ethereum.removeListener('chainChanged', handleChainChanged);
        }
      };
    }
  }, [wallet]);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      const walletInfo = await web3Service.connectWallet();
      setWallet(walletInfo);
      toast.success(`Wallet connected: ${web3Service.formatAddress(walletInfo?.address || '')}`);
      return walletInfo;
    } catch (error: any) {
      toast.error(error.message || 'Failed to connect wallet');
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await web3Service.disconnectWallet();
      setWallet(null);
      toast.success('Wallet disconnected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to disconnect wallet');
    }
  }, []);

  const switchToPolygon = useCallback(async () => {
    try {
      await web3Service.switchToPolygonAmoy();
      toast.success('Switched to Polygon Amoy network');
    } catch (error: any) {
      toast.error(error.message || 'Failed to switch network');
    }
  }, []);

  const addSWTToken = useCallback(async () => {
    try {
      await web3Service.addSWTTokenToMetaMask();
      toast.success('SWT token added to MetaMask');
    } catch (error: any) {
      toast.error(error.message || 'Failed to add SWT token');
    }
  }, []);

  const earnTokens = useCallback(async (activity: string, amount: number) => {
    try {
      const response = await web3Service.earnSWTTokens(activity, amount);
      
      // Update wallet balance
      if (wallet) {
        const updatedWallet = await web3Service.getConnectedWallet();
        setWallet(updatedWallet);
      }
      
      toast.success(`Earned ${amount} SWT tokens for ${activity}!`);
      return response;
    } catch (error: any) {
      toast.error(error.message || 'Failed to earn tokens');
      throw error;
    }
  }, [wallet]);

  const refreshBalance = useCallback(async () => {
    if (wallet) {
      try {
        const updatedWallet = await web3Service.getConnectedWallet();
        setWallet(updatedWallet);
      } catch (error) {
        console.warn('Failed to refresh wallet balance:', error);
      }
    }
  }, [wallet]);

  return {
    wallet,
    isConnected: !!wallet,
    isConnecting,
    isLoading,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    addSWTToken,
    earnTokens,
    refreshBalance,
    formatAddress: web3Service.formatAddress,
  };
};
