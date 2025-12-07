import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useArticle, useArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Sidebar } from '@/components/news/Sidebar';
import { format } from 'date-fns';
import { Clock, User, Share2, Facebook, Twitter } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug || '');
  const { data: relatedArticles } = useArticles(article?.categories?.slug, 4);

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
      <article className="news-container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {article.categories && (
              <Link to={`/category/${article.categories.slug}`} className="news-category-badge mb-3 inline-block">
                {article.categories.name}
              </Link>
            )}
            
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-4">
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
              <div className="flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="sm"><Facebook className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Twitter className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm"><Share2 className="h-4 w-4" /></Button>
              </div>
            </div>

            {article.image_url && (
              <img src={article.image_url} alt={article.title} className="w-full rounded-md mb-6" />
            )}

            <div className="prose prose-lg max-w-none text-foreground leading-relaxed">
              {article.content.split('\n').map((p, i) => <p key={i} className="mb-4">{p}</p>)}
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
