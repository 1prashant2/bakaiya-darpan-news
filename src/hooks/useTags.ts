import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tag } from '@/lib/types';

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data as Tag[];
    },
  });
}

export function useArticleTags(articleId: string | undefined) {
  return useQuery({
    queryKey: ['article-tags', articleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('article_tags')
        .select('*, tags(*)')
        .eq('article_id', articleId!);
      if (error) throw error;
      return (data || []).map((at: any) => ({
        ...at,
        tag: at.tags,
      }));
    },
    enabled: !!articleId,
  });
}

export async function upsertTagsByName(tagNames: string[]): Promise<Tag[]> {
  const tags: Tag[] = [];
  for (const name of tagNames) {
    const trimmed = name.trim();
    if (!trimmed) continue;
    const slug = trimmed.toLowerCase().replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '').replace(/\s+/g, '-');
    
    // Try to find existing tag
    const { data: existing } = await supabase
      .from('tags')
      .select('*')
      .eq('name', trimmed)
      .maybeSingle();
    
    if (existing) {
      tags.push(existing as Tag);
    } else {
      const { data: created, error } = await supabase
        .from('tags')
        .insert({ name: trimmed, slug })
        .select()
        .single();
      if (!error && created) tags.push(created as Tag);
    }
  }
  return tags;
}

export async function syncArticleTags(articleId: string, tagIds: string[]) {
  // Delete existing
  await supabase.from('article_tags').delete().eq('article_id', articleId);
  
  // Insert new
  if (tagIds.length > 0) {
    const rows = tagIds.map(tag_id => ({ article_id: articleId, tag_id }));
    await supabase.from('article_tags').insert(rows);
  }
}
