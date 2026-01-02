import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useCreateAdvertisement, useUpdateAdvertisement, Advertisement, AdvertisementInsert } from '@/hooks/useAdvertisements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Upload, X, Image, Video, Package } from 'lucide-react';

const adSchema = z.object({
  title: z.string().min(1, 'शीर्षक आवश्यक छ'),
  description: z.string().optional(),
  ad_type: z.enum(['image', 'video', 'product']),
  link_url: z.string().url('सही URL हाल्नुहोस्').optional().or(z.literal('')),
  placement: z.enum(['header', 'sidebar', 'between_articles', 'footer']),
  start_date: z.string().min(1, 'सुरु मिति आवश्यक छ'),
  end_date: z.string().min(1, 'अन्त्य मिति आवश्यक छ'),
  is_active: z.boolean(),
  priority: z.number().min(1).max(100),
});

type AdFormData = z.infer<typeof adSchema>;

interface AdvertisementFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingAd?: Advertisement | null;
}

export function AdvertisementForm({ open, onOpenChange, editingAd }: AdvertisementFormProps) {
  const createAd = useCreateAdvertisement();
  const updateAd = useUpdateAdvertisement();
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<AdFormData>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      ad_type: 'image',
      placement: 'sidebar',
      is_active: true,
      priority: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  });

  const adType = watch('ad_type');

  useEffect(() => {
    if (editingAd) {
      reset({
        title: editingAd.title,
        description: editingAd.description || '',
        ad_type: editingAd.ad_type,
        link_url: editingAd.link_url || '',
        placement: editingAd.placement,
        start_date: editingAd.start_date.split('T')[0],
        end_date: editingAd.end_date.split('T')[0],
        is_active: editingAd.is_active,
        priority: editingAd.priority,
      });
      setMediaPreview(editingAd.media_url);
    } else {
      reset({
        ad_type: 'image',
        placement: 'sidebar',
        is_active: true,
        priority: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      });
      setMediaPreview('');
      setMediaFile(null);
    }
  }, [editingAd, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMediaFile(file);
      const url = URL.createObjectURL(file);
      setMediaPreview(url);
    }
  };

  const uploadMedia = async (): Promise<string | null> => {
    if (!mediaFile) return editingAd?.media_url || null;

    setUploading(true);
    try {
      const fileExt = mediaFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `ads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-media')
        .upload(filePath, mediaFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('ad-media')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: AdFormData) => {
    const mediaUrl = await uploadMedia();
    
    if (!mediaUrl && !editingAd) {
      return; // Need media for new ads
    }

    const adData: AdvertisementInsert = {
      title: data.title,
      description: data.description || null,
      ad_type: data.ad_type,
      media_url: mediaUrl!,
      link_url: data.link_url || null,
      placement: data.placement,
      start_date: new Date(data.start_date).toISOString(),
      end_date: new Date(data.end_date).toISOString(),
      is_active: data.is_active,
      priority: data.priority,
    };

    if (editingAd) {
      updateAd.mutate({ id: editingAd.id, ...adData }, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    } else {
      createAd.mutate(adData, {
        onSuccess: () => {
          onOpenChange(false);
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingAd ? 'विज्ञापन सम्पादन' : 'नयाँ विज्ञापन'}</DialogTitle>
          <DialogDescription>
            विज्ञापनको विवरण भर्नुहोस्
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">शीर्षक *</Label>
              <Input id="title" {...register('title')} placeholder="विज्ञापनको नाम" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>प्रकार *</Label>
              <Select
                value={adType}
                onValueChange={(value: 'image' | 'video' | 'product') => setValue('ad_type', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">
                    <div className="flex items-center gap-2">
                      <Image className="h-4 w-4" /> फोटो
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" /> भिडियो
                    </div>
                  </SelectItem>
                  <SelectItem value="product">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" /> उत्पादन
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">विवरण</Label>
            <Textarea id="description" {...register('description')} placeholder="विज्ञापनको छोटो विवरण" rows={2} />
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>मिडिया *</Label>
            <div className="border-2 border-dashed rounded-lg p-4">
              {mediaPreview ? (
                <div className="relative">
                  {adType === 'video' ? (
                    <video src={mediaPreview} className="w-full h-48 object-contain rounded" controls />
                  ) : (
                    <img src={mediaPreview} alt="Preview" className="w-full h-48 object-contain rounded" />
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setMediaFile(null);
                      setMediaPreview('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-32 cursor-pointer hover:bg-muted/50 rounded-lg transition-colors">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">क्लिक गरेर अपलोड गर्नुहोस्</span>
                  <input
                    type="file"
                    className="hidden"
                    accept={adType === 'video' ? 'video/*' : 'image/*'}
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>स्थान *</Label>
              <Select
                value={watch('placement')}
                onValueChange={(value: 'header' | 'sidebar' | 'between_articles' | 'footer') => setValue('placement', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">हेडर (माथि)</SelectItem>
                  <SelectItem value="sidebar">साइडबार</SelectItem>
                  <SelectItem value="between_articles">समाचार बीचमा</SelectItem>
                  <SelectItem value="footer">फुटर (तल)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="link_url">लिंक URL</Label>
              <Input id="link_url" {...register('link_url')} placeholder="https://..." />
              {errors.link_url && <p className="text-sm text-destructive">{errors.link_url.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">सुरु मिति *</Label>
              <Input id="start_date" type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-sm text-destructive">{errors.start_date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">अन्त्य मिति *</Label>
              <Input id="end_date" type="date" {...register('end_date')} />
              {errors.end_date && <p className="text-sm text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">प्राथमिकता (1-100)</Label>
              <Input
                id="priority"
                type="number"
                min={1}
                max={100}
                {...register('priority', { valueAsNumber: true })}
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="is_active"
                checked={watch('is_active')}
                onCheckedChange={(checked) => setValue('is_active', checked)}
              />
              <Label htmlFor="is_active">सक्रिय</Label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              रद्द गर्नुहोस्
            </Button>
            <Button type="submit" disabled={uploading || createAd.isPending || updateAd.isPending}>
              {uploading ? 'अपलोड हुँदैछ...' : editingAd ? 'अपडेट गर्नुहोस्' : 'थप्नुहोस्'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
