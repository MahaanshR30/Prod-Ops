-- Add foreign key constraints to maintain data integrity
ALTER TABLE public.projects 
ADD CONSTRAINT projects_manager_id_fkey 
FOREIGN KEY (manager_id) REFERENCES public.employees(id);

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);

ALTER TABLE public.tasks 
ADD CONSTRAINT tasks_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_reported_by_fkey 
FOREIGN KEY (reported_by) REFERENCES public.employees(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);

ALTER TABLE public.issues 
ADD CONSTRAINT issues_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.deliverables 
ADD CONSTRAINT deliverables_responsible_employee_fkey 
FOREIGN KEY (responsible_employee) REFERENCES public.employees(id);

ALTER TABLE public.deliverables 
ADD CONSTRAINT deliverables_project_id_fkey 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

ALTER TABLE public.seats 
ADD CONSTRAINT seats_assigned_to_fkey 
FOREIGN KEY (assigned_to) REFERENCES public.employees(id);