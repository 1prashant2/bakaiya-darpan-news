import { useState } from 'react';
import { Facebook, Twitter, MessageCircle, Instagram, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ShareButtonsProps {
  articleId: string;
  articleTitle: string;
  articleUrl: string;
  articleExcerpt?: string;
  articleImageUrl?: string;
  size?: 'sm' | 'default';
  className?: string;
}

export function ShareButtons({
  articleId,
  articleTitle,
  articleUrl,
  articleExcerpt,
  articleImageUrl,
  size = 'sm',
  className = '',
}: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const trackShare = async (_platform: string) => {
    try {
      // Track share by incrementing view_count
      await supabase
        .from('articles')
        .update({ view_count: (await supabase.from('articles').select('view_count').eq('id', articleId).single()).data?.view_count || 0 + 1 })
        .eq('id', articleId);
    } catch (error) {
      console.log('Share tracking error:', error);
    }
  };

  const shareOnFacebook = async () => {
    await trackShare('facebook');
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnTwitter = async () => {
    await trackShare('twitter');
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(articleUrl)}&text=${encodeURIComponent(articleTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const shareOnWhatsApp = async () => {
    await trackShare('whatsapp');
    const url = `https://wa.me/?text=${encodeURIComponent(articleTitle + ' ' + articleUrl)}`;
    window.open(url, '_blank');
  };

  const shareToInstagram = async () => {
    await trackShare('instagram');
    if (navigator.share && articleImageUrl) {
      try {
        const response = await fetch(articleImageUrl);
        const blob = await response.blob();
        const file = new File([blob], 'article-image.jpg', { type: blob.type });
        
        await navigator.share({
          title: articleTitle,
          text: `${articleTitle}\n\n${articleExcerpt || ''}\n\n${articleUrl}`,
          files: [file],
        });
      } catch (err) {
        await navigator.clipboard.writeText(`${articleTitle}\n${articleUrl}`);
        toast({
          title: 'इन्स्टाग्राममा शेयर गर्नुहोस्',
          description: 'लिङ्क कपी भयो। इन्स्टाग्राम खोल्नुहोस् र स्टोरीमा पेस्ट गर्नुहोस्।',
        });
      }
    } else {
      await navigator.clipboard.writeText(`${articleTitle}\n${articleUrl}`);
      toast({
        title: 'इन्स्टाग्राममा शेयर गर्नुहोस्',
        description: 'लिङ्क कपी भयो। मोबाइलबाट इन्स्टाग्राम स्टोरीमा शेयर गर्न सकिन्छ।',
      });
    }
  };

  const nativeShare = async () => {
    await trackShare('native');
    if (navigator.share) {
      try {
        await navigator.share({
          title: articleTitle,
          text: articleExcerpt || articleTitle,
          url: articleUrl,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    await trackShare('copy');
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

  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  return (
    <div className={`flex items-center gap-0.5 ${className}`} onClick={(e) => e.preventDefault()}>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareOnFacebook}
        title="फेसबुकमा शेयर गर्नुहोस्"
        className={`${buttonSize} hover:text-blue-600 hover:bg-blue-50`}
      >
        <Facebook className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareOnTwitter}
        title="ट्विटरमा शेयर गर्नुहोस्"
        className={`${buttonSize} hover:text-sky-500 hover:bg-sky-50`}
      >
        <Twitter className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareOnWhatsApp}
        title="व्हाट्सएपमा शेयर गर्नुहोस्"
        className={`${buttonSize} hover:text-green-500 hover:bg-green-50`}
      >
        <MessageCircle className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={shareToInstagram}
        title="इन्स्टाग्राममा शेयर गर्नुहोस्"
        className={`${buttonSize} hover:text-pink-500 hover:bg-pink-50`}
      >
        <Instagram className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={nativeShare}
        title="शेयर गर्नुहोस्"
        className={`${buttonSize} hover:text-primary hover:bg-primary/10`}
      >
        <Share2 className={iconSize} />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyLink}
        title="लिङ्क कपी गर्नुहोस्"
        className={`${buttonSize} hover:text-green-600 hover:bg-green-50`}
      >
        {copied ? <Check className={`${iconSize} text-green-600`} /> : <Copy className={iconSize} />}
      </Button>
    </div>
  );
}
