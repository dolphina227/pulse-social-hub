import { Button } from './ui/button';
import { useFollow } from '@/hooks/useFollow';
import { useAccount } from 'wagmi';
import { toast } from 'sonner';

interface FollowButtonProps {
  targetAddress: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export function FollowButton({ targetAddress, variant = 'outline', size = 'sm', className }: FollowButtonProps) {
  const { address } = useAccount();
  const { isFollowing, followUser, unfollowUser } = useFollow();
  
  const isOwnProfile = address?.toLowerCase() === targetAddress.toLowerCase();
  const following = isFollowing(targetAddress);

  if (isOwnProfile) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (following) {
      unfollowUser(targetAddress);
      toast.success('Unfollowed');
    } else {
      followUser(targetAddress);
      toast.success('Following!');
    }
  };

  return (
    <Button
      variant={following ? 'outline' : 'default'}
      size={size}
      onClick={handleClick}
      className={className}
    >
      {following ? 'Following' : 'Follow'}
    </Button>
  );
}
