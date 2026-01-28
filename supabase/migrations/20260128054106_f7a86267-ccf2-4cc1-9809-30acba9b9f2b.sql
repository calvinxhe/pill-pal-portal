-- Create time_type enum
CREATE TYPE public.time_type AS ENUM ('PCM', 'CCM', 'TCM');

-- Create timesheet_entries table
CREATE TABLE public.timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  staff_user_id uuid NOT NULL,
  encounter_id uuid REFERENCES public.cgm_encounters(id) ON DELETE SET NULL,
  duration_seconds integer NOT NULL,
  notes text,
  time_type public.time_type NOT NULL DEFAULT 'PCM',
  source text NOT NULL DEFAULT 'manual',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view entries"
  ON public.timesheet_entries FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Staff can create entries"
  ON public.timesheet_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = staff_user_id);

CREATE POLICY "Staff can update own entries"
  ON public.timesheet_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = staff_user_id);

CREATE POLICY "Staff can delete own entries"
  ON public.timesheet_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = staff_user_id);

-- Create indexes for performance
CREATE INDEX idx_timesheet_entries_created ON public.timesheet_entries(created_at);
CREATE INDEX idx_timesheet_entries_patient ON public.timesheet_entries(patient_id);
CREATE INDEX idx_timesheet_entries_staff ON public.timesheet_entries(staff_user_id);