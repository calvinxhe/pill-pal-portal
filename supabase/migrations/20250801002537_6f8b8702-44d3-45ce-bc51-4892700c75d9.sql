-- Create custom types
CREATE TYPE public.user_role AS ENUM ('admin', 'pharmacist', 'technician', 'support_staff', 'manager');
CREATE TYPE public.order_status AS ENUM ('pending', 'assigned', 'shipped', 'delivered', 'cancelled');
CREATE TYPE public.ticket_status AS ENUM ('open', 'assigned', 'in_progress', 'resolved', 'escalated');
CREATE TYPE public.ticket_type AS ENUM ('lost_device', 'damaged_device', 'setup_help', 'troubleshooting', 'other');
CREATE TYPE public.agreement_type AS ENUM ('master_agreement', 'baa', 'exclusivity', 'territory_lease');
CREATE TYPE public.training_status AS ENUM ('not_started', 'in_progress', 'completed');

-- Profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'support_staff',
  pharmacy_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pharmacies table
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  npi TEXT,
  license_number TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  bank_account_info JSONB,
  territory_zip_codes TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pharmacy_id)
);

-- Agreements table
CREATE TABLE public.agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  type agreement_type NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  signed_at TIMESTAMPTZ,
  signed_by UUID REFERENCES auth.users(id),
  document_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training modules table
CREATE TABLE public.training_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  content TEXT,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User training progress table
CREATE TABLE public.user_training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  training_module_id UUID NOT NULL REFERENCES public.training_modules(id) ON DELETE CASCADE,
  status training_status NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, training_module_id)
);

-- Patients table
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  phone TEXT,
  email TEXT,
  insurance_info JSONB,
  referring_provider TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  device_type TEXT NOT NULL,
  device_serial TEXT,
  status order_status NOT NULL DEFAULT 'pending',
  shipping_label_url TEXT,
  tracking_number TEXT,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  reimbursement_amount DECIMAL(10,2),
  claim_submitted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Support tickets table
CREATE TABLE public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES auth.users(id),
  type ticket_type NOT NULL,
  status ticket_status NOT NULL DEFAULT 'open',
  title TEXT NOT NULL,
  description TEXT,
  resolution_notes TEXT,
  transaction_fee DECIMAL(10,2) DEFAULT 1.60,
  resolved_at TIMESTAMPTZ,
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket interactions table
CREATE TABLE public.ticket_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  interaction_type TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Revenue tracking table
CREATE TABLE public.revenue_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES public.pharmacies(id) ON DELETE CASCADE,
  ticket_id UUID REFERENCES public.support_tickets(id),
  order_id UUID REFERENCES public.orders(id),
  amount DECIMAL(10,2) NOT NULL,
  fee_type TEXT NOT NULL,
  manager_share DECIMAL(10,2) DEFAULT 0,
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient adherence tracking table
CREATE TABLE public.patient_adherence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  month_year DATE NOT NULL,
  readings_count INTEGER DEFAULT 0,
  benchmark_met BOOLEAN DEFAULT false,
  last_reading_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(patient_id, month_year)
);

-- Knowledge base articles table
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  search_vector tsvector,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_training_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_adherence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create function to get user's pharmacy
CREATE OR REPLACE FUNCTION public.get_user_pharmacy(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT pharmacy_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for pharmacies
CREATE POLICY "Users can view their pharmacy" 
ON public.pharmacies FOR SELECT 
USING (id = public.get_user_pharmacy(auth.uid()));

CREATE POLICY "Admins can manage pharmacies" 
ON public.pharmacies FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- RLS Policies for orders
CREATE POLICY "Users can view pharmacy orders" 
ON public.orders FOR SELECT 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

CREATE POLICY "Users can manage pharmacy orders" 
ON public.orders FOR ALL 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

-- RLS Policies for support tickets
CREATE POLICY "Users can view pharmacy tickets" 
ON public.support_tickets FOR SELECT 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

CREATE POLICY "Users can manage pharmacy tickets" 
ON public.support_tickets FOR ALL 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

-- RLS Policies for training modules (public read)
CREATE POLICY "Anyone can view training modules" 
ON public.training_modules FOR SELECT 
USING (true);

-- RLS Policies for user training progress
CREATE POLICY "Users can view own training progress" 
ON public.user_training_progress FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own training progress" 
ON public.user_training_progress FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for knowledge base (public read)
CREATE POLICY "Anyone can view knowledge base" 
ON public.knowledge_base FOR SELECT 
USING (true);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at
  BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agreements_updated_at
  BEFORE UPDATE ON public.agreements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_modules_updated_at
  BEFORE UPDATE ON public.training_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_training_progress_updated_at
  BEFORE UPDATE ON public.user_training_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_adherence_updated_at
  BEFORE UPDATE ON public.patient_adherence
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample training modules
INSERT INTO public.training_modules (title, description, is_required) VALUES
('HIPAA Compliance Training', 'Learn about HIPAA requirements and patient privacy protection', true),
('Device Fulfillment Process', 'Step-by-step guide to processing and shipping RPM devices', true),
('Support Ticket Management', 'How to handle patient support requests effectively', true),
('Revenue Tracking System', 'Understanding the transaction fee structure and reporting', false),
('Platform Navigation', 'Getting familiar with the pharmacy portal interface', false);

-- Insert sample knowledge base articles
INSERT INTO public.knowledge_base (title, content, category, tags) VALUES
('How to Ship RPM Devices', 'Detailed instructions for packaging and shipping RPM devices to patients...', 'Device Fulfillment', ARRAY['shipping', 'devices', 'fulfillment']),
('Troubleshooting Device Setup', 'Common issues patients face when setting up their RPM devices and solutions...', 'Patient Support', ARRAY['troubleshooting', 'setup', 'devices']),
('Insurance Billing Guidelines', 'Step-by-step process for submitting insurance claims for RPM devices...', 'Billing', ARRAY['insurance', 'billing', 'claims']),
('Patient Privacy Best Practices', 'HIPAA-compliant practices for handling patient information...', 'Compliance', ARRAY['hipaa', 'privacy', 'compliance']);