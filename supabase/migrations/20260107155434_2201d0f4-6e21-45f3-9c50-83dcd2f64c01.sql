-- Create a function to track share counts
CREATE OR REPLACE FUNCTION increment_share_count(article_id UUID, platform TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- For now, we'll just log the share event
  -- You can extend this to store in a separate shares table if needed
  UPDATE articles 
  SET view_count = COALESCE(view_count, 0) + 1 
  WHERE id = article_id;
END;
$$;