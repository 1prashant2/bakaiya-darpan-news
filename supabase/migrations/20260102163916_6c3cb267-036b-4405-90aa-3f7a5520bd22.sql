-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  ad_type TEXT NOT NULL CHECK (ad_type IN ('image', 'video', 'product')),
  media_url TEXT NOT NULL,
  link_url TEXT,
  placement TEXT NOT NULL CHECK (placement IN ('header', 'sidebar', 'between_articles', 'footer')),
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1,
  view_count INTEGER NOT NULL DEFAULT 0,
  click_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active ads"
ON public.advertisements
FOR SELECT
USING (is_active = true AND now() BETWEEN start_date AND end_date);

CREATE POLICY "Admins can view all ads"
ON public.advertisements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert ads"
ON public.advertisements
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can update ads"
ON public.advertisements
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete ads"
ON public.advertisements
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Create trigger for updated_at
CREATE TRIGGER update_advertisements_updated_at
BEFORE UPDATE ON public.advertisements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for ad media
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-media', 'ad-media', true);

-- Storage policies for ad media
CREATE POLICY "Anyone can view ad media"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-media');

CREATE POLICY "Admins can upload ad media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'ad-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Admins can update ad media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'ad-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));

CREATE POLICY "Admins can delete ad media"
ON storage.objects FOR DELETE
USING (bucket_id = 'ad-media' AND (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role)));