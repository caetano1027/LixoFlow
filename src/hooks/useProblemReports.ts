import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ProblemType = 'ponto_cheio' | 'caminhao_nao_passou' | 'ponto_inexistente' | 'outro';
export type ReportStatus = 'pendente' | 'em_andamento' | 'resolvido';

export interface ProblemReport {
  id: string;
  user_id: string;
  problem_type: ProblemType;
  description: string | null;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
}

export const PROBLEM_TYPE_LABELS: Record<ProblemType, string> = {
  ponto_cheio: 'Ponto de coleta cheio',
  caminhao_nao_passou: 'Caminhão não passou',
  ponto_inexistente: 'Ponto inexistente',
  outro: 'Outro',
};

export const useProblemReports = () => {
  return useQuery({
    queryKey: ['problem_reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('problem_reports')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as ProblemReport[];
    },
  });
};

export const useCreateReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (r: Omit<ProblemReport, 'id' | 'created_at' | 'updated_at' | 'status'>) => {
      const { data, error } = await supabase.from('problem_reports').insert({ ...r, status: 'pendente' }).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problem_reports'] }),
  });
};

export const useUpdateReportStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ReportStatus }) => {
      const { error } = await supabase.from('problem_reports').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problem_reports'] }),
  });
};

export const useDeleteReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('problem_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['problem_reports'] }),
  });
};
