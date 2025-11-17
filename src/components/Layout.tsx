import { Link, useLocation } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';
import { Home, Search, MessageSquare, Trophy, User, Plus, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import pulsechatLogo from '@/assets/pulsechat-logo.png';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto flex">
        {/* Left Sidebar - Desktop */}
        <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 h-screen sticky top-0 border-r border-border/50 px-4 py-6">
          <Link to="/" className="flex items-center gap-3 mb-8 px-3">
            <img src={pulsechatLogo} alt="ProveChat" className="h-14 w-14" />
            <h1 className="text-2xl font-bold gradient-pulse-text">ProveChat</h1>
          </Link>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-4 px-4 py-3 rounded-full text-xl font-medium transition-all group',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted/50'
                  )}
                >
                  <Icon className={cn("h-7 w-7 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <Link to="/">
            <Button variant="gradient" size="lg" className="w-full rounded-full mb-4 text-lg h-12">
              <Plus className="h-5 w-5 mr-2" />
              Post
            </Button>
          </Link>

          <div className="mt-auto">
            <WalletConnect />
          </div>
        </aside>

        <main className="flex-1 min-h-screen border-r border-border/50 pb-20 lg:pb-0">
          {children}
        </main>

        <aside className="hidden xl:flex xl:flex-col xl:w-80 h-screen sticky top-0 px-4 py-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ProveChat"
                className="w-full bg-muted/50 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="glass-effect rounded-2xl p-4 space-y-4">
              <h2 className="text-xl font-bold">Trending</h2>
              <div className="space-y-3">
                {['#PulseChain', '#DeFi', '#Web3', '#OnChain'].map((tag, i) => (
                  <div key={tag} className="py-2 hover:bg-muted/30 rounded-lg px-2 cursor-pointer transition-colors">
                    <p className="text-sm text-muted-foreground">Trending · {i + 1}</p>
                    <p className="font-semibold gradient-pulse-text">{tag}</p>
                    <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 10)}K posts</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-effect rounded-2xl p-4 space-y-4">
              <h2 className="text-xl font-bold">Who to follow</h2>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-pulse" />
                      <div>
                        <p className="font-semibold text-sm">User {i}</p>
                        <p className="text-xs text-muted-foreground">@user{i}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="rounded-full">
                      Follow
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 glass-effect">
        <div className="grid grid-cols-6 gap-1 p-2">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all',
                  isActive ? 'text-primary bg-primary/10' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px]">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 border-b border-border/50 glass-effect">
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3">
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2">
            <img src={pulsechatLogo} alt="ProveChat" className="h-8 w-8 sm:h-10 sm:w-10" />
            <h1 className="text-base sm:text-lg font-bold gradient-pulse-text">ProveChat</h1>
          </Link>
          <div className="scale-90 sm:scale-100">
            <WalletConnect />
          </div>
        </div>
      </div>
    </div>
  );
}
