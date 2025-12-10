-- Add name_en column to categories for English translations
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS name_en text;

-- Create provinces table
CREATE TABLE IF NOT EXISTS public.provinces (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on provinces
ALTER TABLE public.provinces ENABLE ROW LEVEL SECURITY;

-- Anyone can view provinces
CREATE POLICY "Anyone can view provinces" ON public.provinces
  FOR SELECT USING (true);

-- Create districts table
CREATE TABLE IF NOT EXISTS public.districts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province_id uuid NOT NULL REFERENCES public.provinces(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_en text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on districts
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;

-- Anyone can view districts
CREATE POLICY "Anyone can view districts" ON public.districts
  FOR SELECT USING (true);

-- Add province_id and district_id to articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS province_id uuid REFERENCES public.provinces(id) ON DELETE SET NULL;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS district_id uuid REFERENCES public.districts(id) ON DELETE SET NULL;

-- Insert all 7 provinces of Nepal
INSERT INTO public.provinces (name, name_en, slug) VALUES
  ('प्रदेश १', 'Province 1', 'province-1'),
  ('मधेश प्रदेश', 'Madhesh Province', 'madhesh'),
  ('बागमती प्रदेश', 'Bagmati Province', 'bagmati'),
  ('गण्डकी प्रदेश', 'Gandaki Province', 'gandaki'),
  ('लुम्बिनी प्रदेश', 'Lumbini Province', 'lumbini'),
  ('कर्णाली प्रदेश', 'Karnali Province', 'karnali'),
  ('सुदूरपश्चिम प्रदेश', 'Sudurpashchim Province', 'sudurpashchim')
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Province 1
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('ताप्लेजुङ', 'Taplejung', 'taplejung'),
  ('पाँचथर', 'Panchthar', 'panchthar'),
  ('इलाम', 'Ilam', 'ilam'),
  ('झापा', 'Jhapa', 'jhapa'),
  ('मोरङ', 'Morang', 'morang'),
  ('सुनसरी', 'Sunsari', 'sunsari'),
  ('धनकुटा', 'Dhankuta', 'dhankuta'),
  ('तेह्रथुम', 'Terhathum', 'terhathum'),
  ('भोजपुर', 'Bhojpur', 'bhojpur'),
  ('संखुवासभा', 'Sankhuwasabha', 'sankhuwasabha'),
  ('सोलुखुम्बु', 'Solukhumbu', 'solukhumbu'),
  ('ओखलढुंगा', 'Okhaldhunga', 'okhaldhunga'),
  ('खोटाङ', 'Khotang', 'khotang'),
  ('उदयपुर', 'Udayapur', 'udayapur')
) AS d(name, name_en, slug)
WHERE p.slug = 'province-1'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Madhesh Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('सप्तरी', 'Saptari', 'saptari'),
  ('सिरहा', 'Siraha', 'siraha'),
  ('धनुषा', 'Dhanusha', 'dhanusha'),
  ('महोत्तरी', 'Mahottari', 'mahottari'),
  ('सर्लाही', 'Sarlahi', 'sarlahi'),
  ('रौतहट', 'Rautahat', 'rautahat'),
  ('बारा', 'Bara', 'bara'),
  ('पर्सा', 'Parsa', 'parsa')
) AS d(name, name_en, slug)
WHERE p.slug = 'madhesh'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Bagmati Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('दोलखा', 'Dolakha', 'dolakha'),
  ('सिन्धुपाल्चोक', 'Sindhupalchok', 'sindhupalchok'),
  ('रामेछाप', 'Ramechhap', 'ramechhap'),
  ('काभ्रेपलान्चोक', 'Kavrepalanchok', 'kavrepalanchok'),
  ('सिन्धुली', 'Sindhuli', 'sindhuli'),
  ('मकवानपुर', 'Makwanpur', 'makwanpur'),
  ('चितवन', 'Chitwan', 'chitwan'),
  ('काठमाडौं', 'Kathmandu', 'kathmandu'),
  ('भक्तपुर', 'Bhaktapur', 'bhaktapur'),
  ('ललितपुर', 'Lalitpur', 'lalitpur'),
  ('नुवाकोट', 'Nuwakot', 'nuwakot'),
  ('रसुवा', 'Rasuwa', 'rasuwa'),
  ('धादिङ', 'Dhading', 'dhading')
) AS d(name, name_en, slug)
WHERE p.slug = 'bagmati'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Gandaki Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('गोरखा', 'Gorkha', 'gorkha'),
  ('मनाङ', 'Manang', 'manang'),
  ('मुस्ताङ', 'Mustang', 'mustang'),
  ('म्याग्दी', 'Myagdi', 'myagdi'),
  ('कास्की', 'Kaski', 'kaski'),
  ('लमजुङ', 'Lamjung', 'lamjung'),
  ('तनहुँ', 'Tanahun', 'tanahun'),
  ('नवलपरासी (पूर्व)', 'Nawalparasi East', 'nawalparasi-east'),
  ('स्याङ्जा', 'Syangja', 'syangja'),
  ('पर्वत', 'Parbat', 'parbat'),
  ('बाग्लुङ', 'Baglung', 'baglung')
) AS d(name, name_en, slug)
WHERE p.slug = 'gandaki'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Lumbini Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('नवलपरासी (पश्चिम)', 'Nawalparasi West', 'nawalparasi-west'),
  ('रुपन्देही', 'Rupandehi', 'rupandehi'),
  ('कपिलवस्तु', 'Kapilvastu', 'kapilvastu'),
  ('अर्घाखाँची', 'Arghakhanchi', 'arghakhanchi'),
  ('गुल्मी', 'Gulmi', 'gulmi'),
  ('पाल्पा', 'Palpa', 'palpa'),
  ('रुकुम (पूर्व)', 'Rukum East', 'rukum-east'),
  ('रोल्पा', 'Rolpa', 'rolpa'),
  ('प्यूठान', 'Pyuthan', 'pyuthan'),
  ('दाङ', 'Dang', 'dang'),
  ('बाँके', 'Banke', 'banke'),
  ('बर्दिया', 'Bardiya', 'bardiya')
) AS d(name, name_en, slug)
WHERE p.slug = 'lumbini'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Karnali Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('रुकुम (पश्चिम)', 'Rukum West', 'rukum-west'),
  ('सल्यान', 'Salyan', 'salyan'),
  ('डोल्पा', 'Dolpa', 'dolpa'),
  ('हुम्ला', 'Humla', 'humla'),
  ('जुम्ला', 'Jumla', 'jumla'),
  ('कालिकोट', 'Kalikot', 'kalikot'),
  ('मुगु', 'Mugu', 'mugu'),
  ('सुर्खेत', 'Surkhet', 'surkhet'),
  ('दैलेख', 'Dailekh', 'dailekh'),
  ('जाजरकोट', 'Jajarkot', 'jajarkot')
) AS d(name, name_en, slug)
WHERE p.slug = 'karnali'
ON CONFLICT (slug) DO NOTHING;

