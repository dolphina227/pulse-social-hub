import { useReadContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { formatAddress } from '@/lib/utils/format';
import { parseProfile } from '@/lib/utils/profile';
import { Link } from 'react-router-dom';
import { FollowButton } from './FollowButton';

export function NewUsersWidget() {
  const { data: leaderboardData } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'getTopUsersByFee',
    args: [5n],
  });

  const users = leaderboardData?.[0] || [];

  return (
    <div className="glass-effect rounded-2xl p-4">
      <h2 className="text-xl font-bold mb-4">New Users</h2>
      <div className="space-y-3">
        {users.length > 0 ? (
          users.map((userAddress) => {
            const UserItem = () => {
              const { data: userProfile } = useReadContract({
                address: PULSECHAT_CONTRACT_ADDRESS,
                abi: PULSECHAT_ABI,
                functionName: 'profiles',
                args: [userAddress],
              });

              const { username, displayName, avatar } = parseProfile(userProfile);
              const displayText = displayName || username || formatAddress(userAddress);

              return (
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  <Link to={`/profile/${userAddress}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {avatar ? (
                      <img src={avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-pulse flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {displayText.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{displayText}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{username || formatAddress(userAddress)}
                      </p>
                    </div>
                  </Link>
                  <FollowButton targetAddress={userAddress} />
                </div>
              );
            };

            return <UserItem key={userAddress} />;
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No users yet</p>
        )}
      </div>
    </div>
  );
}
