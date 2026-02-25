import { useParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useCategory } from '@/hooks/useCategories';
import { useArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Sidebar } from '@/components/news/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: category } = useCategory(slug || '');
  const { data: articles, isLoading } = useArticles(slug);

  return (
    <Layout>
      <div className="news-container py-4 sm:py-6">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground border-l-4 border-primary pl-3 mb-4 sm:mb-6">
          {category?.name || 'श्रेणी'}
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-64 rounded-md" />
                ))}
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                यस श्रेणीमा कुनै समाचार छैन।
              </p>
            )}
          </div>
          <Sidebar />
        </div>
      </div>
    </Layout>
  );
}
