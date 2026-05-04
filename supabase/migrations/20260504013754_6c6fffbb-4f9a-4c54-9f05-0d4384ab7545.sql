
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TYPE public.problem_type AS ENUM ('ponto_cheio', 'caminhao_nao_passou', 'ponto_inexistente', 'outro');
CREATE TYPE public.report_status AS ENUM ('pendente', 'em_andamento', 'resolvido');

CREATE TABLE public.problem_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  problem_type public.problem_type NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  photo_url TEXT,
  status public.report_status NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.problem_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own reports" ON public.problem_reports
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own reports" ON public.problem_reports
FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all reports" ON public.problem_reports
FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update reports" ON public.problem_reports
FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete reports" ON public.problem_reports
FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_problem_reports_updated_at
BEFORE UPDATE ON public.problem_reports
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public) VALUES ('problem-photos', 'problem-photos', true);

CREATE POLICY "Problem photos publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'problem-photos');
CREATE POLICY "Authenticated users can upload problem photos" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'problem-photos' AND auth.uid()::text = (storage.foldername(name))[1]);
