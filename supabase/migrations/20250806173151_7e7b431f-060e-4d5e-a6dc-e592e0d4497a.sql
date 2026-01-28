
-- Add a table to track manual order creation
ALTER TABLE public.orders 
ADD COLUMN created_by uuid REFERENCES auth.users,
ADD COLUMN order_source text DEFAULT 'system' CHECK (order_source IN ('system', 'manual', 'provider'));

-- Update the orders table to make patient_id optional initially for manual creation workflow
ALTER TABLE public.orders 
ALTER COLUMN patient_id DROP NOT NULL;

-- Add a trigger to ensure patient_id is set before order completion
CREATE OR REPLACE FUNCTION ensure_patient_id_before_completion()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'pending' AND NEW.patient_id IS NULL THEN
    RAISE EXCEPTION 'Patient ID must be set before order can be processed';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_patient_id_before_completion
  BEFORE UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION ensure_patient_id_before_completion();
