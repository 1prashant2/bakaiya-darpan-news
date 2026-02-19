import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Share2, Facebook, Twitter, Instagram, Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SocialMediaGeneratorProps {
  title: string;
  content: string;
}

export function SocialMediaGenerator({ title, content }: SocialMediaGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [posts, setPosts] = useState<{ facebook: string; twitter: string; instagram: string } | null>(null);
  const [copiedPlatform, setCopiedPlatform] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePosts = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया पहिले समाचारको शीर्षक र सामग्री लेख्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setPosts(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-news', {
        body: {
          action: 'social_media_posts',
          description: title,
          imageDescription: content,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setPosts(data);
    } catch (error: any) {
      console.error('Error generating social posts:', error);
      toast({
        title: 'त्रुटि',
        description: error.message || 'सोशल मिडिया पोस्ट तयार गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPlatform(platform);
      toast({ title: 'कपी भयो', description: `${platform} पोस्ट क्लिपबोर्डमा कपी गरियो` });
      setTimeout(() => setCopiedPlatform(null), 2000);
    } catch {
      toast({ title: 'त्रुटि', description: 'कपी गर्न सकिएन', variant: 'destructive' });
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && !posts) {
      generatePosts();
    }
  };

  const platforms = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-600' },
    { key: 'twitter', label: 'Twitter / X', icon: Twitter, color: 'text-sky-500' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-500' },
  ] as const;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7">
          <Share2 className="h-3 w-3" />
          सोशल पोस्ट
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-primary" />
            सोशल मिडिया पोस्ट जेनरेटर
          </DialogTitle>
          <DialogDescription>
            समाचारबाट Facebook, Twitter र Instagram का लागि पोस्ट तयार गर्नुहोस्
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">AI ले पोस्ट तयार गर्दैछ...</p>
            </div>
          ) : posts ? (
            <>
              {platforms.map(({ key, label, icon: Icon, color }) => (
                <div key={key} className="rounded-lg border border-border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${color}`} />
                      <span className="font-medium text-sm">{label}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(posts[key], label)}
                      className="gap-1 h-7"
                    >
                      {copiedPlatform === label ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                      <span className="text-xs">कपी</span>
                    </Button>
                  </div>
                  <p className="text-sm whitespace-pre-wrap bg-muted/50 rounded-md p-3">
                    {posts[key]}
                  </p>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generatePosts}
                className="w-full gap-2"
              >
                <Share2 className="h-4 w-4" />
                पुन: तयार गर्नुहोस्
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                सोशल मिडिया पोस्ट तयार गर्न बटन थिच्नुहोस्
              </p>
              <Button onClick={generatePosts} className="gap-2">
                <Share2 className="h-4 w-4" />
                पोस्ट तयार गर्नुहोस्
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
