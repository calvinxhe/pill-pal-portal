-- Create encounter status enum
CREATE TYPE public.encounter_status AS ENUM ('in_progress', 'completed', 'cancelled');

-- Create queue status enum
CREATE TYPE public.queue_status AS ENUM ('waiting', 'called', 'in_progress', 'done');

-- Create patients table
CREATE TABLE public.patients (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    date_of_birth DATE,
    phone TEXT,
    email TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    insurance_provider TEXT,
    insurance_member_id TEXT,
    cgm_prescription_active BOOLEAN DEFAULT false,
    freestyle_libre_app_installed BOOLEAN DEFAULT false,
    consent_form_signed BOOLEAN DEFAULT false,
    insurance_cgm_coverage_verified BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cgm_encounters table
CREATE TABLE public.cgm_encounters (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    staff_user_id UUID NOT NULL REFERENCES auth.users(id),
    status encounter_status NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    ended_at TIMESTAMP WITH TIME ZONE,
    total_duration_seconds INTEGER,
    copay_amount DECIMAL(10,2),
    sensor_serial_number TEXT,
    app_pairing_verified BOOLEAN DEFAULT false,
    data_sync_verified BOOLEAN DEFAULT false,
    refill_reminder_given BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create encounter_checklist_items table
CREATE TABLE public.encounter_checklist_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    encounter_id UUID NOT NULL REFERENCES public.cgm_encounters(id) ON DELETE CASCADE,
    step_key TEXT NOT NULL,
    step_label TEXT NOT NULL,
    step_order INTEGER NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_queue table
CREATE TABLE public.patient_queue (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL,
    intake_form_completed BOOLEAN DEFAULT false,
    status queue_status NOT NULL DEFAULT 'waiting',
    queued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    called_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cgm_encounters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encounter_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_queue ENABLE ROW LEVEL SECURITY;

-- Patients: All authenticated users can CRUD
CREATE POLICY "Authenticated users can view patients" 
ON public.patients FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can create patients" 
ON public.patients FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete patients" 
ON public.patients FOR DELETE TO authenticated USING (true);

-- CGM Encounters: All authenticated users can view, staff can manage their own
CREATE POLICY "Authenticated users can view encounters" 
ON public.cgm_encounters FOR SELECT TO authenticated USING (true);

CREATE POLICY "Staff can create encounters" 
ON public.cgm_encounters FOR INSERT TO authenticated WITH CHECK (auth.uid() = staff_user_id);

CREATE POLICY "Staff can update own encounters" 
ON public.cgm_encounters FOR UPDATE TO authenticated USING (auth.uid() = staff_user_id);

CREATE POLICY "Staff can delete own encounters" 
ON public.cgm_encounters FOR DELETE TO authenticated USING (auth.uid() = staff_user_id);

-- Encounter Checklist Items: Follow encounter access
CREATE POLICY "Authenticated users can view checklist items" 
ON public.encounter_checklist_items FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can manage checklist items" 
ON public.encounter_checklist_items FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update checklist items" 
ON public.encounter_checklist_items FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete checklist items" 
ON public.encounter_checklist_items FOR DELETE TO authenticated USING (true);

-- Patient Queue: All authenticated users can manage
CREATE POLICY "Authenticated users can view queue" 
ON public.patient_queue FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can add to queue" 
ON public.patient_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update queue" 
ON public.patient_queue FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can remove from queue" 
ON public.patient_queue FOR DELETE TO authenticated USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Add triggers for updated_at
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cgm_encounters_updated_at
    BEFORE UPDATE ON public.cgm_encounters
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_cgm_encounters_patient_id ON public.cgm_encounters(patient_id);
CREATE INDEX idx_cgm_encounters_staff_user_id ON public.cgm_encounters(staff_user_id);
CREATE INDEX idx_cgm_encounters_status ON public.cgm_encounters(status);
CREATE INDEX idx_cgm_encounters_started_at ON public.cgm_encounters(started_at);
CREATE INDEX idx_encounter_checklist_items_encounter_id ON public.encounter_checklist_items(encounter_id);
CREATE INDEX idx_patient_queue_status ON public.patient_queue(status);
CREATE INDEX idx_patient_queue_patient_id ON public.patient_queue(patient_id);