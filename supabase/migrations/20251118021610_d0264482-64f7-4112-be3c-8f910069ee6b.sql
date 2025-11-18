-- Create community_messages table for ProveChat community chat
CREATE TABLE public.community_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_address TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read community messages
CREATE POLICY "Anyone can read community messages" 
ON public.community_messages 
FOR SELECT 
USING (true);

-- Create policy to allow anyone to insert community messages
CREATE POLICY "Anyone can insert community messages" 
ON public.community_messages 
FOR INSERT 
WITH CHECK (true);

-- Add realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;

-- Create index for faster queries
CREATE INDEX idx_community_messages_created_at ON public.community_messages(created_at DESC);