import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  ad_type: 'image' | 'video' | 'product';
  media_url: string;
  link_url: string | null;
  placement: 'header' | 'sidebar' | 'between_articles' | 'footer';
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export type AdvertisementInsert = Omit<Advertisement, 'id' | 'view_count' | 'click_count' | 'created_at' | 'updated_at'>;

export function useAdvertisements(placement?: string) {
  return useQuery({
    queryKey: ['advertisements', placement],
    queryFn: async () => {
      const now = new Date().toISOString();
      
      let query = supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (placement) {
        query = query.eq('placement', placement);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Advertisement[];
    },
  });
}

export function useAllAdvertisements() {
  return useQuery({
    queryKey: ['all-advertisements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Advertisement[];
    },
  });
}

export function useCreateAdvertisement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (ad: AdvertisementInsert) => {
      const { data, error } = await supabase
        .from('advertisements')
        .insert(ad)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      toast({
        title: 'सफल',
        description: 'विज्ञापन सफलतापूर्वक थपियो',
      });
    },
    onError: (error) => {
      toast({
        title: 'त्रुटि',
        description: 'विज्ञापन थप्न सकिएन',
        variant: 'destructive',
      });
      console.error('Error creating advertisement:', error);
    },
  });
}

export function useUpdateAdvertisement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Advertisement> & { id: string }) => {
      const { data, error } = await supabase
        .from('advertisements')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      toast({
        title: 'सफल',
        description: 'विज्ञापन अपडेट भयो',
      });
    },
    onError: (error) => {
      toast({
        title: 'त्रुटि',
        description: 'विज्ञापन अपडेट गर्न सकिएन',
        variant: 'destructive',
      });
      console.error('Error updating advertisement:', error);
    },
  });
}

export function useDeleteAdvertisement() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['advertisements'] });
      queryClient.invalidateQueries({ queryKey: ['all-advertisements'] });
      toast({
        title: 'सफल',
        description: 'विज्ञापन मेटियो',
      });
    },
    onError: (error) => {
      toast({
        title: 'त्रुटि',
        description: 'विज्ञापन मेट्न सकिएन',
        variant: 'destructive',
      });
      console.error('Error deleting advertisement:', error);
    },
  });
}

export function useTrackAdView() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: ad } = await supabase
        .from('advertisements')
        .select('view_count')
        .eq('id', id)
        .single();
      
      if (ad) {
        await supabase
          .from('advertisements')
          .update({ view_count: (ad.view_count || 0) + 1 })
          .eq('id', id);
      }
    },
  });
}

export function useTrackAdClick() {
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: ad } = await supabase
        .from('advertisements')
        .select('click_count')
        .eq('id', id)
        .single();
      
      if (ad) {
        await supabase
          .from('advertisements')
          .update({ click_count: (ad.click_count || 0) + 1 })
          .eq('id', id);
      }
    },
  });
}
