import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function BreakingNewsTicker() {
  const { data: breakingArticles } = useQuery({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      // is_breaking is a new column not yet in generated types
      const query = supabase
        .from('articles')
        .select('id, title, slug')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);
      
      // Filter by is_breaking using the filter method
      const { data, error } = await (query as any).eq('is_breaking', true);
      if (error) throw error;
      return (data || []) as Array<{ id: string; title: string; slug: string }>;
    },
    refetchInterval: 60000,
  });

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!breakingArticles?.length) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % breakingArticles.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [breakingArticles?.length]);

  if (!breakingArticles?.length) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="news-container flex items-center gap-3 py-2">
        <div className="flex items-center gap-1.5 flex-shrink-0 bg-primary-foreground/20 px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide animate-pulse">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>ब्रेकिङ</span>
        </div>
        <div className="overflow-hidden flex-1 relative h-6">
          {breakingArticles.map((article, index) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className={`absolute inset-0 flex items-center text-sm font-medium hover:underline transition-all duration-500 ${
                index === currentIndex
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-4'
              }`}
            >
              {article.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
