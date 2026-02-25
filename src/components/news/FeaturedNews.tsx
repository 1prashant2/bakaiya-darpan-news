import { Link } from 'react-router-dom';
import { useFeaturedArticles } from '@/hooks/useArticles';
import { formatDistanceToNow } from 'date-fns';
import { Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function FeaturedNews() {
  const { data: articles, isLoading } = useFeaturedArticles(3);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Skeleton className="aspect-news-featured w-full rounded-md" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-md" />
          <Skeleton className="h-40 w-full rounded-md" />
        </div>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  const [mainArticle, ...sideArticles] = articles;

  return (
    <section className="mb-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Main featured article */}
        <Link
          to={`/article/${mainArticle.slug}`}
          className="md:col-span-2 lg:col-span-2 group relative overflow-hidden rounded-md"
        >
          <div className="aspect-news-featured overflow-hidden">
            <img
              src={mainArticle.image_url || '/placeholder.svg'}
              alt={mainArticle.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
          <div className="news-featured-overlay" />
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-primary-foreground">
            {mainArticle.categories && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-primary rounded mb-2">
                {mainArticle.categories.name}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold leading-tight mb-2 group-hover:text-primary transition-colors">
              {mainArticle.title}
            </h2>
            <p className="text-sm text-primary-foreground/80 line-clamp-2 hidden sm:block">
              {mainArticle.excerpt}
            </p>
            <div className="flex items-center gap-2 mt-3 text-xs text-primary-foreground/70">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(mainArticle.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </Link>

        {/* Side articles */}
        <div className="space-y-4">
          {sideArticles.map((article) => (
            <Link
              key={article.id}
              to={`/article/${article.slug}`}
              className="group relative overflow-hidden rounded-md block"
            >
              <div className="aspect-video overflow-hidden">
                <img
                  src={article.image_url || '/placeholder.svg'}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="news-featured-overlay" />
              <div className="absolute bottom-0 left-0 right-0 p-3 text-primary-foreground">
                {article.categories && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-primary rounded mb-1">
                    {article.categories.name}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
