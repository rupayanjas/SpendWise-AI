import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { WalletCard } from './WalletCard';
import { Wallet } from 'lucide-react';

export const WalletButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { wallet, isConnected } = useWallet();

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative text-foreground/70 hover:text-foreground"
      >
        <Wallet className="w-5 h-5" />
        {isConnected && (
          <Badge variant="secondary" className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-green-500" />
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Web3 Wallet
            </DialogTitle>
          </DialogHeader>
          <WalletCard />
        </DialogContent>
      </Dialog>
    </>
  );
};
