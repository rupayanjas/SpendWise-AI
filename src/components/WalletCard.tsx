import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { Wallet, ExternalLink, Plus, Coins, Network, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const WalletCard = () => {
  const {
    wallet,
    isConnected,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToPolygon,
    addSWTToken,
    formatAddress,
  } = useWallet();

  const [showRewards, setShowRewards] = useState(false);

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      toast.success('Address copied to clipboard!');
    }
  };

  const openPolygonScan = () => {
    if (wallet?.address) {
      window.open(`https://amoy.polygonscan.com/address/${wallet.address}`, '_blank');
    }
  };

  if (!isConnected) {
    return (
      <Card className="glass neon-border glow-on-hover">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Web3 Wallet
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-4">
            <Wallet className="w-12 h-12 mx-auto mb-3 text-foreground/40" />
            <p className="text-sm text-foreground/60 mb-4">
              Connect your MetaMask wallet to earn SWT tokens and access Web3 features
            </p>
            <Button 
              onClick={connectWallet} 
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-primary to-tertiary hover:from-primary/90 hover:to-tertiary/90"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </Button>
          </div>
          
          <div className="text-xs text-foreground/50 text-center">
            <p>• Earn SWT tokens for tracking expenses</p>
            <p>• Verify transactions on blockchain</p>
            <p>• Access premium features</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass neon-border glow-on-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Connected Wallet
          <Badge variant="secondary" className="ml-auto bg-green-500/20 text-green-400">
            Connected
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Wallet Address */}
        <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg">
          <div>
            <p className="text-xs text-foreground/60">Address</p>
            <p className="font-mono text-sm">{formatAddress(wallet.address)}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={openPolygonScan}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-accent/20 rounded-lg text-center">
            <p className="text-xs text-foreground/60">MATIC Balance</p>
            <p className="font-bold text-lg text-blue-400">{wallet.balance}</p>
          </div>
          <div className="p-3 bg-accent/20 rounded-lg text-center">
            <p className="text-xs text-foreground/60">SWT Tokens</p>
            <p className="font-bold text-lg text-tertiary">{wallet.swtBalance}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={switchToPolygon}>
            <Network className="w-4 h-4 mr-2" />
            Polygon
          </Button>
          <Button variant="outline" size="sm" onClick={addSWTToken}>
            <Plus className="w-4 h-4 mr-2" />
            Add SWT
          </Button>
        </div>

        {/* Rewards Section */}
        <div className="border-t border-border/50 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRewards(!showRewards)}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Reward Opportunities
            </span>
            <span className="text-xs text-foreground/60">
              {showRewards ? '▲' : '▼'}
            </span>
          </Button>
          
          {showRewards && (
            <div className="mt-3 space-y-2">
              <div className="p-2 bg-accent/20 rounded text-xs">
                <div className="flex justify-between">
                  <span>Add Transaction</span>
                  <span className="text-tertiary">+10 SWT</span>
                </div>
              </div>
              <div className="p-2 bg-accent/20 rounded text-xs">
                <div className="flex justify-between">
                  <span>Set Monthly Budget</span>
                  <span className="text-tertiary">+25 SWT</span>
                </div>
              </div>
              <div className="p-2 bg-accent/20 rounded text-xs">
                <div className="flex justify-between">
                  <span>Complete Profile</span>
                  <span className="text-tertiary">+50 SWT</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Disconnect Button */}
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={disconnectWallet}
          className="w-full"
        >
          Disconnect Wallet
        </Button>
      </CardContent>
    </Card>
  );
};
