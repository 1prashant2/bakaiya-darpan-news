import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Newspaper, Zap, Video } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GeneratedNews {
  title: string;
  excerpt: string;
  content: string;
}

interface AINewsGeneratorProps {
  onGenerated: (news: GeneratedNews) => void;
}

const NEWS_TYPES = [
  { value: 'सामान्य', label: 'सामान्य समाचार' },
  { value: 'ब्रेकिङ', label: 'ब्रेकिङ न्यूज' },
  { value: 'राजनीति', label: 'राजनीति' },
  { value: 'दुर्घटना', label: 'दुर्घटना' },
  { value: 'खेलकुद', label: 'खेलकुद' },
  { value: 'मनोरञ्जन', label: 'मनोरञ्जन' },
  { value: 'अर्थतन्त्र', label: 'अर्थतन्त्र' },
  { value: 'स्वास्थ्य', label: 'स्वास्थ्य' },
  { value: 'शिक्षा', label: 'शिक्षा' },
  { value: 'प्रविधि', label: 'प्रविधि' },
  { value: 'अन्तर्राष्ट्रिय', label: 'अन्तर्राष्ट्रिय' },
];

const GENERATE_TYPES = [
  { value: 'full', label: 'पूर्ण समाचार', icon: Newspaper, description: '३-५ अनुच्छेदको विस्तृत समाचार' },
  { value: 'breaking', label: 'ब्रेकिङ अलर्ट', icon: Zap, description: '५०-८० शब्दको छोटो अपडेट' },
  { value: 'script', label: 'भिडियो स्क्रिप्ट', icon: Video, description: 'टीभी/भिडियो वाचनका लागि' },
];

export function AINewsGenerator({ onGenerated }: AINewsGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [imageDescription, setImageDescription] = useState('');
  const [newsType, setNewsType] = useState('सामान्य');
  const [generateType, setGenerateType] = useState('full');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!description.trim() && !imageDescription.trim()) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया कम्तिमा एउटा विवरण प्रदान गर्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-news', {
        body: {
          description: description.trim(),
          imageDescription: imageDescription.trim(),
          newsType,
          generateType,
        },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      onGenerated({
        title: data.title || '',
        excerpt: data.excerpt || '',
        content: data.content || '',
      });

      toast({
        title: 'सफलता',
        description: 'AI ले समाचार तयार गर्यो!',
      });

      setIsOpen(false);
      setDescription('');
      setImageDescription('');
    } catch (error: any) {
      console.error('Error generating news:', error);
      toast({
        title: 'त्रुटि',
        description: error.message || 'समाचार तयार गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Sparkles className="h-4 w-4" />
          AI बाट समाचार बनाउनुहोस्
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI समाचार जेनरेटर
          </DialogTitle>
          <DialogDescription>
            फोटो/भिडियोको विवरण वा छोटो नोटबाट पूर्ण नेपाली समाचार तयार गर्नुहोस्
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Generate Type Selection */}
          <div className="space-y-2">
            <Label>समाचारको प्रकार</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GENERATE_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setGenerateType(type.value)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      generateType === type.value
                        ? 'border-primary bg-primary/10'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="h-4 w-4" />
                      <span className="font-medium text-sm">{type.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{type.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* News Category */}
          <div className="space-y-2">
            <Label>विषय/क्षेत्र</Label>
            <Select value={newsType} onValueChange={setNewsType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NEWS_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image/Video Description */}
          <div className="space-y-2">
            <Label htmlFor="imageDesc">फोटो/भिडियोको विवरण</Label>
            <Textarea
              id="imageDesc"
              value={imageDescription}
              onChange={(e) => setImageDescription(e.target.value)}
              placeholder="उदाहरण: फोटोमा काठमाडौंको बागबजार क्षेत्रमा भएको सवारी दुर्घटना देखिन्छ। मिति २०८२ माघ ३ गते बिहान करिब ८ बजे..."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              फोटो वा भिडियोमा के देखिन्छ, ठाउँ, समय, व्यक्तिहरू आदि उल्लेख गर्नुहोस्
            </p>
          </div>

          {/* Raw Notes/Description */}
          <div className="space-y-2">
            <Label htmlFor="description">कच्चा विवरण/नोट</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="घटनाको संक्षिप्त विवरण, मुख्य पक्षहरू, के भयो, कसले गर्यो आदि..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              जति धेरै विवरण दिनुहुन्छ, त्यति राम्रो समाचार तयार हुन्छ
            </p>
          </div>

          {/* Tips */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium">💡 राम्रो नतिजाका लागि:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>ठाउँ, मिति, समय स्पष्ट लेख्नुहोस्</li>
              <li>मुख्य व्यक्ति/संस्थाको नाम उल्लेख गर्नुहोस्</li>
              <li>के भयो र कसरी भयो संक्षेपमा बताउनुहोस्</li>
            </ul>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || (!description.trim() && !imageDescription.trim())}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                AI ले समाचार तयार गर्दैछ...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                समाचार तयार गर्नुहोस्
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
