import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSettings {
  site_name: string;
  site_description: string;
  contact_phone: string;
  contact_email: string;
  contact_address: string;
  facebook_url: string;
  twitter_url: string;
  youtube_url: string;
  instagram_url: string;
  whatsapp_number: string;
}

export function useSiteSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      const settingsMap: SiteSettings = {
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
      };

      data?.forEach((item: { key: string; value: string | null }) => {
        if (item.key in settingsMap) {
          settingsMap[item.key as keyof SiteSettings] = item.value || '';
        }
      });

      return settingsMap;
    },
  });

  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<SiteSettings>) => {
      const updates = Object.entries(newSettings).map(([key, value]) => ({
        key,
        value: value || '',
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('site_settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }

      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings,
  };
}
