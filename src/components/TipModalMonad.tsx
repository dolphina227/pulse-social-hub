import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useAccount, useChainId } from 'wagmi';
import { useTip } from '@/hooks/useTip';
import { useUSDC } from '@/hooks/useUSDC';
import { useSwitchNetwork } from '@/hooks/useSwitchNetwork';
import { calcFee, calcNet } from '@/config/contracts';
import { MONAD_CHAIN_ID } from '@/config/monad';
import { Loader2 } from 'lucide-react';

interface TipModalMonadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recipientAddress: string;
  recipientName?: string;
}

export function TipModalMonad({ open, onOpenChange, recipientAddress, recipientName }: TipModalMonadProps) {
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { balanceFormatted, formatUSDC, parseUSDC, allowance } = useUSDC();
  const { sendTip, needsApprove, isApproving, isTipping, isTipSuccess } = useTip();
  const { switchToMonad, isSwitching } = useSwitchNetwork();

  const isWrongNetwork = chainId !== MONAD_CHAIN_ID;

  const handleSubmit = async () => {
    const result = await sendTip({
      to: recipientAddress,
      amountStr: amount,
      note,
    });

    if (result.success || isTipSuccess) {
      setAmount('');
      setNote('');
      onOpenChange(false);
    }
  };

  const amountBigInt = amount ? parseUSDC(amount) : 0n;
  const feeAmount = calcFee(amountBigInt);
  const netAmount = calcNet(amountBigInt);
  const hasEnoughBalance = amountBigInt > 0n && parseUSDC(balanceFormatted) >= amountBigInt;
  const hasEnoughAllowance = allowance >= amountBigInt;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="gradient-monad-text">Send USDC Tip</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Recipient</Label>
            <p className="text-sm text-muted-foreground mt-1">
              {recipientName || recipientAddress.slice(0, 6) + '...' + recipientAddress.slice(-4)}
            </p>
          </div>

          <div>
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">Balance: {balanceFormatted} USDC</p>
          </div>

          <div>
            <Label htmlFor="note">Note (optional)</Label>
            <Textarea
              id="note"
              placeholder="Add a message..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          {amount && parseFloat(amount) > 0 && (
            <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount:</span>
                <span>{amount} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee (1%):</span>
                <span>{formatUSDC(feeAmount)} USDC</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2">
                <span className="font-medium">Recipient gets:</span>
                <span className="font-medium text-primary">{formatUSDC(netAmount)} USDC</span>
              </div>
            </div>
          )}

          {!hasEnoughBalance && amount && parseFloat(amount) > 0 && (
            <p className="text-sm text-destructive">Insufficient USDC balance</p>
          )}

          {!isConnected ? (
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Connect Wallet First
            </Button>
          ) : isWrongNetwork ? (
            <Button onClick={switchToMonad} disabled={isSwitching} className="w-full">
              {isSwitching ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Switch to Monad'}
            </Button>
          ) : needsApprove || !hasEnoughAllowance ? (
            <Button onClick={handleSubmit} disabled={isApproving || !hasEnoughBalance} className="w-full">
              {isApproving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isApproving ? 'Approving...' : 'Approve USDC'}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isTipping || !hasEnoughBalance || !amount} 
              variant="gradient"
              className="w-full"
            >
              {isTipping ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isTipping ? 'Sending...' : 'Send Tip'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
