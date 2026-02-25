import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useSearchArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Sidebar } from '@/components/news/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const { data: articles, isLoading } = useSearchArticles(query);

  return (
    <Layout>
      <div className="news-container py-4 sm:py-6">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          <h1 className="text-lg sm:text-xl font-bold">खोजको नतिजा: "{query}"</h1>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-64 rounded-md" />)}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articles.map((article) => <ArticleCard key={article.id} article={article} />)}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">कुनै नतिजा भेटिएन।</p>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
    </Layout>
  );
}
