-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_address TEXT NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_address, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read roles (needed for checking admin status)
CREATE POLICY "Anyone can read user roles"
ON public.user_roles
FOR SELECT
USING (true);

-- Create security definer function to check if user has admin role
CREATE OR REPLACE FUNCTION public.is_admin(_user_address TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_address = _user_address
      AND role = 'admin'
  )
$$;

-- Create pinned_messages table
CREATE TABLE public.pinned_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.community_messages(id) ON DELETE CASCADE,
  pinned_by TEXT NOT NULL,
  pinned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (message_id)
);

-- Enable RLS on pinned_messages
ALTER TABLE public.pinned_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read pinned messages
CREATE POLICY "Anyone can read pinned messages"
ON public.pinned_messages
FOR SELECT
USING (true);

-- Policy: Only admins can pin messages
CREATE POLICY "Only admins can pin messages"
ON public.pinned_messages
FOR INSERT
WITH CHECK (public.is_admin(pinned_by));

-- Policy: Only admins can unpin messages
CREATE POLICY "Only admins can delete pinned messages"
ON public.pinned_messages
FOR DELETE
USING (public.is_admin(pinned_by));

-- Insert contract deployer as admin (replace with actual deployer address)
INSERT INTO public.user_roles (user_address, role)
VALUES ('0x2Dea1787989A8807b66EFaB66df34d870663709F', 'admin');

-- Add realtime for pinned_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.pinned_messages;

-- Create indexes for better performance
CREATE INDEX idx_user_roles_address ON public.user_roles(user_address);
CREATE INDEX idx_pinned_messages_message_id ON public.pinned_messages(message_id);