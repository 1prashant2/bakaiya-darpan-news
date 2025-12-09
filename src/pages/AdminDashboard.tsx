import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ArticleList } from '@/components/admin/ArticleList';
import { CategoryList } from '@/components/admin/CategoryList';
import { UserManagement } from '@/components/admin/UserManagement';
import { Article, Category } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, FileText, FolderOpen, Users } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAdmin, isEditor, isSuperAdmin, canManageCategories, canManageUsers, loading: authLoading } = useAuth();
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

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [articlesRes, categoriesRes] = await Promise.all([
        supabase.from('articles').select('id, is_published'),
        supabase.from('categories').select('id'),
      ]);

      const articles = articlesRes.data || [];
      const categoriesData = categoriesRes.data || [];

      return {
        totalArticles: articles.length,
        publishedArticles: articles.filter(a => a.is_published).length,
        draftArticles: articles.filter(a => !a.is_published).length,
        totalCategories: categoriesData.length,
      };
    },
    enabled: !!user && (isAdmin || isEditor),
  });

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isEditor)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="news-container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">एडमिन ड्यासबोर्ड</h1>
            </div>
            <a href="/" className="text-sm text-muted-foreground hover:text-primary">
              साइटमा जानुहोस् →
            </a>
          </div>
        </div>
      </header>

      <main className="news-container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalArticles || 0}</p>
                <p className="text-sm text-muted-foreground">जम्मा समाचार</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.publishedArticles || 0}</p>
                <p className="text-sm text-muted-foreground">प्रकाशित</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <FileText className="h-5 w-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.draftArticles || 0}</p>
                <p className="text-sm text-muted-foreground">ड्राफ्ट</p>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FolderOpen className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats?.totalCategories || 0}</p>
                <p className="text-sm text-muted-foreground">श्रेणीहरू</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Articles, Categories, and Users */}
        <Tabs defaultValue="articles" className="space-y-4">
          <TabsList>
            <TabsTrigger value="articles" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              समाचारहरू
            </TabsTrigger>
            {canManageCategories && (
              <TabsTrigger value="categories" className="flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                श्रेणीहरू
              </TabsTrigger>
            )}
            {canManageUsers && (
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                प्रयोगकर्ताहरू
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="articles">
            <ArticleList 
              articles={articles} 
              isLoading={isLoading} 
              onRefresh={refetch}
            />
          </TabsContent>
          
          {canManageCategories && (
            <TabsContent value="categories">
              <CategoryList 
                categories={categories} 
                isLoading={categoriesLoading} 
                onRefresh={refetchCategories}
              />
            </TabsContent>
          )}

          {canManageUsers && (
            <TabsContent value="users">
              <UserManagement />
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
