-- Create site_settings table for storing contact info and social links
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can view settings (needed for footer)
CREATE POLICY "Anyone can view site settings"
  ON public.site_settings
  FOR SELECT
  USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings"
  ON public.site_settings
  FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can insert site settings"
  ON public.site_settings
  FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings
  FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_name', 'प्रेस दर्पण'),
  ('site_description', 'नेपालको विश्वसनीय समाचार स्रोत'),
  ('contact_phone', '+977-1-XXXXXXX'),
  ('contact_email', 'info@pressdarpan.com'),
  ('contact_address', 'काठमाडौं, नेपाल'),
  ('facebook_url', ''),
  ('twitter_url', ''),
  ('youtube_url', ''),
  ('instagram_url', ''),
  ('whatsapp_number', '');

-- Create trigger for updated_at
CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
