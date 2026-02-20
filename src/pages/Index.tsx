import { useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { CategorySection } from '@/components/news/CategorySection';
import { Sidebar } from '@/components/news/Sidebar';
import { AdDisplay } from '@/components/ads/AdDisplay';
import { supabase } from '@/integrations/supabase/client';

const categories = [
  { name: 'राष्ट्र', slug: 'rashtra' },
  { name: 'राजनीति', slug: 'rajniti' },
  { name: 'व्यवसाय', slug: 'byabasaya' },
  { name: 'खेलकुद', slug: 'khelkud' },
  { name: 'मनोरञ्जन', slug: 'manoranjan' },
  { name: 'सूचना प्रविधि', slug: 'suchana-prawidhi' },
];

const Index = () => {
  // Trigger scheduled article publishing on page load
  useEffect(() => {
    supabase.functions.invoke('publish-scheduled').catch(() => {});
  }, []);

  return (
    <Layout>
      <div className="news-container py-6">
        <FeaturedNews />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {categories.map((category, index) => (
              <div key={category.slug}>
                <CategorySection 
                  categoryName={category.name} 
                  categorySlug={category.slug} 
                  limit={4} 
                />
                {/* Show ad after every 2 category sections */}
                {(index + 1) % 2 === 0 && index < categories.length - 1 && (
                  <div className="my-8">
                    <AdDisplay placement="between_articles" />
                  </div>
                )}
              </div>
            ))}
          </div>
          <Sidebar />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
