import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CollectionPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  opening_hours: string | null;
  materials: string[];
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type CollectionPointInsert = Omit<CollectionPoint, 'id' | 'created_at' | 'updated_at'>;

export const useCollectionPoints = () => {
  return useQuery({
    queryKey: ['collection_points'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('collection_points')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as CollectionPoint[];
    },
  });
};

export const useCreatePoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (point: CollectionPointInsert) => {
      const { data, error } = await supabase.from('collection_points').insert(point).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collection_points'] }),
  });
};

export const useUpdatePoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...point }: Partial<CollectionPoint> & { id: string }) => {
      const { data, error } = await supabase.from('collection_points').update({ ...point, updated_at: new Date().toISOString() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collection_points'] }),
  });
};

export const useDeletePoint = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('collection_points').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['collection_points'] }),
  });
};
