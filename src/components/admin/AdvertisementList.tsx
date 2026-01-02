import { useState } from 'react';
import { useAllAdvertisements, useDeleteAdvertisement, useUpdateAdvertisement, Advertisement } from '@/hooks/useAdvertisements';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Eye, MousePointer, Image, Video, Package, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

interface AdvertisementListProps {
  onEdit: (ad: Advertisement) => void;
}

export function AdvertisementList({ onEdit }: AdvertisementListProps) {
  const { data: ads, isLoading, refetch } = useAllAdvertisements();
  const deleteAd = useDeleteAdvertisement();
  const updateAd = useUpdateAdvertisement();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleToggleActive = (ad: Advertisement) => {
    updateAd.mutate({ id: ad.id, is_active: !ad.is_active });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteAd.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const getAdTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'product': return <Package className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  const getPlacementLabel = (placement: string) => {
    switch (placement) {
      case 'header': return 'हेडर';
      case 'sidebar': return 'साइडबार';
      case 'between_articles': return 'समाचार बीच';
      case 'footer': return 'फुटर';
      default: return placement;
    }
  };

  const isExpired = (endDate: string) => new Date(endDate) < new Date();
  const isUpcoming = (startDate: string) => new Date(startDate) > new Date();

  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-muted-foreground">लोड हुँदैछ...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="p-4 border-b flex items-center justify-between">
        <h3 className="font-semibold">विज्ञापनहरू ({ads?.length || 0})</h3>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          रिफ्रेश
        </Button>
      </div>

      {ads?.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>कुनै विज्ञापन छैन</p>
          <p className="text-sm">नयाँ विज्ञापन थप्नुहोस्</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">प्रिभ्यू</TableHead>
                <TableHead>शीर्षक</TableHead>
                <TableHead>प्रकार</TableHead>
                <TableHead>स्थान</TableHead>
                <TableHead>अवधि</TableHead>
                <TableHead>स्थिति</TableHead>
                <TableHead className="text-right">हेराइ/क्लिक</TableHead>
                <TableHead className="text-right">कार्य</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ads?.map((ad) => (
                <TableRow key={ad.id}>
                  <TableCell>
                    <div className="w-16 h-12 bg-muted rounded overflow-hidden">
                      {ad.ad_type === 'video' ? (
                        <video src={ad.media_url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={ad.media_url} alt={ad.title} className="w-full h-full object-cover" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium line-clamp-1">{ad.title}</div>
                    {ad.description && (
                      <div className="text-xs text-muted-foreground line-clamp-1">{ad.description}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getAdTypeIcon(ad.ad_type)}
                      <span className="text-sm capitalize">{ad.ad_type}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{getPlacementLabel(ad.placement)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{format(new Date(ad.start_date), 'yyyy-MM-dd')}</div>
                      <div className="text-muted-foreground">→ {format(new Date(ad.end_date), 'yyyy-MM-dd')}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={ad.is_active}
                        onCheckedChange={() => handleToggleActive(ad)}
                        disabled={updateAd.isPending}
                      />
                      {isExpired(ad.end_date) ? (
                        <Badge variant="destructive">समाप्त</Badge>
                      ) : isUpcoming(ad.start_date) ? (
                        <Badge variant="secondary">आगामी</Badge>
                      ) : ad.is_active ? (
                        <Badge variant="default">सक्रिय</Badge>
                      ) : (
                        <Badge variant="secondary">निष्क्रिय</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-3 text-sm">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {ad.view_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-3 w-3" />
                        {ad.click_count.toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(ad)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(ad.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>विज्ञापन मेट्नुहुन्छ?</AlertDialogTitle>
            <AlertDialogDescription>
              यो कार्य पूर्ववत गर्न सकिँदैन। विज्ञापन स्थायी रूपमा मेटिनेछ।
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>रद्द गर्नुहोस्</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              मेट्नुहोस्
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
