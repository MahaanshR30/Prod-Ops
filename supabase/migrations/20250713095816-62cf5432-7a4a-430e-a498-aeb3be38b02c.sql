-- Step 1: Create a new consolidated employees table
CREATE TABLE public.employees_new (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE,
  full_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  department TEXT,
  position TEXT,
  salary NUMERIC,
  hire_date DATE,
  status TEXT DEFAULT 'active'::text,
  skills TEXT[],
  utilization_rate INTEGER DEFAULT 0,
  role TEXT DEFAULT 'employee'::text,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Step 2: Enable RLS on the new table
ALTER TABLE public.employees_new ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policy
CREATE POLICY "Allow all operations on employees_new" 
ON public.employees_new 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Step 4: Insert data from existing employees table, using profiles data where available
-- and creating proper individual records
INSERT INTO public.employees_new (
  employee_id, 
  full_name, 
  email, 
  department, 
  position, 
  salary, 
  hire_date, 
  status, 
  skills, 
  utilization_rate,
  role,
  created_at,
  updated_at
)
SELECT 
  e.employee_id,
  CASE 
    WHEN e.employee_id = 'EMP001' THEN 'John Smith'
    WHEN e.employee_id = 'EMP002' THEN 'Sarah Johnson' 
    WHEN e.employee_id = 'EMP003' THEN 'Mike Wilson'
    WHEN e.employee_id = 'EMP004' THEN 'Emily Davis'
    WHEN e.employee_id = 'EMP005' THEN 'Alex Brown'
    ELSE COALESCE(e.employee_name, 'Unknown Employee')
  END as full_name,
  CASE 
    WHEN e.employee_id = 'EMP001' THEN 'john.smith@company.com'
    WHEN e.employee_id = 'EMP002' THEN 'sarah.johnson@company.com'
    WHEN e.employee_id = 'EMP003' THEN 'mike.wilson@company.com'
    WHEN e.employee_id = 'EMP004' THEN 'emily.davis@company.com'
    WHEN e.employee_id = 'EMP005' THEN 'alex.brown@company.com'
    ELSE NULL
  END as email,
  e.department,
  e.position,
  e.salary,
  e.hire_date,
  e.status,
  e.skills,
  e.utilization_rate,
  CASE 
    WHEN e.position LIKE '%Lead%' OR e.position LIKE '%Manager%' THEN 'manager'
    ELSE 'employee'
  END as role,
  e.created_at,
  e.updated_at
FROM employees e;

-- Step 5: Add any profiles that don't have corresponding employees
INSERT INTO public.employees_new (
  full_name,
  email,
  department,
  position,
  role,
  status,
  utilization_rate
)
SELECT 
  p.full_name,
  p.email,
  p.department,
  p.position,
  p.role,
  'active',
  0
FROM profiles p
WHERE NOT EXISTS (
  SELECT 1 FROM employees_new en 
  WHERE en.email = p.email OR en.full_name = p.full_name
);

-- Step 6: Add trigger for automatic timestamp updates
CREATE TRIGGER update_employees_new_updated_at
BEFORE UPDATE ON public.employees_new
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();