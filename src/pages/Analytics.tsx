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
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-16 lg:pt-0">
      <div className="p-6 space-y-8">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={index} 
                className="glass-effect border-border/50 overflow-hidden group hover:border-primary/50 transition-all hover:shadow-glow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="h-7 w-7 text-background" />
                    </div>
                  </div>
                  <div>
                    <p className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      {stat.title}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Overview */}
        <Card className="glass-effect border-border/50">
          <CardHeader className="border-b border-border/50">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-primary" />
              </div>
              Platform Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-xl bg-gradient-to-br from-pulse-cyan/5 to-pulse-blue/5 border border-pulse-cyan/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-pulse-cyan/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-pulse-cyan" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Average Posts per User</p>
                </div>
                <p className="text-4xl font-bold text-pulse-cyan">
                  {totalUsers && Number(totalUsers) > 0
                    ? (Number(totalPosts) / Number(totalUsers)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
              
              <div className="p-6 rounded-xl bg-gradient-to-br from-pulse-magenta/5 to-pulse-purple/5 border border-pulse-magenta/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-pulse-magenta/10 flex items-center justify-center">
                    <Hash className="h-5 w-5 text-pulse-magenta" />
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">Average Comments per Post</p>
                </div>
                <p className="text-4xl font-bold text-pulse-magenta">
                  {totalPosts && Number(totalPosts) > 0
                    ? (Number(totalComments) / Number(totalPosts)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About Section */}
        <Card className="glass-effect border-border/50 bg-gradient-to-br from-muted/30 to-background">
          <CardHeader>
            <CardTitle className="text-xl">About Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="w-1 bg-gradient-pulse rounded-full"></div>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed">
                  All statistics are fetched directly from the PulseChain blockchain in real-time, ensuring complete transparency and accuracy.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These metrics represent the total activity on the ProveChat decentralized social platform, where every interaction is permanently recorded on-chain.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