-- Insert districts for Sudurpashchim Province
INSERT INTO public.districts (province_id, name, name_en, slug)
SELECT p.id, d.name, d.name_en, d.slug
FROM public.provinces p, (VALUES
  ('बाजुरा', 'Bajura', 'bajura'),
  ('बझाङ', 'Bajhang', 'bajhang'),
  ('डोटी', 'Doti', 'doti'),
  ('अछाम', 'Achham', 'achham'),
  ('दार्चुला', 'Darchula', 'darchula'),
  ('बैतडी', 'Baitadi', 'baitadi'),
  ('डडेलधुरा', 'Dadeldhura', 'dadeldhura'),
  ('कञ्चनपुर', 'Kanchanpur', 'kanchanpur'),
  ('कैलाली', 'Kailali', 'kailali')
) AS d(name, name_en, slug)
WHERE p.slug = 'sudurpashchim'
ON CONFLICT (slug) DO NOTHING;

-- Add new Nepal-specific categories
INSERT INTO public.categories (name, name_en, slug) VALUES
  ('शिक्षा', 'Education', 'education'),
  ('स्वास्थ्य', 'Health', 'health'),
  ('अन्तर्राष्ट्रिय', 'International', 'international'),
  ('निर्वाचन', 'Election', 'election'),
  ('विपद् अपडेट', 'Disaster Updates', 'disaster-updates'),
  ('ट्राफिक/मौसम', 'Traffic/Weather', 'traffic-weather')
ON CONFLICT (slug) DO NOTHING;

-- Update existing categories with English names
UPDATE public.categories SET name_en = 'National' WHERE slug = 'national' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Politics' WHERE slug = 'politics' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Economy' WHERE slug = 'economy' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Business' WHERE slug = 'business' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Sports' WHERE slug = 'sports' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Entertainment' WHERE slug = 'entertainment' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Opinion' WHERE slug = 'opinion' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Technology' WHERE slug = 'technology' AND name_en IS NULL;
UPDATE public.categories SET name_en = 'Blog' WHERE slug = 'blog' AND name_en IS NULL;