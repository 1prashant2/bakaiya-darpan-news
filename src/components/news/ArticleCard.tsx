import { Link } from 'react-router-dom';
import { Article } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Clock, User } from 'lucide-react';
import { ShareButtons } from './ShareButtons';

interface ArticleCardProps {
  article: Article;
  variant?: 'default' | 'horizontal' | 'compact';
  showShare?: boolean;
}

export function ArticleCard({ article, variant = 'default', showShare = true }: ArticleCardProps) {
  const articleUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/article/${article.slug}` 
    : `/article/${article.slug}`;

  if (variant === 'horizontal') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="news-card group flex gap-4 p-3"
      >
        <div className="w-24 h-20 sm:w-32 sm:h-24 flex-shrink-0 overflow-hidden rounded">
          <img
            src={article.image_url || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="news-heading text-sm sm:text-base line-clamp-2 mb-2">
            {article.title}
          </h3>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link
        to={`/article/${article.slug}`}
        className="group flex items-start gap-3 py-3 border-b border-border last:border-0"
      >
        <div className="w-16 h-12 flex-shrink-0 overflow-hidden rounded">
          <img
            src={article.image_url || '/placeholder.svg'}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
        <h4 className="news-heading text-sm line-clamp-2 flex-1">
          {article.title}
        </h4>
      </Link>
    );
  }

  return (
    <Link
      to={`/article/${article.slug}`}
      className="news-card group block"
    >
      <div className="aspect-video overflow-hidden">
        <img
          src={article.image_url || '/placeholder.svg'}
          alt={article.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-4">
        {article.categories && (
          <span className="news-category-badge mb-2 inline-block">
            {article.categories.name}
          </span>
        )}
        <h3 className="news-heading text-sm sm:text-base md:text-lg line-clamp-2 mb-2">
          {article.title}
        </h3>
        {article.excerpt && (
          <p className="news-excerpt line-clamp-2 mb-3">
            {article.excerpt}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDistanceToNow(new Date(article.created_at), { addSuffix: true })}
          </span>
        </div>
        {showShare && (
          <ShareButtons
            articleId={article.id}
            articleTitle={article.title}
            articleUrl={articleUrl}
            articleExcerpt={article.excerpt || undefined}
            articleImageUrl={article.image_url || undefined}
            size="sm"
            className="mt-2 pt-2 border-t border-border justify-center"
          />
        )}
      </div>
    </Link>
  );
}
