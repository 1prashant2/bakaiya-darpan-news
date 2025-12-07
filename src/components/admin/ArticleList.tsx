import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2, Eye, Plus, Loader2 } from 'lucide-react';
import { Article } from '@/lib/types';
import { format } from 'date-fns';

interface ArticleListProps {
  articles: Article[];
  isLoading: boolean;
  onRefresh: () => void;
}

export function ArticleList({ articles, isLoading, onRefresh }: ArticleListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDelete = async (articleId: string) => {
    setDeletingId(articleId);
    try {
      const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', articleId);

      if (error) throw error;

      toast({
        title: 'सफलता',
        description: 'समाचार सफलतापूर्वक हटाइयो',
      });
      onRefresh();
    } catch (error: any) {
      console.error('Error deleting article:', error);
      toast({
        title: 'त्रुटि',
        description: error.message || 'समाचार हटाउन सकिएन',
        variant: 'destructive',
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">समाचारहरू ({articles.length})</h2>
        <Button asChild>
          <Link to="/admin/articles/new">
            <Plus className="h-4 w-4 mr-2" />
            नयाँ समाचार
          </Link>
        </Button>
      </div>

      {articles.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">कुनै समाचार फेला परेन</p>
          <Button asChild className="mt-4">
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4 mr-2" />
              पहिलो समाचार थप्नुहोस्
            </Link>
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">शीर्षक</TableHead>
                <TableHead>श्रेणी</TableHead>
                <TableHead>स्थिति</TableHead>
                <TableHead>मिति</TableHead>
                <TableHead className="text-right">कार्यहरू</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      {article.image_url && (
                        <img
                          src={article.image_url}
                          alt={article.title}
                          className="w-12 h-12 object-cover rounded"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="truncate max-w-[250px]">{article.title}</p>
                        {article.is_featured && (
                          <Badge variant="secondary" className="mt-1">फिचर्ड</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {article.categories?.name || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={article.is_published ? 'default' : 'outline'}>
                      {article.is_published ? 'प्रकाशित' : 'ड्राफ्ट'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {article.created_at 
                      ? format(new Date(article.created_at), 'yyyy/MM/dd')
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/article/${article.slug}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/articles/edit/${article.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>के तपाईं निश्चित हुनुहुन्छ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              यो कार्य पूर्ववत गर्न सकिँदैन। यसले समाचार स्थायी रूपमा हटाउनेछ।
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>रद्द गर्नुहोस्</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(article.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              disabled={deletingId === article.id}
                            >
                              {deletingId === article.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                'हटाउनुहोस्'
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
