import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useArticle, useArticles } from '@/hooks/useArticles';
import { ArticleCard } from '@/components/news/ArticleCard';
import { Sidebar } from '@/components/news/Sidebar';
import { format } from 'date-fns';
import { Clock, User, Share2, Facebook, Twitter, Check, Copy, MessageCircle, Instagram, BookOpen, Tag } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug || '');
  const { data: relatedArticles } = useArticles(article?.categories?.slug, 4);
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const articleUrl = typeof window !== 'undefined' ? window.location.href : '';
  const articleTitle = article?.title || '';

  // Calculate reading time (average 200 words per minute for Nepali text)
  const readingTime = article?.content
    ? Math.max(1, Math.ceil(article.content.split(/\s+/).length / 200))
    : 0;

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(articleTitle + ' ' + articleUrl)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = async () => {
    // Instagram doesn't have a direct web share API
    // On mobile, we use the native share with files capability
    if (navigator.share && article?.image_url) {
      try {
        // Fetch the image and convert to blob for sharing
        const response = await fetch(article.image_url);
        const blob = await response.blob();
        const file = new File([blob], 'article-image.jpg', { type: blob.type });
        
        await navigator.share({
          title: articleTitle,
          text: `${articleTitle}\n\n${article?.excerpt || ''}\n\n${articleUrl}`,
          files: [file],
        });
      } catch (err) {
        // Fallback: copy link and show instructions
        await navigator.clipboard.writeText(`${articleTitle}\n${articleUrl}`);
        toast({
          title: 'इन्स्टाग्राममा शेयर गर्नुहोस्',
          description: 'लिङ्क कपी भयो। इन्स्टाग्राम खोल्नुहोस् र स्टोरीमा पेस्ट गर्नुहोस्।',
        });
      }
    } else {
      // Desktop fallback: copy link
      await navigator.clipboard.writeText(`${articleTitle}\n${articleUrl}`);
      toast({
        title: 'इन्स्टाग्राममा शेयर गर्नुहोस्',
        description: 'लिङ्क कपी भयो। मोबाइलबाट इन्स्टाग्राम स्टोरीमा शेयर गर्न सकिन्छ।',
      });
    }
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle,
          text: article?.excerpt || articleTitle,
          url: articleUrl,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(articleUrl);
      setCopied(true);
      toast({
        title: 'लिङ्क कपी भयो',
        description: 'समाचारको लिङ्क क्लिपबोर्डमा कपी गरियो।',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: 'त्रुटि',
        description: 'लिङ्क कपी गर्न सकिएन।',
        variant: 'destructive',
      });
    }
  };
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
              <div className="flex items-center gap-1 sm:gap-2 ml-auto flex-wrap">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareOnFacebook}
                  title="फेसबुकमा शेयर गर्नुहोस्"
                  className="hover:text-blue-600 px-2"
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareOnTwitter}
                  title="ट्विटरमा शेयर गर्नुहोस्"
                  className="hover:text-sky-500 px-2"
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareOnWhatsApp}
                  title="व्हाट्सएपमा शेयर गर्नुहोस्"
                  className="hover:text-green-500 px-2"
                >
                  <MessageCircle className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={shareToInstagram}
                  title="इन्स्टाग्राममा शेयर गर्नुहोस्"
                  className="hover:text-pink-500 px-2"
                >
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={nativeShare}
                  title="शेयर गर्नुहोस्"
                  className="hover:text-primary px-2"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyLink}
                  title="लिङ्क कपी गर्नुहोस्"
                  className="hover:text-green-600 px-2"
                >
                  {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                </Button>
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
