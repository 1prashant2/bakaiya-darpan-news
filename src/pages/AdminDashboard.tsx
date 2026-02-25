import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArticleList } from '@/components/admin/ArticleList';
import { CategoryList } from '@/components/admin/CategoryList';
import { UserManagement } from '@/components/admin/UserManagement';
import { SiteSettingsForm } from '@/components/admin/SiteSettingsForm';
import { AdvertisementManagement } from '@/components/admin/AdvertisementManagement';
import { Article, Category } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Plus, 
  Eye, 
  Clock,
  CheckCircle2,
  FileEdit,
  ArrowRight,
  Settings,
  Megaphone
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { toast } = useToast();
  const [publishingScheduled, setPublishingScheduled] = useState(false);

  const handlePublishScheduled = async () => {
    setPublishingScheduled(true);
    try {
      const { data, error } = await supabase.functions.invoke('publish-scheduled');
      if (error) throw error;
      const published = data?.published || 0;
      toast({
        title: published > 0 ? 'सफलता' : 'कुनै शेड्युल समाचार छैन',
        description: published > 0 
          ? `${published} शेड्युल समाचार प्रकाशित भयो` 
          : 'प्रकाशन गर्नुपर्ने शेड्युल समाचार फेला परेन',
      });
      if (published > 0) { refetch(); refetchScheduled(); }
    } catch (error: any) {
      toast({ title: 'त्रुटि', description: error.message, variant: 'destructive' });
    } finally {
      setPublishingScheduled(false);
    }
  };

  const { user, isAdmin, isEditor, canManageCategories, canManageUsers, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && (!user || (!isAdmin && !isEditor))) {
      navigate('/auth');
    }
  }, [user, isAdmin, isEditor, authLoading, navigate]);

  const { data: articles = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-articles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('articles')
        .select(`
          *,
          categories (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
    enabled: !!user && (isAdmin || isEditor),
  });

  const { data: categories = [], isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data as Category[];
    },
    enabled: !!user && isAdmin,
  });

  const { data: scheduledCount = 0, refetch: refetchScheduled } = useQuery({
    queryKey: ['scheduled-articles-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('articles')
        .select('id', { count: 'exact', head: true })
        .eq('is_published', false)
        .not('scheduled_at', 'is', null);
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user && (isAdmin || isEditor),
  });

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [articlesRes, categoriesRes] = await Promise.all([
        supabase.from('articles').select('id, is_published, view_count'),
        supabase.from('categories').select('id'),
      ]);

      const articlesData = articlesRes.data || [];
      const categoriesData = categoriesRes.data || [];
      const totalViews = articlesData.reduce((sum, a) => sum + (a.view_count || 0), 0);

      return {
        totalArticles: articlesData.length,
        publishedArticles: articlesData.filter(a => a.is_published).length,
        draftArticles: articlesData.filter(a => !a.is_published).length,
        totalCategories: categoriesData.length,
        totalViews,
      };
    },
    enabled: !!user && (isAdmin || isEditor),
  });

  const recentArticles = articles.slice(0, 5);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isEditor)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="news-container py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">एडमिन ड्यासबोर्ड</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">प्रेस दर्पण व्यवस्थापन</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link to="/">
                  साइटमा जानुहोस् →
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="news-container py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <Button asChild className="gap-2">
            <Link to="/admin/articles/new">
              <Plus className="h-4 w-4" />
              नयाँ समाचार
            </Link>
          </Button>
          <Button 
            variant="outline" 
            className="gap-2" 
            onClick={handlePublishScheduled}
            disabled={publishingScheduled}
          >
            <Clock className="h-4 w-4" />
            {publishingScheduled ? 'प्रकाशन गर्दै...' : 'शेड्युल प्रकाशित गर्नुहोस्'}
            {scheduledCount > 0 && (
              <Badge variant="destructive" className="ml-1 text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5">
                {scheduledCount}
              </Badge>
            )}
          </Button>
          {canManageCategories && (
            <Button variant="outline" className="gap-2" onClick={() => document.getElementById('categories-tab')?.click()}>
              <FolderOpen className="h-4 w-4" />
              श्रेणी व्यवस्थापन
            </Button>
          )}
          {canManageUsers && (
            <Button variant="outline" className="gap-2" onClick={() => document.getElementById('users-tab')?.click()}>
              <Users className="h-4 w-4" />
              प्रयोगकर्ता व्यवस्थापन
            </Button>
          )}
        </div>

        {/* Analytics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-2xl sm:text-3xl font-bold text-primary">{stats?.totalArticles || 0}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">जम्मा समाचार</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{stats?.publishedArticles || 0}</p>
                  <p className="text-sm text-muted-foreground">प्रकाशित</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-full">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-yellow-600">{stats?.draftArticles || 0}</p>
                  <p className="text-sm text-muted-foreground">ड्राफ्ट</p>
                </div>
                <div className="p-3 bg-yellow-500/10 rounded-full">
                  <FileEdit className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">{stats?.totalCategories || 0}</p>
                  <p className="text-sm text-muted-foreground">श्रेणीहरू</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FolderOpen className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{stats?.totalViews?.toLocaleString() || 0}</p>
                  <p className="text-sm text-muted-foreground">कुल हेराइ</p>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <Eye className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Articles & Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Articles Sidebar */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  हालैका समाचार
                </CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/admin/articles/new" className="text-primary">
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <CardDescription>पछिल्ला ५ समाचारहरू</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : recentArticles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>कुनै समाचार छैन</p>
                  <Button asChild size="sm" className="mt-3">
                    <Link to="/admin/articles/new">नयाँ समाचार थप्नुहोस्</Link>
                  </Button>
                </div>
              ) : (
                recentArticles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/admin/articles/${article.id}`}
                    className="block p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={article.is_published ? "default" : "secondary"} className="text-xs">
                            {article.is_published ? 'प्रकाशित' : 'ड्राफ्ट'}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(article.created_at!), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="articles" className="space-y-4">
              <TabsList className="w-full justify-start bg-card border overflow-x-auto flex-nowrap">
                <TabsTrigger value="articles" className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">समाचारहरू</span>
                  <span className="sm:hidden">समाचार</span>
                </TabsTrigger>
                {canManageCategories && (
                  <TabsTrigger id="categories-tab" value="categories" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <FolderOpen className="h-4 w-4" />
                    श्रेणीहरू
                  </TabsTrigger>
                )}
                {canManageUsers && (
                  <TabsTrigger id="users-tab" value="users" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Users className="h-4 w-4" />
                    प्रयोगकर्ताहरू
                  </TabsTrigger>
                )}
                {isAdmin && (
                  <TabsTrigger id="ads-tab" value="ads" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Megaphone className="h-4 w-4" />
                    विज्ञापन
                  </TabsTrigger>
                )}
                {isAdmin && (
                  <TabsTrigger id="settings-tab" value="settings" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Settings className="h-4 w-4" />
                    साइट सेटिङ
                  </TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="articles" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <ArticleList 
                      articles={articles} 
                      isLoading={isLoading} 
                      onRefresh={refetch}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              {canManageCategories && (
                <TabsContent value="categories" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <CategoryList 
                        categories={categories} 
                        isLoading={categoriesLoading} 
                        onRefresh={refetchCategories}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {canManageUsers && (
                <TabsContent value="users" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <UserManagement />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="ads" className="mt-4">
                  <AdvertisementManagement />
                </TabsContent>
              )}

              {isAdmin && (
                <TabsContent value="settings" className="mt-4">
                  <Card>
                    <CardContent className="p-0">
                      <SiteSettingsForm />
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
