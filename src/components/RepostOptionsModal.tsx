import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Repeat2, MessageSquare } from 'lucide-react';

interface RepostOptionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRepost: () => void;
  onQuote: () => void;
  isReposted?: boolean;
}

export function RepostOptionsModal({
  open,
  onOpenChange,
  onRepost,
  onQuote,
  isReposted,
}: RepostOptionsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Repost options</DialogTitle>
        </DialogHeader>

        <div className="space-y-2">
          <Button
            onClick={() => {
              onRepost();
              onOpenChange(false);
            }}
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <Repeat2 className="h-5 w-5" />
            <div className="flex-1 text-left">
              <p className="font-semibold">{isReposted ? 'Undo Repost' : 'Repost'}</p>
              <p className="text-xs text-muted-foreground">
                {isReposted ? 'Remove from your profile' : 'Share instantly to your profile'}
              </p>
            </div>
          </Button>

          <Button
            onClick={() => {
              onOpenChange(false);
              onQuote();
            }}
            variant="ghost"
            className="w-full justify-start gap-3 h-auto py-3"
          >
            <MessageSquare className="h-5 w-5" />
            <div className="flex-1 text-left">
              <p className="font-semibold">Quote</p>
              <p className="text-xs text-muted-foreground">Add your thoughts (costs USDC)</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
