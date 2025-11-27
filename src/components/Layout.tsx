import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { WalletConnect } from './WalletConnect';
import { Home, Search, MessageSquare, Trophy, User, Plus, BarChart3, Bell, HelpCircle, Users } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import pulsechatLogo from '@/assets/pulsechat-logo.png';
import { CreatePostModal } from './CreatePostModal';
import { NewUsersWidget } from './NewUsersWidget';
import { NotificationBell } from './NotificationBell';
import { useAccount } from 'wagmi';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Search },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Community', href: '/community', icon: Users },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'How it Works', href: '/how-it-works', icon: HelpCircle },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isConnected } = useAccount();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  return (
    <>
      <CreatePostModal open={isPostModalOpen} onOpenChange={setIsPostModalOpen} />
      <div className="min-h-screen bg-background">
      <div className="container mx-auto flex">
        {/* Left Sidebar - Always visible, compact on mobile */}
        <aside className="flex flex-col w-16 md:w-60 xl:w-64 h-screen sticky top-0 border-r border-border/50 px-2 md:px-3 py-4 md:py-6 z-50 bg-background">
          <Link to="/" className="flex items-center justify-center md:justify-start gap-2 mb-4 md:mb-6 px-1 md:px-2 min-h-[40px]">
            <img src={pulsechatLogo} alt="MonX" className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0" />
            <h1 className="hidden md:block text-lg font-bold gradient-monad-text whitespace-nowrap">MonX</h1>
          </Link>

          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center justify-center md:justify-start gap-3 px-2 md:px-3 py-2.5 rounded-full text-base font-medium transition-all group cursor-pointer hover:scale-105',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted/50 hover:text-primary'
                  )}
                  title={item.name}
                >
                  <Icon className={cn("h-6 w-6 md:h-5 md:w-5 transition-transform group-hover:scale-110", isActive && "text-primary")} />
                  <span className="hidden md:inline group-hover:underline decoration-primary/50 underline-offset-4">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <Button 
            variant="gradient" 
            size="icon"
            className="hidden md:flex w-full h-11 rounded-full mb-3 md:mb-4 text-base font-semibold"
            onClick={() => setIsPostModalOpen(true)}
          >
            <Plus className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Post</span>
          </Button>

          <div className="mt-auto hidden md:block">
            <WalletConnect />
          </div>
        </aside>

        <main className="flex-1 min-h-screen border-r border-border/50">
          {children}
        </main>

        <aside className="hidden xl:flex xl:flex-col xl:w-80 h-screen sticky top-0 px-4 py-6">
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search MonX"
                className="w-full bg-muted/50 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="glass-effect rounded-2xl p-4 space-y-4">
              <h2 className="text-xl font-bold">Trending</h2>
              <div className="space-y-3">
                {['#Monad', '#DeFi', '#Web3', '#OnChain'].map((tag, i) => (
                  <div key={tag} className="py-2 hover:bg-muted/30 rounded-lg px-2 cursor-pointer transition-colors">
                    <p className="text-sm text-muted-foreground">Trending · {i + 1}</p>
                    <p className="font-semibold gradient-monad-text">{tag}</p>
                    <p className="text-sm text-muted-foreground">{Math.floor(Math.random() * 10)}K posts</p>
                  </div>
                ))}
              </div>
            </div>

            <NewUsersWidget />
          </div>
        </aside>
      </div>

      {/* Top Bar - Mobile Only (for wallet connect and notifications) */}
      <div className="md:hidden fixed top-0 left-16 right-0 z-40 border-b border-border/50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-end px-3 py-2">
          <div className="flex items-center gap-2 scale-90">
            {isConnected && <NotificationBell />}
            <WalletConnect />
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
