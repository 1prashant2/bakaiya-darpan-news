import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import logo from '@/assets/logo.jpeg';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { data: categories } = useCategories();
  const { user, signOut, isAdmin, isEditor } = useAuth();
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
    }
  };

  const currentDate = new Date().toLocaleDateString(language === 'ne' ? 'ne-NP' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
      {/* Top bar with date and login */}
      <div className="bg-primary text-primary-foreground">
        <div className="news-container py-2 flex items-center justify-between text-sm">
          <span>{currentDate}</span>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary/80 gap-2">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{t.nav.profile}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {(isAdmin || isEditor) && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin">{t.admin.dashboard}</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    {t.nav.logout}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth" className="hover:underline">
                {t.nav.login}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Logo and search */}
      <div className="news-container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0 flex items-center gap-3">
            <img src={logo} alt={settings?.site_name || 'सत्य'} className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-primary">
                {settings?.site_name || 'सत्य'}
              </h1>
              <p className="text-xs text-muted-foreground">{settings?.site_description || 'सत्यको खोजीमा'}</p>
            </div>
          </Link>

          {/* Search bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex items-center gap-2 max-w-sm flex-1">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder={t.search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Mobile buttons */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 text-muted-foreground hover:text-primary"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-muted-foreground hover:text-primary"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {isSearchOpen && (
          <form onSubmit={handleSearch} className="md:hidden mt-4">
            <div className="relative">
              <Input
                type="search"
                placeholder={t.search.placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Navigation */}
      <nav className="border-t border-border bg-card">
        <div className="news-container">
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-1 overflow-x-auto py-2">
            <Link
              to="/"
              className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded transition-colors whitespace-nowrap"
            >
              {t.nav.home}
            </Link>
            {categories?.map((category) => (
              <Link
                key={category.id}
                to={`/category/${category.slug}`}
                className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary hover:bg-secondary rounded transition-colors whitespace-nowrap"
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Mobile navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border animate-fade-in">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-foreground hover:bg-secondary rounded"
              >
                {t.nav.home}
              </Link>
              {categories?.map((category) => (
                <Link
                  key={category.id}
                  to={`/category/${category.slug}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-4 py-3 text-foreground hover:bg-secondary rounded"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
