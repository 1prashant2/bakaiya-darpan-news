import { Layout } from '@/components/layout/Layout';
import { FeaturedNews } from '@/components/news/FeaturedNews';
import { CategorySection } from '@/components/news/CategorySection';
import { Sidebar } from '@/components/news/Sidebar';

const Index = () => {
  return (
    <Layout>
      <div className="news-container py-6">
        <FeaturedNews />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <CategorySection categoryName="राष्ट्र" categorySlug="rashtra" limit={4} />
            <CategorySection categoryName="राजनीति" categorySlug="rajniti" limit={4} />
            <CategorySection categoryName="व्यवसाय" categorySlug="byabasaya" limit={4} />
            <CategorySection categoryName="खेलकुद" categorySlug="khelkud" limit={4} />
            <CategorySection categoryName="मनोरञ्जन" categorySlug="manoranjan" limit={4} />
            <CategorySection categoryName="सूचना प्रविधि" categorySlug="suchana-prawidhi" limit={4} />
          </div>
          <Sidebar />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
