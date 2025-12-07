import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import CategoryPage from "./pages/CategoryPage";
import ArticlePage from "./pages/ArticlePage";
import AuthPage from "./pages/AuthPage";
import SearchPage from "./pages/SearchPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminArticleNew from "./pages/AdminArticleNew";
import AdminArticleEdit from "./pages/AdminArticleEdit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/category/:slug" element={<CategoryPage />} />
            <Route path="/article/:slug" element={<ArticlePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/articles/new" element={<AdminArticleNew />} />
            <Route path="/admin/articles/edit/:id" element={<AdminArticleEdit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
