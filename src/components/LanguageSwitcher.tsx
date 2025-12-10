import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { languages } from '@/lib/translations';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ne' ? 'en' : 'ne');
  };

  const currentLang = languages.find(l => l.code === language);
  const otherLang = languages.find(l => l.code !== language);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="text-xs font-medium px-2 py-1 h-7"
      title={`Switch to ${otherLang?.name}`}
    >
      <span className="font-bold">{language === 'ne' ? 'EN' : 'ने'}</span>
    </Button>
  );
}
