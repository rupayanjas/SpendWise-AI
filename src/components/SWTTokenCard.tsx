import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWallet } from '@/hooks/useWallet';
import { Coins, TrendingUp, Gift, Star } from 'lucide-react';
import { toast } from 'sonner';

interface RewardActivity {
  id: string;
  name: string;
  description: string;
  reward: number;
  completed: boolean;
}

export const SWTTokenCard = () => {
  const { wallet, isConnected, earnTokens } = useWallet();
  const [activities, setActivities] = useState<RewardActivity[]>([
    {
      id: 'first_transaction',
      name: 'First Transaction',
      description: 'Add your first expense or income',
      reward: 50,
      completed: false,
    },
    {
      id: 'set_budget',
      name: 'Set Monthly Budget',
      description: 'Set up your monthly spending budget',
      reward: 25,
      completed: false,
    },
    {
      id: 'daily_tracker',
      name: 'Daily Tracker',
      description: 'Track expenses for 3 consecutive days',
      reward: 30,
      completed: false,
    },
    {
      id: 'category_master',
      name: 'Category Master',
      description: 'Use all expense categories',
      reward: 40,
      completed: false,
    },
  ]);

  const [totalEarned, setTotalEarned] = useState(0);

  useEffect(() => {
    // Load completed activities from localStorage
    const completed = localStorage.getItem('spendwise_completed_activities');
    if (completed) {
      const completedIds = JSON.parse(completed);
      setActivities(prev => 
        prev.map(activity => ({
          ...activity,
          completed: completedIds.includes(activity.id)
        }))
      );
    }

    // Load total earned tokens
    const earned = localStorage.getItem('spendwise_total_earned');
    if (earned) {
      setTotalEarned(parseInt(earned));
    }
  }, []);

  const completeActivity = async (activity: RewardActivity) => {
    if (activity.completed) return;

    try {
      // Mark as completed locally
      const updatedActivities = activities.map(a => 
        a.id === activity.id ? { ...a, completed: true } : a
      );
      setActivities(updatedActivities);

      // Save to localStorage
      const completedIds = updatedActivities
        .filter(a => a.completed)
        .map(a => a.id);
      localStorage.setItem('spendwise_completed_activities', JSON.stringify(completedIds));

      // Update total earned
      const newTotal = totalEarned + activity.reward;
      setTotalEarned(newTotal);
      localStorage.setItem('spendwise_total_earned', newTotal.toString());

      // Try to earn tokens through backend (if wallet connected)
      if (isConnected && wallet) {
        try {
          await earnTokens(activity.name, activity.reward);
        } catch (error) {
          console.warn('Backend token earning failed:', error);
          // Still show success since we're tracking locally
        }
      }

      // Force update the header button by triggering a storage event
      window.dispatchEvent(new Event('storage'));

      toast.success(`🎉 Earned ${activity.reward} SWT tokens for "${activity.name}"!`);
    } catch (error) {
      toast.error('Failed to complete activity');
    }
  };

  const completedCount = activities.filter(a => a.completed).length;
  const totalRewards = activities.reduce((sum, a) => sum + a.reward, 0);

  return (
    <Card className="glass neon-border glow-on-hover">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-foreground/70 flex items-center gap-2">
          <Coins className="w-4 h-4" />
          SWT Token Rewards
          <Badge variant="secondary" className="ml-auto bg-tertiary/20 text-tertiary">
            {isConnected ? wallet?.swtBalance || '0' : totalEarned} SWT
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="p-3 bg-gradient-to-r from-tertiary/10 to-primary/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-xs text-foreground/60">
              {completedCount}/{activities.length} completed
            </span>
          </div>
          <div className="w-full bg-accent/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-tertiary to-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / activities.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-foreground/60">
            <span>Earned: {totalEarned} SWT</span>
            <span>Available: {totalRewards - totalEarned} SWT</span>
          </div>
        </div>

        {/* Activities List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Gift className="w-4 h-4" />
            Available Rewards
          </h4>
          
          {activities.map((activity) => (
            <div
              key={activity.id}
              className={`p-3 rounded-lg border transition-all ${
                activity.completed
                  ? 'bg-green-500/10 border-green-500/30'
                  : 'bg-accent/20 border-border/50 hover:border-primary/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-medium">{activity.name}</h5>
                    {activity.completed && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                  <p className="text-xs text-foreground/60 mt-1">
                    {activity.description}
                  </p>
                </div>
                <div className="text-right ml-3">
                  <div className="flex items-center gap-1 text-tertiary font-bold">
                    <Coins className="w-3 h-3" />
                    <span className="text-sm">{activity.reward}</span>
                  </div>
                  {activity.completed ? (
                    <Badge variant="secondary" className="mt-1 bg-green-500/20 text-green-400">
                      Completed
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeActivity(activity)}
                      className="mt-1 text-xs h-6"
                    >
                      Claim
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Wallet Connection Status */}
        {!isConnected && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Connect Wallet</span>
            </div>
            <p className="text-xs text-foreground/60 mt-1">
              Connect your MetaMask wallet to earn real SWT tokens on Polygon network
            </p>
          </div>
        )}

        {/* Token Info */}
        <div className="text-xs text-foreground/50 space-y-1">
          <p>• SWT tokens are earned for using SpendWise AI</p>
          <p>• Tokens are stored on Polygon Amoy testnet</p>
          <p>• Use tokens for premium features and rewards</p>
        </div>
      </CardContent>
    </Card>
  );
};
