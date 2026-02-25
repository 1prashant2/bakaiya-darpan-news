
-- Create tags table
CREATE TABLE public.tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create article_tags junction table
CREATE TABLE public.article_tags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(article_id, tag_id)
);

-- Enable RLS on both tables
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;

-- Tags: anyone can read, admins/editors can manage
CREATE POLICY "Anyone can view tags" ON public.tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert tags" ON public.tags FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));
CREATE POLICY "Admins can update tags" ON public.tags FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));
CREATE POLICY "Admins can delete tags" ON public.tags FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Article_tags: anyone can read, admins/editors can manage
CREATE POLICY "Anyone can view article_tags" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "Admins can insert article_tags" ON public.article_tags FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));
CREATE POLICY "Admins can delete article_tags" ON public.article_tags FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

-- Create indexes for performance
CREATE INDEX idx_article_tags_article_id ON public.article_tags(article_id);
CREATE INDEX idx_article_tags_tag_id ON public.article_tags(tag_id);
CREATE INDEX idx_tags_slug ON public.tags(slug);
