import { useReadContract } from 'wagmi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { BarChart3, Users, MessageSquare, FileText, Hash } from 'lucide-react';

export default function Analytics() {
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

  const stats = [
    {
      title: 'Total Posts',
      value: totalPosts?.toString() || '0',
      icon: FileText,
      gradient: 'from-pulse-cyan to-pulse-blue',
      color: 'text-pulse-cyan',
    },
    {
      title: 'Total Users',
      value: totalUsers?.toString() || '0',
      icon: Users,
      gradient: 'from-pulse-blue to-pulse-magenta',
      color: 'text-pulse-blue',
    },
    {
      title: 'Total Comments',
      value: totalComments?.toString() || '0',
      icon: Hash,
      gradient: 'from-pulse-magenta to-pulse-purple',
      color: 'text-pulse-magenta',
    },
    {
      title: 'Total Messages',
      value: totalMessages?.toString() || '0',
      icon: MessageSquare,
      gradient: 'from-pulse-purple to-pulse-cyan',
      color: 'text-pulse-purple',
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 pt-16 lg:pt-0">
      <div className="border-b border-border/50 p-4 md:p-6 sticky top-16 lg:top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Analytics</h2>
        </div>
        <p className="text-muted-foreground mt-2">Platform statistics and insights</p>
      </div>

      <div className="p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="glass-effect border-border/50 overflow-hidden group hover:border-primary/30 transition-all">
                <CardHeader className="pb-3">
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-background" />
                  </div>
                  <CardTitle className="text-sm text-muted-foreground font-normal">
                    {stat.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={`text-4xl md:text-5xl font-bold ${stat.color}`}>
                    {stat.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Average Posts per User</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalUsers && Number(totalUsers) > 0
                    ? (Number(totalPosts) / Number(totalUsers)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <p className="text-sm text-muted-foreground mb-1">Average Comments per Post</p>
                <p className="text-2xl font-bold text-foreground">
                  {totalPosts && Number(totalPosts) > 0
                    ? (Number(totalComments) / Number(totalPosts)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-effect border-border/50">
          <CardHeader>
            <CardTitle>About Analytics</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>
              All statistics are fetched directly from the PulseChain blockchain in real-time.
            </p>
            <p>
              These metrics represent the total activity on the PULSECHAT decentralized social platform.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
