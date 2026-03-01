-- Add social link fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS facebook_url TEXT,
ADD COLUMN IF NOT EXISTS x_url TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;