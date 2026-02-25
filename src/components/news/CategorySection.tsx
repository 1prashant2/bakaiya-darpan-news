import { Link } from 'react-router-dom';
import { useArticles } from '@/hooks/useArticles';
import { ArticleCard } from './ArticleCard';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySectionProps {
  categoryName: string;
  categorySlug: string;
  limit?: number;
}

export function CategorySection({ categoryName, categorySlug, limit = 4 }: CategorySectionProps) {
  const { data: articles, isLoading } = useArticles(categorySlug, limit);

  if (isLoading) {
    return (
      <section className="mb-8">
        <div className="news-section-title">{categoryName}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-md" />
          ))}
        </div>
      </section>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h2 className="news-section-title mb-0">{categoryName}</h2>
        <Link
          to={`/category/${categorySlug}`}
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
        >
          अरु हेर्नुहोस्
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
      </div>
    </section>
  );
}
