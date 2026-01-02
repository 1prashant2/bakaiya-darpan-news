import { useState } from 'react';
import { useAllAdvertisements, Advertisement } from '@/hooks/useAdvertisements';
import { AdvertisementList } from './AdvertisementList';
import { AdvertisementForm } from './AdvertisementForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Eye, MousePointer, Image, TrendingUp } from 'lucide-react';

export function AdvertisementManagement() {
  const { data: ads } = useAllAdvertisements();
  const [formOpen, setFormOpen] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const handleEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingAd(null);
  };

  // Calculate stats
  const totalViews = ads?.reduce((sum, ad) => sum + ad.view_count, 0) || 0;
  const totalClicks = ads?.reduce((sum, ad) => sum + ad.click_count, 0) || 0;
  const activeAds = ads?.filter(ad => ad.is_active && new Date(ad.end_date) > new Date()).length || 0;
  const ctr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(2) : '0';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Image className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeAds}</p>
                <p className="text-xs text-muted-foreground">सक्रिय विज्ञापन</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Eye className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">कुल हेराइ</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MousePointer className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">कुल क्लिक</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{ctr}%</p>
                <p className="text-xs text-muted-foreground">क्लिक दर (CTR)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>विज्ञापन व्यवस्थापन</CardTitle>
            <CardDescription>
              सबै प्रकारका विज्ञापनहरू यहाँबाट व्यवस्थापन गर्नुहोस्
            </CardDescription>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            नयाँ विज्ञापन
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <AdvertisementList onEdit={handleEdit} />
        </CardContent>
      </Card>

      <AdvertisementForm
        open={formOpen}
        onOpenChange={handleClose}
        editingAd={editingAd}
      />
    </div>
  );
}
