-- Add employee_name column to employees table
ALTER TABLE public.employees 
ADD COLUMN employee_name TEXT;

-- Update existing records with placeholder names
UPDATE public.employees 
SET employee_name = 'Employee ' || SUBSTRING(employee_id FROM 1 FOR 3)
WHERE employee_name IS NULL;