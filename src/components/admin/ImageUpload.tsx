import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Upload, X, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ImageUploadProps {
  currentImage?: string | null;
  onImageUpload: (url: string) => void;
  onImageRemove: () => void;
}

export function ImageUpload({ currentImage, onImageUpload, onImageRemove }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया चित्र फाइल मात्र अपलोड गर्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'त्रुटि',
        description: 'फाइल साइज ५ MB भन्दा कम हुनुपर्छ',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `articles/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('article-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('article-images')
        .getPublicUrl(filePath);

      onImageUpload(publicUrl);
      toast({
        title: 'सफलता',
        description: 'चित्र सफलतापूर्वक अपलोड भयो',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'अपलोड त्रुटि',
        description: error.message || 'चित्र अपलोड गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImage ? (
        <div className="relative inline-block">
          <img
            src={currentImage}
            alt="Article preview"
            className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={onImageRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full max-w-md h-48 border-dashed"
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span>अपलोड हुँदैछ...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8" />
              <span>चित्र अपलोड गर्नुहोस्</span>
              <span className="text-xs text-muted-foreground">(अधिकतम ५ MB)</span>
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
