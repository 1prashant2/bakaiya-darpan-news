import { useEffect, useState, useCallback, useRef } from 'react';
import { useAdvertisements, useTrackAdView, useTrackAdClick } from '@/hooks/useAdvertisements';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdDisplayProps {
  placement: 'header' | 'sidebar' | 'between_articles' | 'footer';
  className?: string;
  showNavigation?: boolean;
  autoPlayInterval?: number;
}

export function AdDisplay({ 
  placement, 
  className, 
  showNavigation = false,
  autoPlayInterval = 5000 
}: AdDisplayProps) {
  const { data: ads, isLoading } = useAdvertisements(placement);
  const trackView = useTrackAdView();
  const trackClick = useTrackAdClick();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackedAdsRef = useRef<Set<string>>(new Set());

  const activeAds = ads?.filter(ad => ad.is_active) || [];
  const currentAd = activeAds[currentIndex];

  const goToNext = useCallback(() => {
    if (activeAds.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }
  }, [activeAds.length]);

  const goToPrev = useCallback(() => {
    if (activeAds.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + activeAds.length) % activeAds.length);
    }
  }, [activeAds.length]);

  // Auto-play carousel
  useEffect(() => {
    if (activeAds.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [activeAds.length, isHovered, autoPlayInterval, goToNext]);

  // Track views for current ad
  useEffect(() => {
    if (currentAd && !trackedAdsRef.current.has(currentAd.id)) {
      trackView.mutate(currentAd.id);
      trackedAdsRef.current.add(currentAd.id);
    }
  }, [currentAd?.id]);

  // Reset index when ads change
  useEffect(() => {
    if (currentIndex >= activeAds.length && activeAds.length > 0) {
      setCurrentIndex(0);
    }
  }, [activeAds.length, currentIndex]);

  const handleClick = () => {
    if (currentAd) {
      trackClick.mutate(currentAd.id);
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

  if (activeAds.length === 0) {
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

  const AdContent = ({ ad }: { ad: typeof currentAd }) => {
    if (!ad) return null;

    if (ad.ad_type === 'video') {
      return (
        <video
          ref={videoRef}
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

  const AdWrapper = ({ children }: { children: React.ReactNode }) => {
    if (currentAd?.link_url) {
      return (
        <a
          href={currentAd.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="block w-full h-full"
        >
          {children}
        </a>
      );
    }
    return <>{children}</>;
  };

  return (
    <div 
      className={cn('relative overflow-hidden rounded-lg group', className, {
        'h-24': placement === 'header' && !className?.includes('h-'),
        'h-64': placement === 'sidebar' && !className?.includes('h-'),
        'h-32 md:h-40': placement === 'between_articles' && !className?.includes('h-'),
        'h-20': placement === 'footer' && !className?.includes('h-'),
      })}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Carousel Container */}
      <div 
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {activeAds.map((ad, index) => (
          <div 
            key={ad.id} 
            className="min-w-full h-full flex-shrink-0"
          >
            <AdWrapper>
              <AdContent ad={ad} />
            </AdWrapper>
          </div>
        ))}
      </div>

      {/* Ad Label */}
      <span className="absolute top-1 right-1 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded z-10">
        विज्ञापन
      </span>

      {/* Navigation Arrows */}
      {activeAds.length > 1 && (showNavigation || isHovered) && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToPrev();
            }}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Previous ad"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goToNext();
            }}
            className="absolute right-8 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
            aria-label="Next ad"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {activeAds.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
          {activeAds.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={cn(
                'w-2 h-2 rounded-full transition-all',
                index === currentIndex 
                  ? 'bg-white scale-110' 
                  : 'bg-white/50 hover:bg-white/75'
              )}
              aria-label={`Go to ad ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Progress Bar */}
      {activeAds.length > 1 && !isHovered && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20 z-10">
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{
              animation: `progress ${autoPlayInterval}ms linear`,
              animationIterationCount: 'infinite',
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
