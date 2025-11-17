import { useEffect, useRef, useState } from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { Smile } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

export function EmojiPicker({ onEmojiSelect }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 border-0" align="start">
        <Picker
          data={data}
          onEmojiSelect={(emoji: any) => {
            onEmojiSelect(emoji.native);
            setOpen(false);
          }}
          theme="dark"
        />
      </PopoverContent>
    </Popover>
  );
}
