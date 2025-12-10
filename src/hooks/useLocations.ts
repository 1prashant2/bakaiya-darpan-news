import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Province {
  id: string;
  name: string;
  name_en: string;
  slug: string;
  created_at: string;
}

export interface District {
  id: string;
  province_id: string;
  name: string;
  name_en: string;
  slug: string;
  created_at: string;
}

export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provinces')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data as Province[];
    },
  });
}

export function useDistricts(provinceId?: string) {
  return useQuery({
    queryKey: ['districts', provinceId],
    queryFn: async () => {
      let query = supabase.from('districts').select('*');
      
      if (provinceId) {
        query = query.eq('province_id', provinceId);
      }
      
      const { data, error } = await query.order('name');
      
      if (error) throw error;
      return data as District[];
    },
    enabled: provinceId !== undefined || true,
  });
}
