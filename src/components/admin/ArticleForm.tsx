import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from './RichTextEditor';
import { ImageUpload } from './ImageUpload';
import { Loader2, Save, ArrowLeft } from 'lucide-react';
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

  const getCategoryName = (category: { name: string; name_en?: string | null }) => {
    return language === 'en' && category.name_en ? category.name_en : category.name;
  };

  const getLocationName = (location: { name: string; name_en: string }) => {
    return language === 'en' ? location.name_en : location.name;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/admin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t.common.back}
        </Button>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">{t.admin.articleTitle} *</Label>
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
            <Label htmlFor="excerpt">{t.admin.articleExcerpt}</Label>
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
            <Select value={provinceId} onValueChange={setProvinceId}>
              <SelectTrigger>
                <SelectValue placeholder={t.admin.selectProvince} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
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
              <Select value={districtId} onValueChange={setDistrictId}>
                <SelectTrigger>
                  <SelectValue placeholder={t.admin.selectDistrict} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
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
