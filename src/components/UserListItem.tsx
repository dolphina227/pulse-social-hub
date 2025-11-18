import { useReadContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils/format';
import { parseProfile } from '@/lib/utils/profile';
import { FollowButton } from './FollowButton';

interface UserListItemProps {
  userAddress: string;
}

export function UserListItem({ userAddress }: UserListItemProps) {
  const { data: userProfile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: [userAddress as `0x${string}`],
  });

  const { username, displayName, avatar } = parseProfile(userProfile);
  const displayText = displayName || username || formatAddress(userAddress);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3 flex-1">
        {avatar ? (
          <img src={avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-pulse flex items-center justify-center">
            <span className="text-sm font-bold text-white">
              {displayText.slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}
        <div>
          <p className="font-semibold">{displayText}</p>
          <p className="text-sm text-muted-foreground">
            @{username || formatAddress(userAddress)}
          </p>
        </div>
      </div>
      <FollowButton targetAddress={userAddress} />
    </div>
  );
}
