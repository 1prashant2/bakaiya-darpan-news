import { useEffect, useRef } from 'react';
import { useAdvertisements, useTrackAdView, useTrackAdClick } from '@/hooks/useAdvertisements';
import { cn } from '@/lib/utils';

interface AdDisplayProps {
  placement: 'header' | 'sidebar' | 'between_articles' | 'footer';
  className?: string;
}

// Default aspect ratios based on placement (used when ad has 'auto' or no aspect_ratio)
const defaultAspectRatios = {
  header: '728/90',
  sidebar: '300/250',
  between_articles: '728/90',
  footer: '728/90',
};

// Convert aspect ratio string to CSS aspect-ratio value
const parseAspectRatio = (ratio: string | null, placement: string): string => {
  if (!ratio || ratio === 'auto') {
    return defaultAspectRatios[placement as keyof typeof defaultAspectRatios] || '16/9';
  }
  // Convert "16:9" format to "16/9" for CSS
  return ratio.replace(':', '/');
};

// Max heights based on placement
const maxHeights = {
  header: 'max-h-24',
  sidebar: 'max-h-72',
  between_articles: 'max-h-28',
  footer: 'max-h-20',
};

export function AdDisplay({ placement, className }: AdDisplayProps) {
  const { data: ads, isLoading } = useAdvertisements(placement);
  const trackView = useTrackAdView();
  const trackClick = useTrackAdClick();
  const trackedRef = useRef(false);

  const activeAds = ads?.filter(ad => ad.is_active) || [];
  const ad = activeAds[0];

  const aspectRatio = ad ? parseAspectRatio(ad.aspect_ratio, placement) : defaultAspectRatios[placement];

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
      <div 
        className={cn(
          'bg-muted/50 animate-pulse rounded-lg w-full',
          maxHeights[placement],
          className
        )}
        style={{ aspectRatio }}
      />
    );
  }

  if (!ad) {
    return (
      <div 
        className={cn(
          'bg-secondary/30 rounded-lg flex items-center justify-center text-muted-foreground text-xs sm:text-sm w-full',
          maxHeights[placement],
          className
        )}
        style={{ aspectRatio }}
      >
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
    <div 
      className={cn(
        'relative overflow-hidden rounded-lg w-full',
        maxHeights[placement],
        className
      )}
      style={{ aspectRatio }}
    >
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
