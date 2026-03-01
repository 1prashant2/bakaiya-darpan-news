import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useArticle, useArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Sidebar } from '@/components/news/Sidebar';
import { ShareButtons } from '@/components/news/ShareButtons';
import { ArticleMetaTags } from '@/components/news/ArticleMetaTags';
import { format } from 'date-fns';
import { Clock, User, BookOpen, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug || '');
  const { data: relatedArticles } = useArticles(article?.categories?.slug, 4);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';

  const readingTime = article?.content
    ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))
    : 0;

  if (isLoading) {
    return (
      <Layout>
        <div className="news-container py-6">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="aspect-video w-full mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="news-container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">समाचार भेटिएन</h1>
          <Link to="/" className="text-primary hover:underline">गृहपृष्ठमा फर्कनुहोस्</Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ArticleMetaTags
        title={article.title}
        description={article.excerpt || article.content.slice(0, 150)}
        imageUrl={article.image_url}
        url={articleUrl}
        author={article.author}
        publishedAt={article.created_at}
      />

      <article className="news-container py-4 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 max-w-prose lg:max-w-none">
            {article.categories && (
              <Link to={`/category/${article.categories.slug}`} className="news-category-badge mb-3 inline-block">
                {article.categories.name}
              </Link>
            )}
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-foreground leading-snug mb-3 sm:mb-4 tracking-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b border-border">
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {article.author}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {format(new Date(article.created_at), 'yyyy-MM-dd HH:mm')}
              </span>
              {readingTime > 0 && (
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {readingTime} मिनेट पढ्ने समय
                </span>
              )}
              <div className="ml-auto">
                <ShareButtons url={articleUrl} title={article.title} excerpt={article.excerpt || undefined} />
              </div>
            </div>

            {article.image_url && (
              <img src={article.image_url} alt={article.title} className="w-full aspect-video object-cover rounded-md mb-4 sm:mb-6" loading="lazy" />
            )}

            <div className="prose prose-lg max-w-none text-foreground leading-[1.8] sm:leading-[1.9] text-base sm:text-[1.05rem] md:text-lg">
              {article.content.split('\n').map((p, i) => (
                <p key={i} className="mb-5">{p}</p>
              ))}
            </div>

            {/* Tags */}
            {article.article_tags && article.article_tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-border">
                <Tag className="h-4 w-4 text-muted-foreground" />
                {article.article_tags.map((at) => (
                  at.tag && (
                    <Badge key={at.id} variant="secondary" className="text-xs">
                      {at.tag.name}
                    </Badge>
                  )
                ))}
              </div>
            )}

            {/* Share section at bottom */}
            <div className="mt-8 pt-6 border-t border-border">
              <ShareButtons
                url={articleUrl}
                title={article.title}
                excerpt={article.excerpt || undefined}
                variant="full"
              />
            </div>

            {relatedArticles && relatedArticles.length > 1 && (
              <section className="mt-12 pt-8 border-t border-border">
                <h2 className="news-section-title">सम्बन्धित समाचार</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedArticles.filter(a => a.id !== article.id).slice(0, 4).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="horizontal" />
                  ))}
                </div>
              </section>
            )}
          </div>
          <Sidebar />
        </div>
      </article>
    </Layout>
  );
}
