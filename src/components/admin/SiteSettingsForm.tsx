import { useState, useEffect } from 'react';
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Youtube, 
  Instagram,
  MessageCircle,
  Save,
  Loader2
} from 'lucide-react';

export function SiteSettingsForm() {
  const { settings, isLoading, updateSettings } = useSiteSettings();
  const [formData, setFormData] = useState<SiteSettings>({
    site_name: '',
    site_description: '',
    contact_phone: '',
    contact_email: '',
    contact_address: '',
    facebook_url: '',
    twitter_url: '',
    youtube_url: '',
    instagram_url: '',
    whatsapp_number: '',
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const handleChange = (key: keyof SiteSettings, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings.mutateAsync(formData);
      toast({
        title: 'सफलता',
        description: 'साइट सेटिङहरू अपडेट भयो',
      });
    } catch (error) {
      toast({
        title: 'त्रुटि',
        description: 'सेटिङहरू अपडेट गर्न सकिएन',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6">
      {/* Site Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            साइट जानकारी
          </CardTitle>
          <CardDescription>आफ्नो साइटको नाम र विवरण सेट गर्नुहोस्</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="site_name">साइटको नाम</Label>
            <Input
              id="site_name"
              value={formData.site_name}
              onChange={(e) => handleChange('site_name', e.target.value)}
              placeholder="प्रेस दर्पण"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="site_description">विवरण</Label>
            <Textarea
              id="site_description"
              value={formData.site_description}
              onChange={(e) => handleChange('site_description', e.target.value)}
              placeholder="साइटको छोटो विवरण..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            सम्पर्क जानकारी
          </CardTitle>
          <CardDescription>फुटरमा देखिने सम्पर्क विवरणहरू</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                फोन नम्बर
              </Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => handleChange('contact_phone', e.target.value)}
                placeholder="+977-1-XXXXXXX"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email" className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                इमेल
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleChange('contact_email', e.target.value)}
                placeholder="info@example.com"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_address" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              ठेगाना
            </Label>
            <Input
              id="contact_address"
              value={formData.contact_address}
              onChange={(e) => handleChange('contact_address', e.target.value)}
              placeholder="काठमाडौं, नेपाल"
            />
          </div>
        </CardContent>
      </Card>

      {/* Social Media */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Facebook className="h-5 w-5" />
            सामाजिक सञ्जाल
          </CardTitle>
          <CardDescription>आफ्नो सामाजिक सञ्जालका लिंकहरू थप्नुहोस्</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="facebook_url" className="flex items-center gap-2">
                <Facebook className="h-4 w-4 text-blue-600" />
                Facebook URL
              </Label>
              <Input
                id="facebook_url"
                value={formData.facebook_url}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitter_url" className="flex items-center gap-2">
                <Twitter className="h-4 w-4 text-sky-500" />
                Twitter/X URL
              </Label>
              <Input
                id="twitter_url"
                value={formData.twitter_url}
                onChange={(e) => handleChange('twitter_url', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube_url" className="flex items-center gap-2">
                <Youtube className="h-4 w-4 text-red-600" />
                YouTube URL
              </Label>
              <Input
                id="youtube_url"
                value={formData.youtube_url}
                onChange={(e) => handleChange('youtube_url', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram_url" className="flex items-center gap-2">
                <Instagram className="h-4 w-4 text-pink-600" />
                Instagram URL
              </Label>
              <Input
                id="instagram_url"
                value={formData.instagram_url}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="whatsapp_number" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp नम्बर
            </Label>
            <Input
              id="whatsapp_number"
              value={formData.whatsapp_number}
              onChange={(e) => handleChange('whatsapp_number', e.target.value)}
              placeholder="+9779XXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              देश कोड सहित पूर्ण नम्बर प्रविष्ट गर्नुहोस् (जस्तै: +9779812345678)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={updateSettings.isPending} className="gap-2">
          {updateSettings.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          परिवर्तनहरू सेभ गर्नुहोस्
        </Button>
      </div>
    </form>
  );
}
