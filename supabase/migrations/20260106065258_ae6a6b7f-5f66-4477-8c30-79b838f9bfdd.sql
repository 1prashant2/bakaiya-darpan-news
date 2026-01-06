-- Add aspect_ratio column to advertisements table
ALTER TABLE public.advertisements 
ADD COLUMN aspect_ratio text DEFAULT 'auto';

-- Add comment for documentation
COMMENT ON COLUMN public.advertisements.aspect_ratio IS 'Custom aspect ratio: auto, 16:9, 4:3, 1:1, 3:4, 728:90, 300:250';