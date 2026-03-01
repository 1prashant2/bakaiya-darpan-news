import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Article } from '@/lib/types';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShareButtons } from '@/components/news/ShareButtons';
import { Eye, FileEdit, Share2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function MyArticles() {
  const { user } = useAuth();

  const { data: profile } = useQuery({
    queryKey: ['my-profile', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const authorName = profile?.name || user?.user_metadata?.name || '';

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ['my-articles', authorName],
    queryFn: async () => {
      if (!authorName) return [];
      const { data, error } = await supabase
        .from('articles')
        .select('*, categories (*)')
        .eq('author', authorName)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Article[];
    },
    enabled: !!authorName,
  });

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <FileEdit className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p className="text-lg font-medium">तपाईंको कुनै समाचार छैन</p>
        <Button asChild className="mt-4">
          <Link to="/admin/articles/new">नयाँ समाचार लेख्नुहोस्</Link>
        </Button>
      </div>
    );
  }

  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>शीर्षक</TableHead>
            <TableHead className="hidden sm:table-cell">मिति</TableHead>
            <TableHead>स्थिति</TableHead>
            <TableHead className="text-right">कार्य</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {articles.map((article) => (
            <TableRow key={article.id}>
              <TableCell className="max-w-[200px]">
                <p className="font-medium line-clamp-2 text-sm">{article.title}</p>
                {article.categories && (
                  <span className="text-xs text-muted-foreground">{article.categories.name}</span>
                )}
              </TableCell>
              <TableCell className="hidden sm:table-cell text-sm text-muted-foreground whitespace-nowrap">
                {format(new Date(article.created_at!), 'yyyy-MM-dd')}
              </TableCell>
              <TableCell>
                <Badge variant={article.is_published ? 'default' : 'secondary'} className="text-xs">
                  {article.is_published ? 'प्रकाशित' : 'ड्राफ्ट'}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  {article.is_published && (
                    <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                      <Link to={`/article/${article.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                    <Link to={`/admin/articles/edit/${article.id}`}>
                      <FileEdit className="h-4 w-4" />
                    </Link>
                  </Button>
                  {article.is_published && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="p-3">
                        <ShareButtons
                          url={`${siteUrl}/article/${article.slug}`}
                          title={article.title}
                          variant="full"
                        />
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
