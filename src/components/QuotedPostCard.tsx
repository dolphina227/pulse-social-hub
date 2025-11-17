import { useReadContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { formatAddress, formatTimestamp } from '@/lib/utils/format';

interface QuotedPostCardProps {
  postId: bigint;
}

export function QuotedPostCard({ postId }: QuotedPostCardProps) {
  const { data: originalPost } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'posts',
    args: [postId],
  });

  const { data: originalAuthorProfile } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'profiles',
    args: originalPost ? [originalPost[1]] : undefined,
  });

  if (!originalPost) {
    return (
      <div className="border border-border/50 rounded-lg p-4 bg-muted/30">
        <p className="text-sm text-muted-foreground">Loading quoted post...</p>
      </div>
    );
  }

  // Parse media from content
  const parseContent = (content: string) => {
    const mediaRegex = /\[media:(https?:\/\/[^\]]+)\]/g;
    const matches = [...content.matchAll(mediaRegex)];
    const mediaUrls = matches.map(match => match[1]);
    const textContent = content.replace(mediaRegex, '').trim();
    return { textContent, mediaUrls };
  };

  const { textContent, mediaUrls } = parseContent(originalPost[2]);
  const authorName = originalAuthorProfile?.[0] || formatAddress(originalPost[1]);
  const authorAvatar = originalAuthorProfile?.[2];

  return (
    <div className="border border-border/50 rounded-lg p-4 bg-muted/30 hover:bg-muted/40 transition-colors">
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          {authorAvatar ? (
            <img src={authorAvatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-pulse" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-semibold text-sm">{authorName}</p>
            <span className="text-muted-foreground text-xs">
              @{formatAddress(originalPost[1])}
            </span>
            <span className="text-muted-foreground text-xs">·</span>
            <span className="text-muted-foreground text-xs">
              {formatTimestamp(Number(originalPost[3]))}
            </span>
          </div>

          {textContent && (
            <p className="text-sm text-foreground whitespace-pre-wrap break-words mb-2">
              {textContent}
            </p>
          )}

          {mediaUrls.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-border/30">
              {mediaUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Post media"
                  className="w-full h-auto object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
