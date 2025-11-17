import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { parseUSDC } from '@/lib/utils/format';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';

interface TipModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientAddress: string;
  recipientName?: string;
}

export function TipModal({ open, onOpenChange, recipientAddress, recipientName }: TipModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  });

  const { writeContract, isPending } = useWriteContract();

  const handleTip = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      const amountInSmallestUnit = parseUSDC(amount);

      writeContract({
        address: PULSECHAT_CONTRACT_ADDRESS,
        abi: PULSECHAT_ABI,
        functionName: 'tipUSDC',
        args: [recipientAddress, amountInSmallestUnit, note || ''],
      } as any, {
        onSuccess: () => {
          toast.success('Tip sent successfully!');
          setAmount('');
          setNote('');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error('Failed to send tip: ' + error.message);
        },
      });
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    }
  };

  const feeHuman = feeAmount ? (Number(feeAmount) / 1e6).toFixed(2) : '0.01';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tip USDC</DialogTitle>
          <DialogDescription>
            Send USDC tip to {recipientName || recipientAddress}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="tip-amount">Amount (USDC)</Label>
            <Input
              id="tip-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="tip-note">Note (optional)</Label>
            <div className="flex gap-2">
              <Textarea
                id="tip-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message..."
                className="flex-1"
              />
              <EmojiPicker onEmojiSelect={(emoji) => setNote(note + emoji)} />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              You will tip <span className="font-bold text-foreground">{amount || '0'} USDC</span> and pay{' '}
              <span className="font-bold text-foreground">{feeHuman} USDC</span> platform fee.
            </p>
          </div>

          <Button
            onClick={handleTip}
            disabled={isPending || !amount}
            variant="gradient"
            className="w-full"
          >
            {isPending ? 'Sending...' : `Send Tip`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
