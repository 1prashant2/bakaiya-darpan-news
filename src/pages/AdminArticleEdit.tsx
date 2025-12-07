import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArticleForm } from '@/components/admin/ArticleForm';
import { Article } from '@/lib/types';
import { Loader2 } from 'lucide-react';

export default function AdminArticleEdit() {
  const { id } = useParams<{ id: string }>();
  const { user, isAdmin, isEditor, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isEditor))) {
      navigate('/auth');
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  const { data: article, isLoading } = useQuery({
    queryKey: ['admin-article', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Article;
    },
    enabled: !!id && !!user && (isAdmin || isEditor),
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || (!isAdmin && !isEditor)) {
    return null;
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">समाचार फेला परेन</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="news-container py-4">
          <h1 className="text-xl font-bold">समाचार सम्पादन गर्नुहोस्</h1>
        </div>
      </header>

      <main className="news-container py-8">
        <ArticleForm article={article} isEditing />
      </main>
    </div>
  );
}
