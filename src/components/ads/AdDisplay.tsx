import { useEffect } from 'react';
import { useAdvertisements, useTrackAdView, useTrackAdClick } from '@/hooks/useAdvertisements';
import { cn } from '@/lib/utils';

interface AdDisplayProps {
  placement: 'header' | 'sidebar' | 'between_articles' | 'footer';
  className?: string;
}

export function AdDisplay({ placement, className }: AdDisplayProps) {
  const { data: ads, isLoading } = useAdvertisements(placement);
  const trackView = useTrackAdView();
  const trackClick = useTrackAdClick();

  // Get a random active ad from available ads
  const activeAd = ads?.[0];

  useEffect(() => {
    if (activeAd) {
      trackView.mutate(activeAd.id);
    }
  }, [activeAd?.id]);

  const handleClick = () => {
    if (activeAd) {
      trackClick.mutate(activeAd.id);
    }
  };

  if (isLoading) {
    return (
      <div className={cn('bg-muted/50 animate-pulse rounded-lg', className, {
        'h-24': placement === 'header',
        'h-64': placement === 'sidebar',
        'h-32': placement === 'between_articles',
        'h-20': placement === 'footer',
      })} />
    );
  }

  if (!activeAd) {
    return (
      <div className={cn('bg-secondary/30 rounded-lg flex items-center justify-center text-muted-foreground text-sm', className, {
        'h-24 px-4': placement === 'header',
        'h-64': placement === 'sidebar',
        'h-32': placement === 'between_articles',
        'h-20': placement === 'footer',
      })}>
        <span>विज्ञापन स्थान</span>
      </div>
    );
  }

  const AdContent = () => {
    if (activeAd.ad_type === 'video') {
      return (
        <video
          src={activeAd.media_url}
          className="w-full h-full object-cover rounded-lg"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <img
        src={activeAd.media_url}
        alt={activeAd.title}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  };

  if (activeAd.link_url) {
    return (
      <a
        href={activeAd.link_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className={cn('block relative overflow-hidden rounded-lg hover:opacity-90 transition-opacity', className)}
      >
        <AdContent />
        <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
          विज्ञापन
        </span>
      </a>
    );
  }

  return (
    <div className={cn('relative overflow-hidden rounded-lg', className)}>
      <AdContent />
      <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
        विज्ञापन
      </span>
    </div>
  );
}
