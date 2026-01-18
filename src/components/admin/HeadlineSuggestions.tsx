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
import { Loader2, Lightbulb, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HeadlineSuggestion {
  text: string;
  style: string;
}

interface HeadlineSuggestionsProps {
  content: string;
  currentTitle: string;
  onSelect: (headline: string) => void;
}

export function HeadlineSuggestions({ content, currentTitle, onSelect }: HeadlineSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<HeadlineSuggestion[]>([]);
  const { toast } = useToast();

  const generateSuggestions = async () => {
    if (!content.trim() && !currentTitle.trim()) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया पहिले समाचारको सामग्री लेख्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSuggestions([]);

    try {
      const { data, error } = await supabase.functions.invoke('generate-news', {
        body: {
          action: 'suggest_headlines',
          description: content || currentTitle,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSuggestions(data.headlines || []);

      if (!data.headlines?.length) {
        toast({
          title: 'सूचना',
          description: 'शीर्षक सुझाव प्राप्त हुन सकेन, पुन: प्रयास गर्नुहोस्',
        });
      }
    } catch (error: any) {
      console.error('Error generating headlines:', error);
      toast({
        title: 'त्रुटि',
        description: error.message || 'शीर्षक सुझाव गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (headline: string) => {
    onSelect(headline);
    setIsOpen(false);
    toast({
      title: 'शीर्षक छानियो',
      description: headline.substring(0, 50) + (headline.length > 50 ? '...' : ''),
    });
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && suggestions.length === 0) {
      generateSuggestions();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7">
          <Lightbulb className="h-3 w-3" />
          AI सुझाव
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI शीर्षक सुझाव
          </DialogTitle>
          <DialogDescription>
            समाचारको सामग्रीको आधारमा विभिन्न शैलीका शीर्षक विकल्पहरू
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">AI ले शीर्षक तयार गर्दैछ...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelect(suggestion.text)}
                  className="w-full text-left p-3 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm leading-snug">{suggestion.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        शैली: {suggestion.style}
                      </p>
                    </div>
                    <Check className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))}
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSuggestions}
                className="w-full mt-3 gap-2"
              >
                <Lightbulb className="h-4 w-4" />
                थप सुझाव प्राप्त गर्नुहोस्
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                शीर्षक सुझाव प्राप्त गर्न तलको बटन थिच्नुहोस्
              </p>
              <Button onClick={generateSuggestions} className="gap-2">
                <Lightbulb className="h-4 w-4" />
                सुझाव प्राप्त गर्नुहोस्
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
