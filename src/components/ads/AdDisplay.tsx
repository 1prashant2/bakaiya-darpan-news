import { useEffect, useRef } from 'react';
import { useAdvertisements, useTrackAdView, useTrackAdClick } from '@/hooks/useAdvertisements';
import { cn } from '@/lib/utils';

interface AdDisplayProps {
  placement: 'header' | 'sidebar' | 'between_articles' | 'footer';
  className?: string;
}

// Aspect ratios and sizing based on placement
const placementConfig = {
  header: {
    aspectRatio: 'aspect-[728/90]', // Standard leaderboard banner
    maxHeight: 'max-h-20 sm:max-h-24',
    containerClass: 'w-full',
  },
  sidebar: {
    aspectRatio: 'aspect-[300/250]', // Medium rectangle (vertical-ish)
    maxHeight: 'max-h-64 sm:max-h-72',
    containerClass: 'w-full',
  },
  between_articles: {
    aspectRatio: 'aspect-[4/1] sm:aspect-[5/1] md:aspect-[6/1]', // Wide banner
    maxHeight: 'max-h-24 sm:max-h-28',
    containerClass: 'w-full',
  },
  footer: {
    aspectRatio: 'aspect-[728/90]', // Standard leaderboard banner
    maxHeight: 'max-h-16 sm:max-h-20',
    containerClass: 'w-full',
  },
};

export function AdDisplay({ placement, className }: AdDisplayProps) {
  const { data: ads, isLoading } = useAdvertisements(placement);
  const trackView = useTrackAdView();
  const trackClick = useTrackAdClick();
  const trackedRef = useRef(false);

  const activeAds = ads?.filter(ad => ad.is_active) || [];
  const ad = activeAds[0];

  const config = placementConfig[placement];

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

  if (isLoading) {
    return (
      <div className={cn(
        'bg-muted/50 animate-pulse rounded-lg',
        config.containerClass,
        config.aspectRatio,
        config.maxHeight,
        className
      )} />
    );
  }

  if (!ad) {
    return (
      <div className={cn(
        'bg-secondary/30 rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm',
        config.containerClass,
        config.aspectRatio,
        config.maxHeight,
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
        src={ad.media_url}
        alt={ad.title}
        className="w-full h-full object-cover rounded-lg"
      />
    );
  };

  const content = (
    <div className={cn(
      'relative overflow-hidden rounded-lg',
      config.containerClass,
      config.aspectRatio,
      config.maxHeight,
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
