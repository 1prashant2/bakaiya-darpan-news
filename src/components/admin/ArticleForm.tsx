import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useCategories } from '@/hooks/useCategories';
import { useProvinces, useDistricts } from '@/hooks/useLocations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { AINewsGenerator } from './AINewsGenerator';
import { HeadlineSuggestions } from './HeadlineSuggestions';
import { SocialMediaGenerator } from './SocialMediaGenerator';
import { SEOSuggestions } from './SEOSuggestions';
import { Loader2, Save, ArrowLeft, CalendarIcon, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Article } from '@/lib/types';

interface ArticleFormProps {
  article?: Article;
  isEditing?: boolean;
}

export function ArticleForm({ article, isEditing = false }: ArticleFormProps) {
  const [title, setTitle] = useState(article?.title || '');
  const [slug, setSlug] = useState(article?.slug || '');
  const [content, setContent] = useState(article?.content || '');
  const [excerpt, setExcerpt] = useState(article?.excerpt || '');
  const [author, setAuthor] = useState(article?.author || 'सम्पादक');
  const [categoryId, setCategoryId] = useState(article?.category_id || '');
  const [provinceId, setProvinceId] = useState(article?.province_id || '');
  const [districtId, setDistrictId] = useState(article?.district_id || '');
  const [imageUrl, setImageUrl] = useState(article?.image_url || '');
  const [isPublished, setIsPublished] = useState(article?.is_published || false);
  const [isFeatured, setIsFeatured] = useState(article?.is_featured || false);
  const [scheduledAt, setScheduledAt] = useState<Date | undefined>(
    (article as any)?.scheduled_at ? new Date((article as any).scheduled_at) : undefined
  );
  const [scheduledTime, setScheduledTime] = useState(
    (article as any)?.scheduled_at ? format(new Date((article as any).scheduled_at), 'HH:mm') : '08:00'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories } = useCategories();
  const { data: provinces } = useProvinces();
  const { data: districts } = useDistricts(provinceId || undefined);
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Reset district when province changes
  useEffect(() => {
    if (!isEditing) {
      setDistrictId('');
    }
  }, [provinceId, isEditing]);

  // Generate slug from title
  useEffect(() => {
    if (!isEditing && title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setSlug(generatedSlug || `article-${Date.now()}`);
    }
  }, [title, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: t.common.error,
        description: 'कृपया सबै आवश्यक फिल्डहरू भर्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Build scheduled datetime
      let scheduledDateTime: string | null = null;
      if (scheduledAt && !isPublished) {
        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const dt = new Date(scheduledAt);
        dt.setHours(hours, minutes, 0, 0);
        scheduledDateTime = dt.toISOString();
      }

      const articleData = {
        title: title.trim(),
        slug: slug.trim() || `article-${Date.now()}`,
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150) + '...',
        author: author.trim(),
        category_id: categoryId,
        province_id: provinceId || null,
        district_id: districtId || null,
        image_url: imageUrl || null,
        is_published: isPublished,
        is_featured: isFeatured,
        scheduled_at: scheduledDateTime,
        updated_at: new Date().toISOString(),
      };

      if (isEditing && article?.id) {
        const { error } = await supabase
          .from('articles')
          .update(articleData)
          .eq('id', article.id);

        if (error) throw error;

        toast({
          title: 'सफलता',
          description: 'समाचार सफलतापूर्वक अपडेट भयो',
        });
      } else {
        const { error } = await supabase
          .from('articles')
          .insert([articleData]);

        if (error) throw error;

        toast({
          title: 'सफलता',
          description: 'समाचार सफलतापूर्वक सिर्जना भयो',
        });
      }

      navigate('/admin');
    } catch (error: any) {
      console.error('Error saving article:', error);
      toast({
        title: t.common.error,
        description: error.message || 'समाचार सेभ गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAIGenerated = (news: { title: string; excerpt: string; content: string }) => {
    setTitle(news.title);
    setExcerpt(news.excerpt);
    setContent(news.content);
  };

  const getCategoryName = (category: { name: string; name_en?: string | null }) => {
    return language === 'en' && category.name_en ? category.name_en : category.name;
  };

  const getLocationName = (location: { name: string; name_en: string }) => {
    return language === 'en' ? location.name_en : location.name;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.common.back}
        </Button>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <AINewsGenerator onGenerated={handleAIGenerated} />
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t.common.loading}
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {isEditing ? t.common.save : t.common.submit}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="title">{t.admin.articleTitle} *</Label>
              <HeadlineSuggestions
                content={content || excerpt}
                currentTitle={title}
                onSelect={setTitle}
              />
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="समाचारको शीर्षक लेख्नुहोस्"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">स्लग</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="url-friendly-slug"
            />
            <p className="text-xs text-muted-foreground">
              URL मा प्रयोग हुने अद्वितीय पहिचानकर्ता
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t.admin.articleContent} *</Label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="excerpt">{t.admin.articleExcerpt}</Label>
              <div className="flex items-center gap-1">
                <SocialMediaGenerator title={title} content={content || excerpt} />
                <SEOSuggestions title={title} content={content || excerpt} onMetaDescriptionSelect={setExcerpt} />
              </div>
            </div>
            <Textarea
              id="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="समाचारको संक्षिप्त विवरण लेख्नुहोस्..."
              rows={3}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-4 space-y-4">
            <h3 className="font-semibold">प्रकाशन सेटिङ</h3>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-published">{t.admin.isPublished}</Label>
              <Switch
                id="is-published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-featured">{t.admin.isFeatured}</Label>
              <Switch
                id="is-featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
            </div>

            {/* Scheduling */}
            {!isPublished && (
              <div className="space-y-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    शेड्युल गर्नुहोस्
                  </Label>
                  {scheduledAt && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setScheduledAt(undefined)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        !scheduledAt && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {scheduledAt ? format(scheduledAt, "yyyy-MM-dd") : "मिति छान्नुहोस्"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={scheduledAt}
                      onSelect={setScheduledAt}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>

                {scheduledAt && (
                  <div className="space-y-1">
                    <Label htmlFor="scheduled-time" className="text-xs">समय</Label>
                    <Input
                      id="scheduled-time"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}

                {scheduledAt && (
                  <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2">
                    📅 यो समाचार <span className="font-medium">{format(scheduledAt, "yyyy-MM-dd")}</span> को <span className="font-medium">{scheduledTime}</span> मा स्वचालित रूपमा प्रकाशित हुनेछ।
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>{t.admin.articleCategory} *</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder={t.admin.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {getCategoryName(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t.admin.articleProvince}</Label>
            <Select value={provinceId || "none"} onValueChange={(val) => setProvinceId(val === "none" ? "" : val)}>
              <SelectTrigger>
                <SelectValue placeholder={t.admin.selectProvince} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  {t.admin.allProvinces}
                </SelectItem>
                {provinces?.map((province) => (
                  <SelectItem key={province.id} value={province.id}>
                    {getLocationName(province)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {provinceId && (
            <div className="space-y-2">
              <Label>{t.admin.articleDistrict}</Label>
              <Select value={districtId || "none"} onValueChange={(val) => setDistrictId(val === "none" ? "" : val)}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectDistrict} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    {t.admin.allDistricts}
                  </SelectItem>
                  {districts?.map((district) => (
                    <SelectItem key={district.id} value={district.id}>
                      {getLocationName(district)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="author">{t.admin.articleAuthor}</Label>
            <Input
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="लेखकको नाम"
            />
          </div>

          <div className="space-y-2">
            <Label>{t.admin.articleImage}</Label>
            <ImageUpload
              currentImage={imageUrl}
              onImageUpload={setImageUrl}
              onImageRemove={() => setImageUrl('')}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
