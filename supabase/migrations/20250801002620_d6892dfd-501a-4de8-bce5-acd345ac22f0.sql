-- Fix security issues from previous migration

-- Add missing RLS policies for user_roles table
CREATE POLICY "Users can view their roles" 
ON public.user_roles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage user roles" 
ON public.user_roles FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Add missing RLS policies for agreements table
CREATE POLICY "Users can view pharmacy agreements" 
ON public.agreements FOR SELECT 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

CREATE POLICY "Admins can manage agreements" 
ON public.agreements FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Add missing RLS policies for patients table
CREATE POLICY "Users can view pharmacy patients" 
ON public.patients FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE patient_id = patients.id 
  AND pharmacy_id = public.get_user_pharmacy(auth.uid())
));

CREATE POLICY "Users can manage pharmacy patients" 
ON public.patients FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.orders 
  WHERE patient_id = patients.id 
  AND pharmacy_id = public.get_user_pharmacy(auth.uid())
));

-- Add missing RLS policies for ticket_interactions table
CREATE POLICY "Users can view pharmacy ticket interactions" 
ON public.ticket_interactions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.support_tickets st
  WHERE st.id = ticket_interactions.ticket_id 
  AND st.pharmacy_id = public.get_user_pharmacy(auth.uid())
));

CREATE POLICY "Users can manage pharmacy ticket interactions" 
ON public.ticket_interactions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.support_tickets st
  WHERE st.id = ticket_interactions.ticket_id 
  AND st.pharmacy_id = public.get_user_pharmacy(auth.uid())
));

-- Add missing RLS policies for revenue_tracking table
CREATE POLICY "Users can view pharmacy revenue" 
ON public.revenue_tracking FOR SELECT 
USING (pharmacy_id = public.get_user_pharmacy(auth.uid()));

CREATE POLICY "Admins can manage revenue tracking" 
ON public.revenue_tracking FOR ALL 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'manager'));

-- Add missing RLS policies for patient_adherence table
CREATE POLICY "Users can view pharmacy patient adherence" 
ON public.patient_adherence FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = patient_adherence.order_id 
  AND o.pharmacy_id = public.get_user_pharmacy(auth.uid())
));

CREATE POLICY "Users can manage pharmacy patient adherence" 
ON public.patient_adherence FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.orders o
  WHERE o.id = patient_adherence.order_id 
  AND o.pharmacy_id = public.get_user_pharmacy(auth.uid())
));

-- Fix function search path issues by setting explicit search_path
DROP FUNCTION IF EXISTS public.has_role(UUID, user_role);
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role user_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

DROP FUNCTION IF EXISTS public.get_user_pharmacy(UUID);
CREATE OR REPLACE FUNCTION public.get_user_pharmacy(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT pharmacy_id
  FROM public.profiles
  WHERE user_id = _user_id
$$;

DROP FUNCTION IF EXISTS public.update_updated_at_column();
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;