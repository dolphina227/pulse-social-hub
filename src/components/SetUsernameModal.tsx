import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { useWriteContract } from 'wagmi';
import { PULSECHAT_CONTRACT_ADDRESS, PULSECHAT_ABI } from '@/lib/contracts';
import { uploadImage, validateImageFile } from '@/lib/storage';

interface SetUsernameModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export function SetUsernameModal({ open, onOpenChange, onComplete }: SetUsernameModalProps) {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [uploading, setUploading] = useState(false);
  const { writeContract, isPending } = useWriteContract();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setUploading(true);
      const url = await uploadImage(file);
      setAvatar(url);
      toast.success('Profile picture uploaded!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error('Username is required');
      return;
    }

    writeContract({
      address: PULSECHAT_CONTRACT_ADDRESS,
      abi: PULSECHAT_ABI,
      functionName: 'setProfile',
      args: [name, bio, avatar],
    } as any, {
      onSuccess: () => {
        toast.success('Profile created successfully!');
        onComplete();
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error('Failed to create profile: ' + error.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Welcome to ProveChat! 👋</DialogTitle>
          <DialogDescription>
            Set up your profile to get started. Your username will be visible to everyone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative group">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-pulse flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {name ? name.slice(0, 2).toUpperCase() : '?'}
                  </span>
                </div>
              )}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 p-0"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                disabled={uploading}
              >
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Upload profile picture (optional)</p>
          </div>

          {/* Username Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Username *</label>
            <Input
              placeholder="Enter your username"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
            />
            <p className="text-xs text-muted-foreground">
              This will be your display name on ProveChat
            </p>
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Bio (optional)</label>
            <Textarea
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={160}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              {bio.length}/160 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="gradient"
              onClick={handleSave}
              disabled={isPending || uploading || !name.trim()}
              className="flex-1"
            >
              {isPending ? 'Creating...' : 'Create Profile'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
