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
import { Loader2, Search, Copy, Check, TrendingUp, Clock, FileText, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';

interface SEOData {
  meta_description: string;
  keywords: string[];
  readability_score: number;
  readability_label: string;
  suggestions: string[];
  title_score: number;
  title_suggestions: string;
  word_count: number;
  estimated_read_time: string;
}

interface SEOSuggestionsProps {
  title: string;
  content: string;
  onMetaDescriptionSelect?: (desc: string) => void;
}

export function SEOSuggestions({ title, content, onMetaDescriptionSelect }: SEOSuggestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [seoData, setSeoData] = useState<SEOData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { toast } = useToast();

  const generateSEO = async () => {
    if (!title.trim() && !content.trim()) {
      toast({
        title: 'त्रुटि',
        description: 'कृपया पहिले समाचारको शीर्षक र सामग्री लेख्नुहोस्',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setSeoData(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-news', {
        body: {
          action: 'seo_suggestions',
          description: title,
          imageDescription: content,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      setSeoData(data);
    } catch (error: any) {
      console.error('Error generating SEO:', error);
      toast({
        title: 'त्रुटि',
        description: error.message || 'SEO सुझाव तयार गर्न सकिएन',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyText = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({ title: 'कपी भयो' });
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast({ title: 'त्रुटि', description: 'कपी गर्न सकिएन', variant: 'destructive' });
    }
  };

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (open && !seoData) {
      generateSEO();
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return '[&>div]:bg-green-500';
    if (score >= 60) return '[&>div]:bg-yellow-500';
    return '[&>div]:bg-red-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs h-7">
          <Search className="h-3 w-3" />
          SEO सुझाव
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            SEO अप्टिमाइजेसन सुझाव
          </DialogTitle>
          <DialogDescription>
            समाचारको SEO विश्लेषण र सुधार सुझावहरू
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">SEO विश्लेषण गर्दैछ...</p>
            </div>
          ) : seoData ? (
            <>
              {/* Scores */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">पढ्ने योग्यता</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(seoData.readability_score)}`}>
                      {seoData.readability_score}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <Progress value={seoData.readability_score} className={`h-1.5 ${getProgressColor(seoData.readability_score)}`} />
                  <p className="text-xs text-muted-foreground">{seoData.readability_label}</p>
                </div>

                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">शीर्षक स्कोर</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-2xl font-bold ${getScoreColor(seoData.title_score)}`}>
                      {seoData.title_score}
                    </span>
                    <span className="text-xs text-muted-foreground">/ 100</span>
                  </div>
                  <Progress value={seoData.title_score} className={`h-1.5 ${getProgressColor(seoData.title_score)}`} />
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {seoData.word_count} शब्द
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {seoData.estimated_read_time}
                </span>
              </div>

              {/* Meta Description */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">मेटा विवरण</span>
                  <div className="flex gap-1">
                    {onMetaDescriptionSelect && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onMetaDescriptionSelect(seoData.meta_description);
                          toast({ title: 'मेटा विवरण प्रयोग गरियो' });
                        }}
                        className="h-6 text-xs gap-1"
                      >
                        प्रयोग
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyText(seoData.meta_description, 'meta')}
                      className="h-6"
                    >
                      {copiedField === 'meta' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <p className="text-sm bg-muted/50 rounded-md p-2">{seoData.meta_description}</p>
                <p className="text-xs text-muted-foreground">{seoData.meta_description.length} अक्षर</p>
              </div>

              {/* Keywords */}
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    कीवर्डहरू
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => copyText(seoData.keywords.join(', '), 'keywords')}
                    className="h-6"
                  >
                    {copiedField === 'keywords' ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {seoData.keywords.map((kw, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {kw}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Title Suggestion */}
              {seoData.title_suggestions && (
                <div className="rounded-lg border border-border p-3 space-y-1">
                  <span className="text-sm font-medium">शीर्षक सुझाव</span>
                  <p className="text-sm text-muted-foreground">{seoData.title_suggestions}</p>
                </div>
              )}

              {/* Improvement Suggestions */}
              {seoData.suggestions?.length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <span className="text-sm font-medium">सुधार सुझावहरू</span>
                  <ul className="space-y-1.5">
                    {seoData.suggestions.map((s, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSEO}
                className="w-full gap-2"
              >
                <Search className="h-4 w-4" />
                पुन: विश्लेषण गर्नुहोस्
              </Button>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">
                SEO विश्लेषण गर्न बटन थिच्नुहोस्
              </p>
              <Button onClick={generateSEO} className="gap-2">
                <Search className="h-4 w-4" />
                SEO विश्लेषण गर्नुहोस्
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
