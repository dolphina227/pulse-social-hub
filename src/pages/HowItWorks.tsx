import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, MessageSquare, Heart, Repeat2, DollarSign, Shield, Coins, TrendingUp, Share2 } from 'lucide-react';

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-16 md:pt-6 pb-8">
      <div className="border-b border-border/50 p-4 sticky top-16 md:top-0 bg-background/95 backdrop-blur z-10 mb-6">
        <h1 className="text-3xl font-bold gradient-pulse-text">How ProveChat Works</h1>
        <p className="text-muted-foreground mt-2">Your decentralized social network on PulseChain</p>
      </div>

      <div className="space-y-6">
        {/* Introduction */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-pulse-cyan" />
              Welcome to ProveChat
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              ProveChat is a fully decentralized social media platform built on the PulseChain blockchain. 
              Every post, comment, message, and interaction is permanently stored on-chain, ensuring true 
              ownership and transparency.
            </p>
            <p className="text-muted-foreground text-sm">
              Connect your Web3 wallet to start posting, commenting, and engaging with the community!
            </p>
          </CardContent>
        </Card>

        {/* Core Features */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-pulse-blue" />
                Posts & Feed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Create posts with text and media. All posts are stored permanently on PulseChain.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Share thoughts, images, and videos</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Browse latest posts from the community</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>View profiles and user statistics</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-pulse-purple" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Engage in conversations by commenting on posts. Comments require a small USDC fee.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Reply to any post with your thoughts</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>All comments stored on-chain</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Fee: 0.01 USDC per comment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5 text-pulse-magenta" />
                Likes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Show appreciation for posts you enjoy. Likes are free and managed locally.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Like posts instantly with no fees</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>UI-only feature for quick interactions</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>No blockchain transaction required</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Repeat2 className="h-5 w-5 text-pulse-blue" />
                Reposts & Quotes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Share posts with your followers or add your own commentary.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span><strong>Simple Repost:</strong> Free, UI-only sharing</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span><strong>Quote:</strong> Add your comment (0.01 USDC)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Quotes create new on-chain posts</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Share2 className="h-5 w-5 text-pulse-cyan" />
                Share Posts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Share posts outside ProveChat with direct links to specific content.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Generate shareable links to posts</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Copy link or use native share</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Completely free to share</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="h-5 w-5 text-pulse-purple" />
                USDC Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Support creators directly by sending USDC tips for great content.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Tip any amount of USDC to post authors</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Platform fee: 0.01 USDC per tip</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-pulse-cyan">•</span>
                  <span>Direct wallet-to-wallet transfers</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fees Section */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-pulse-cyan" />
              Platform Fees
            </CardTitle>
            <CardDescription>
              Understanding the cost of on-chain interactions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm">
              ProveChat charges a small fee of <strong className="text-pulse-cyan">0.01 USDC</strong> for 
              most on-chain actions to cover blockchain transaction costs and maintain the platform.
            </p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm font-medium">Creating Posts</span>
                <span className="text-sm text-pulse-cyan">0.01 USDC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm font-medium">Comments</span>
                <span className="text-sm text-pulse-cyan">0.01 USDC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm font-medium">Quote Posts</span>
                <span className="text-sm text-pulse-cyan">0.01 USDC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm font-medium">Direct Messages</span>
                <span className="text-sm text-pulse-cyan">0.01 USDC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm font-medium">PLS Transfers</span>
                <span className="text-sm text-pulse-cyan">0.01 USDC</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-sm font-medium">Likes & Simple Reposts</span>
                <span className="text-sm text-green-500 font-semibold">FREE</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <span className="text-sm font-medium">Updating Profile</span>
                <span className="text-sm text-green-500 font-semibold">FREE</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              💡 <strong>Tip:</strong> You'll need to approve USDC spending to the ProveChat contract 
              before your first paid action. This is a one-time approval per wallet.
            </p>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pulse-magenta" />
              Leaderboard & Analytics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Track the most active community members and monitor platform growth.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-pulse-cyan">•</span>
                <span><strong>Leaderboard:</strong> Users ranked by total fees paid (activity level)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pulse-cyan">•</span>
                <span><strong>Analytics:</strong> View global stats on posts, users, comments, and messages</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-pulse-cyan">•</span>
                <span><strong>Profile Stats:</strong> Track your own posts, comments, tips sent/received</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="border-border/50 bg-gradient-to-br from-pulse-cyan/5 to-pulse-purple/5">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pulse-cyan/20 flex items-center justify-center text-pulse-cyan font-bold">
                  1
                </div>
                <div>
                  <h4 className="font-medium">Connect Your Wallet</h4>
                  <p className="text-sm text-muted-foreground">
                    Make sure you're on PulseChain network (Chain ID: 369) and connect your Web3 wallet.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pulse-blue/20 flex items-center justify-center text-pulse-blue font-bold">
                  2
                </div>
                <div>
                  <h4 className="font-medium">Get USDC</h4>
                  <p className="text-sm text-muted-foreground">
                    Acquire USDC on PulseChain to pay for on-chain actions. You'll need a small amount to get started.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pulse-magenta/20 flex items-center justify-center text-pulse-magenta font-bold">
                  3
                </div>
                <div>
                  <h4 className="font-medium">Approve USDC</h4>
                  <p className="text-sm text-muted-foreground">
                    When you create your first post or comment, you'll need to approve USDC spending. This is a one-time setup.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-pulse-purple/20 flex items-center justify-center text-pulse-purple font-bold">
                  4
                </div>
                <div>
                  <h4 className="font-medium">Start Engaging!</h4>
                  <p className="text-sm text-muted-foreground">
                    Create posts, comment, tip creators, and build your on-chain social presence.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transparency Note */}
        <Card className="border-border/50 bg-yellow-500/5 border-yellow-500/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Shield className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-yellow-500">Important: On-Chain Transparency</h4>
                <p className="text-sm text-muted-foreground">
                  All data on ProveChat is stored on the public PulseChain blockchain. This means posts, 
                  comments, and direct messages are publicly readable by anyone. "Private" messages are only 
                  private at the UI level - they exist on-chain and can be viewed by anyone with blockchain access.
                </p>
                <p className="text-sm text-muted-foreground">
                  This transparency is a feature of blockchain technology, ensuring true ownership and 
                  immutability of your content.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
