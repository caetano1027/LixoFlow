import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TruckSchedule {
  id: string;
  zone: string;
  days: string;
  time: string;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type TruckScheduleInsert = Omit<TruckSchedule, 'id' | 'created_at' | 'updated_at'>;

export const useTruckSchedules = () => {
  return useQuery({
    queryKey: ['truck_schedules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('truck_schedules')
        .select('*')
        .order('zone');
      if (error) throw error;
      return data as TruckSchedule[];
    },
  });
};

export const useCreateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (s: TruckScheduleInsert) => {
      const { data, error } = await supabase.from('truck_schedules').insert(s).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck_schedules'] }),
  });
};

export const useUpdateSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...s }: Partial<TruckSchedule> & { id: string }) => {
      const { data, error } = await supabase
        .from('truck_schedules')
        .update({ ...s, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck_schedules'] }),
  });
};

export const useDeleteSchedule = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('truck_schedules').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['truck_schedules'] }),
  });
};
