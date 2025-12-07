import { useTrendingArticles, useRecentArticles } from '@/hooks/useArticles';
import { ArticleCard } from './ArticleCard';
import { TrendingUp, Clock, Cloud } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export function Sidebar() {
  const { data: trendingArticles, isLoading: trendingLoading } = useTrendingArticles(5);
  const { data: recentArticles, isLoading: recentLoading } = useRecentArticles(5);

  return (
    <aside className="space-y-6">
      {/* Trending News */}
      <div className="news-sidebar-widget">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">ट्रेन्डिङ</h3>
        </div>
        {trendingLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-1">
            {trendingArticles?.map((article, index) => (
              <div key={article.id} className="flex items-start gap-3">
                <span className="text-2xl font-bold text-primary/30 w-6 flex-shrink-0">
                  {index + 1}
                </span>
                <ArticleCard article={article} variant="compact" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent News */}
      <div className="news-sidebar-widget">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">ताजा समाचार</h3>
        </div>
        {recentLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div>
            {recentArticles?.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        )}
      </div>

      {/* Weather Widget Placeholder */}
      <div className="news-sidebar-widget">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
          <Cloud className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">मौसम</h3>
        </div>
        <div className="text-center py-4">
          <div className="text-4xl font-bold text-primary mb-1">२५°C</div>
          <p className="text-sm text-muted-foreground">बकैया, नेपाल</p>
          <p className="text-xs text-muted-foreground mt-1">आंशिक बदली</p>
        </div>
      </div>

      {/* Ad Placeholder */}
      <div className="news-sidebar-widget bg-secondary/50 text-center py-8">
        <p className="text-sm text-muted-foreground">विज्ञापन स्थान</p>
        <p className="text-xs text-muted-foreground">३००×२५०</p>
      </div>
    </aside>
  );
}
