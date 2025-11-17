import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Image, Video, X } from 'lucide-react';
import { uploadImage, validateImageFile } from '@/lib/storage';
import { toast } from 'sonner';

interface MediaUploadProps {
  onMediaSelect: (url: string) => void;
  onMediaRemove: () => void;
  mediaUrl?: string;
}

export function MediaUpload({ onMediaSelect, onMediaRemove, mediaUrl }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setUploading(true);
      const url = await uploadImage(file);
      onMediaSelect(url);
      toast.success('Media uploaded!');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {mediaUrl ? (
        <div className="relative inline-block">
          <img src={mediaUrl} alt="Upload preview" className="h-32 rounded-lg object-cover" />
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
            onClick={onMediaRemove}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      ) : (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Image className="h-5 w-5 text-pulse-cyan" />
          </Button>
        </>
      )}
    </div>
  );
}
