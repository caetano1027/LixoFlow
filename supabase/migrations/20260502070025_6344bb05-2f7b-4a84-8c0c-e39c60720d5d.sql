CREATE TABLE public.truck_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  zone TEXT NOT NULL,
  days TEXT NOT NULL,
  time TEXT NOT NULL,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.truck_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active schedules"
ON public.truck_schedules FOR SELECT
USING (active = true);

CREATE POLICY "Admins can insert schedules"
ON public.truck_schedules FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update schedules"
ON public.truck_schedules FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete schedules"
ON public.truck_schedules FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));