import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Article } from '@/lib/types';

export function useArticles(categorySlug?: string, limit?: number) {
  return useQuery({
    queryKey: ['articles', categorySlug, limit],
    queryFn: async () => {
      let query = supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (categorySlug) {
        const { data: category } = await supabase
          .from('categories')
          .select('id')
          .eq('slug', categorySlug)
          .single();
        
        if (category) {
          query = query.eq('category_id', category.id);
        }
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useFeaturedArticles(limit = 3) {
  return useQuery({
    queryKey: ['featured-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: ['article', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!slug,
  });
}

export function useRecentArticles(limit = 5) {
  return useQuery({
    queryKey: ['recent-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useTrendingArticles(limit = 5) {
  return useQuery({
    queryKey: ['trending-articles', limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('is_published', true)
        .order('view_count', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useSearchArticles(searchQuery: string) {
  return useQuery({
    queryKey: ['search-articles', searchQuery],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('is_published', true)
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
    enabled: searchQuery.length > 2,
  });
}
