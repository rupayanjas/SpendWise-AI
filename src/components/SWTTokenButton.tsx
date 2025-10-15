import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useWallet } from '@/hooks/useWallet';
import { SWTTokenCard } from './SWTTokenCard';
import { Coins } from 'lucide-react';

export const SWTTokenButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [localBalance, setLocalBalance] = useState('0');
  const { wallet, isConnected } = useWallet();

  // Get SWT balance from wallet or localStorage
  const getSWTBalance = () => {
    if (isConnected && wallet) {
      return wallet.swtBalance || '0';
    }
    // Fallback to localStorage for non-connected users
    const earned = localStorage.getItem('spendwise_total_earned');
    return earned || '0';
  };

  // Update balance when component mounts or storage changes
  useEffect(() => {
    const updateBalance = () => {
      setLocalBalance(getSWTBalance());
    };

    updateBalance();

    // Listen for storage changes
    const handleStorageChange = () => {
      updateBalance();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom storage events (for same-tab updates)
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isConnected, wallet]);

  const swtBalance = localBalance;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="relative text-foreground/70 hover:text-foreground flex items-center gap-2"
      >
        <Coins className="w-5 h-5" />
        <Badge variant="secondary" className="bg-tertiary/20 text-tertiary">
          {swtBalance}
        </Badge>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5" />
              SWT Token Rewards
            </DialogTitle>
          </DialogHeader>
          <SWTTokenCard />
        </DialogContent>
      </Dialog>
    </>
  );
};
