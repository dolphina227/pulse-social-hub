import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { parseEther } from 'viem';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { toast } from 'sonner';
import { EmojiPicker } from './EmojiPicker';

interface PLSTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientAddress: string;
  recipientName?: string;
}

export function PLSTransferModal({ open, onOpenChange, recipientAddress, recipientName }: PLSTransferModalProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');

  const { data: feeAmount } = useReadContract({
    address: PULSECHAT_CONTRACT_ADDRESS,
    abi: PULSECHAT_ABI,
    functionName: 'feeAmount',
  });

  const { writeContract, isPending } = useWriteContract();

  const handleTransfer = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid PLS amount');
      return;
    }

    if (!note.trim()) {
      toast.error('Please add a note');
      return;
    }

    try {
      const amountWei = parseEther(amount);

      writeContract({
        address: PULSECHAT_CONTRACT_ADDRESS,
        abi: PULSECHAT_ABI,
        functionName: 'sendPlsWithNote',
        args: [recipientAddress, note],
        value: amountWei,
      } as any, {
        onSuccess: () => {
          toast.success('PLS sent successfully!');
          setAmount('');
          setNote('');
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error('Failed to send PLS: ' + error.message);
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
          <DialogTitle>Send PLS</DialogTitle>
          <DialogDescription>
            Send PLS with a note to {recipientName || recipientAddress}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="pls-amount">Amount (PLS)</Label>
            <Input
              id="pls-amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="pls-note">Note</Label>
            <div className="flex gap-2">
              <Textarea
                id="pls-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message..."
                className="flex-1"
                required
              />
              <EmojiPicker onEmojiSelect={(emoji) => setNote(note + emoji)} />
            </div>
          </div>

          <div className="bg-muted/50 p-3 rounded-lg text-sm">
            <p className="text-muted-foreground">
              This sends <span className="font-bold text-foreground">{amount || '0'} PLS</span> on-chain with your note.
              <br />
              Platform fee: <span className="font-bold text-foreground">{feeHuman} USDC</span>
            </p>
          </div>

          <Button
            onClick={handleTransfer}
            disabled={isPending || !amount || !note.trim()}
            variant="gradient"
            className="w-full"
          >
            {isPending ? 'Sending...' : 'Send PLS'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
