import { useAccount, useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { Trophy, TrendingUp, AlertCircle } from 'lucide-react';
import { formatAddress, formatUSDC } from '@/lib/utils/format';

export default function Leaderboard() {
  const { isConnected } = useAccount();

  const { data: leaderboardData } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getTopUsersByFee',
    args: [20n],
  });

  const { data: totalPosts } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalPosts',
  });

  const { data: totalUsers } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalUsers',
  });

  const { data: totalComments } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalComments',
  });

  const { data: totalMessages } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'totalMessages',
  });

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Connect wallet to view leaderboard</AlertDescription>
        </Alert>
      </div>
    );
  }

  const users = leaderboardData?.[0] || [];
  const fees = leaderboardData?.[1] || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6 px-4 md:px-0 pt-16 lg:pt-0">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pulse-cyan">{totalPosts?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground mt-1">Posts</p>
          </CardContent>
        </Card>
        
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pulse-blue">{totalUsers?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground mt-1">Users</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pulse-magenta">{totalComments?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground mt-1">Comments</p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-pulse-purple">{totalMessages?.toString() || '0'}</p>
            <p className="text-sm text-muted-foreground mt-1">Messages</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-effect">
        <CardHeader>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-pulse-cyan" />
            Top Users by Fees
          </h2>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user, index) => (
                <div
                  key={user}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    index < 3 ? 'bg-gradient-pulse-subtle border border-primary/20' : 'bg-muted/30'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-pulse text-white font-bold text-sm flex items-center justify-center">
                    {index + 1}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-pulse" />

                  <div className="flex-1">
                    <p className="font-semibold">{formatAddress(user)}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-lg gradient-pulse-text">{formatUSDC(fees[index])} USDC</p>
                    <p className="text-xs text-muted-foreground">Fees Paid</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
