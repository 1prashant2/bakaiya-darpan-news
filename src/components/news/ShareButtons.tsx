import { useState } from 'react';
import { Facebook, Twitter, MessageCircle, Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonsProps {
  url: string;
  title?: string;
  excerpt?: string;
  variant?: 'icon' | 'full';
  size?: 'sm' | 'default';
  className?: string;
}

export function ShareButtons({
  url,
  title = '',
  excerpt,
  variant = 'icon',
  size = 'sm',
  className = '',
}: ShareButtonsProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const fullUrl = url.startsWith('http') ? url : `${window.location.origin}${url}`;

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(title)}`,
      '_blank',
      'width=600,height=400'
    );
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + fullUrl)}`,
      '_blank'
    );
  };

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: excerpt || title, url: fullUrl });
      } catch {
        // User cancelled
      }
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      toast({ title: 'लिङ्क कपी भयो', description: 'समाचारको लिङ्क क्लिपबोर्डमा कपी गरियो।' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'त्रुटि', description: 'लिङ्क कपी गर्न सकिएन।', variant: 'destructive' });
    }
  };

  const buttonSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';

  if (variant === 'full') {
    return (
      <div className={`space-y-2 ${className}`}>
        <p className="text-sm font-semibold text-muted-foreground">यो खबर शेयर गर्नुहोस्</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={shareOnFacebook} className="gap-2 hover:text-blue-600 hover:border-blue-300">
            <Facebook className="h-4 w-4" /> Facebook
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnTwitter} className="gap-2 hover:text-sky-500 hover:border-sky-300">
            <Twitter className="h-4 w-4" /> X (Twitter)
          </Button>
          <Button variant="outline" size="sm" onClick={shareOnWhatsApp} className="gap-2 hover:text-green-500 hover:border-green-300">
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </Button>
          <Button variant="outline" size="sm" onClick={nativeShare} className="gap-2 hover:text-primary hover:border-primary/30">
            <Share2 className="h-4 w-4" /> Share
          </Button>
          <Button variant="outline" size="sm" onClick={copyLink} className="gap-2 hover:text-green-600 hover:border-green-300">
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
            {copied ? 'कपी भयो!' : 'लिङ्क कपी'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-0.5 ${className}`} onClick={(e) => e.preventDefault()}>
      <Button variant="ghost" size="icon" onClick={shareOnFacebook} title="फेसबुकमा शेयर" className={`${buttonSize} hover:text-blue-600 hover:bg-blue-50`}>
        <Facebook className={iconSize} />
      </Button>
      <Button variant="ghost" size="icon" onClick={shareOnTwitter} title="X मा शेयर" className={`${buttonSize} hover:text-sky-500 hover:bg-sky-50`}>
        <Twitter className={iconSize} />
      </Button>
      <Button variant="ghost" size="icon" onClick={shareOnWhatsApp} title="WhatsApp मा शेयर" className={`${buttonSize} hover:text-green-500 hover:bg-green-50`}>
        <MessageCircle className={iconSize} />
      </Button>
      <Button variant="ghost" size="icon" onClick={nativeShare} title="शेयर गर्नुहोस्" className={`${buttonSize} hover:text-primary hover:bg-primary/10`}>
        <Share2 className={iconSize} />
      </Button>
      <Button variant="ghost" size="icon" onClick={copyLink} title="लिङ्क कपी" className={`${buttonSize} hover:text-green-600 hover:bg-green-50`}>
        {copied ? <Check className={`${iconSize} text-green-600`} /> : <Copy className={iconSize} />}
      </Button>
    </div>
  );
}
