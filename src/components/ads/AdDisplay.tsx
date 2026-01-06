import { useEffect, useRef } from 'react';
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
  const trackedRef = useRef(false);

  const activeAds = ads?.filter(ad => ad.is_active) || [];
  const ad = activeAds[0]; // Show only the first (highest priority) ad

  // Track view once
  useEffect(() => {
    if (ad && !trackedRef.current) {
      trackView.mutate(ad.id);
      trackedRef.current = true;
    }
  }, [ad?.id]);

  const handleClick = () => {
    if (ad) {
      trackClick.mutate(ad.id);
    }
  };

  // Placement-specific sizes
  const sizeClasses = {
    header: 'h-16 sm:h-20 md:h-24',
    sidebar: 'h-48 sm:h-56 md:h-64',
    between_articles: 'h-20 sm:h-24 md:h-28',
    footer: 'h-14 sm:h-16 md:h-20',
  };

  if (isLoading) {
    return (
      <div className={cn(
        'bg-muted/50 animate-pulse rounded-lg w-full',
        sizeClasses[placement],
        className
      )} />
    );
  }

  if (!ad) {
    return (
      <div className={cn(
        'bg-secondary/30 rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm w-full',
        sizeClasses[placement],
        className
      )}>
        <span>विज्ञापन स्थान</span>
      </div>
    );
  }

  const AdContent = () => {
    if (ad.ad_type === 'video') {
      return (
        <video
          src={ad.media_url}
          className="w-full h-full object-contain rounded-lg bg-black/5"
          autoPlay
          muted
          loop
          playsInline
        />
      );
    }

    return (
      <img
        src={ad.media_url}
        alt={ad.title}
        className="w-full h-full object-contain rounded-lg"
      />
    );
  };

  const content = (
    <div className={cn(
      'relative overflow-hidden rounded-lg w-full',
      sizeClasses[placement],
      className
    )}>
      <AdContent />
      <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded">
        विज्ञापन
      </span>
    </div>
  );

  if (ad.link_url) {
    return (
      <a
        href={ad.link_url}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block w-full"
      >
        {content}
      </a>
    );
  }

  return content;
}
