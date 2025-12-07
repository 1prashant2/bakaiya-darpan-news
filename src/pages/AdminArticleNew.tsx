import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ArticleForm } from '@/components/admin/ArticleForm';

export default function AdminArticleNew() {
  const { user, isAdmin, isEditor, loading: isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && (!user || (!isAdmin && !isEditor))) {
      navigate('/auth');
    }
  }, [user, isAdmin, isEditor, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isEditor)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="news-container py-4">
          <h1 className="text-xl font-bold">नयाँ समाचार थप्नुहोस्</h1>
        </div>
      </header>

      <main className="news-container py-8">
        <ArticleForm />
      </main>
    </div>
  );
}
