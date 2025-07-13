import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  priority: string;
  start_date?: string;
  end_date?: string;
  budget?: number;
  progress: number;
  manager_id?: string;
  created_at: string;
  updated_at: string;
  manager?: {
    full_name: string;
    department: string;
  };
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  assignee?: {
    full_name: string;
    department: string;
  };
  project?: {
    name: string;
  };
}

export interface Issue {
  id: string;
  project_id?: string;
  title: string;
  description?: string;
  severity: string;
  status: string;
  reported_by?: string;
  assigned_to?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
  reporter?: {
    full_name: string;
  };
  assignee?: {
    full_name: string;
  };
  project?: {
    name: string;
  };
}

export interface Deliverable {
  id: string;
  project_id?: string;
  name: string;
  description?: string;
  type?: string;
  status: string;
  due_date?: string;
  completed_date?: string;
  responsible_employee?: string;
  created_at: string;
  updated_at: string;
  employee?: {
    full_name: string;
    department: string;
  };
  project?: {
    name: string;
  };
}

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      const { data: projectsData, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch managers separately to avoid relationship issues
      const managerIds = projectsData?.map(p => p.manager_id).filter(Boolean) || [];
      const { data: managersData } = await supabase
        .from('employees')
        .select('id, full_name, department')
        .in('id', managerIds);

      const managersMap = new Map(managersData?.map(m => [m.id, m]) || []);

      const projectsWithManagers = projectsData?.map(project => ({
        ...project,
        manager: project.manager_id ? managersMap.get(project.manager_id) : null
      })) || [];

      setProjects(projectsWithManagers);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Unable to load projects. Please check your connection and try again.');
    }
  };

  const fetchTasks = async () => {
    try {
      const { data: tasksData, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch projects and employees separately
      const projectIds = tasksData?.map(t => t.project_id).filter(Boolean) || [];
      const employeeIds = tasksData?.map(t => t.assigned_to).filter(Boolean) || [];

      const [{ data: projectsData }, { data: employeesData }] = await Promise.all([
        supabase.from('projects').select('id, name').in('id', projectIds),
        supabase.from('employees').select('id, full_name, department').in('id', employeeIds)
      ]);

      const projectsMap = new Map(projectsData?.map(p => [p.id, p]) || []);
      const employeesMap = new Map(employeesData?.map(e => [e.id, e]) || []);

      const transformedTasks = tasksData?.map(task => ({
        ...task,
        assignee: task.assigned_to ? employeesMap.get(task.assigned_to) : null,
        project: task.project_id ? projectsMap.get(task.project_id) : null
      })) || [];
      
      setTasks(transformedTasks);
    } catch (err) {
      console.error('Error fetching project tasks:', err);
      setError('Unable to load project tasks. Please check your connection.');
    }
  };

  const fetchIssues = async () => {
    try {
      const { data: issuesData, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch projects and employees separately
      const projectIds = issuesData?.map(i => i.project_id).filter(Boolean) || [];
      const reporterIds = issuesData?.map(i => i.reported_by).filter(Boolean) || [];
      const assigneeIds = issuesData?.map(i => i.assigned_to).filter(Boolean) || [];
      const allEmployeeIds = [...new Set([...reporterIds, ...assigneeIds])];

      const [{ data: projectsData }, { data: employeesData }] = await Promise.all([
        supabase.from('projects').select('id, name').in('id', projectIds),
        supabase.from('employees').select('id, full_name').in('id', allEmployeeIds)
      ]);

      const projectsMap = new Map(projectsData?.map(p => [p.id, p]) || []);
      const employeesMap = new Map(employeesData?.map(e => [e.id, e]) || []);
      
      const transformedIssues = issuesData?.map(issue => ({
        ...issue,
        reporter: issue.reported_by ? employeesMap.get(issue.reported_by) : null,
        assignee: issue.assigned_to ? employeesMap.get(issue.assigned_to) : null,
        project: issue.project_id ? projectsMap.get(issue.project_id) : null
      })) || [];
      
      setIssues(transformedIssues);
    } catch (err) {
      console.error('Error fetching project issues:', err);
      setError('Unable to load project issues. Database connection failed.');
    }
  };

  const fetchDeliverables = async () => {
    try {
      const { data: deliverablesData, error } = await supabase
        .from('deliverables')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch projects and employees separately
      const projectIds = deliverablesData?.map(d => d.project_id).filter(Boolean) || [];
      const employeeIds = deliverablesData?.map(d => d.responsible_employee).filter(Boolean) || [];

      const [{ data: projectsData }, { data: employeesData }] = await Promise.all([
        supabase.from('projects').select('id, name').in('id', projectIds),
        supabase.from('employees').select('id, full_name, department').in('id', employeeIds)
      ]);

      const projectsMap = new Map(projectsData?.map(p => [p.id, p]) || []);
      const employeesMap = new Map(employeesData?.map(e => [e.id, e]) || []);
      
      const transformedDeliverables = deliverablesData?.map(deliverable => ({
        ...deliverable,
        employee: deliverable.responsible_employee ? employeesMap.get(deliverable.responsible_employee) : null,
        project: deliverable.project_id ? projectsMap.get(deliverable.project_id) : null
      })) || [];
      
      setDeliverables(transformedDeliverables);
    } catch (err) {
      console.error('Error fetching project deliverables:', err);
      setError('Unable to load project deliverables. Please try again.');
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId);

      if (error) throw error;
      
      // Update local state
      setProjects(prev => 
        prev.map(project => 
          project.id === projectId ? { ...project, status } : project
        )
      );
    } catch (err) {
      console.error('Error updating project status:', err);
      throw err;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProjects(),
        fetchTasks(),
        fetchIssues(),
        fetchDeliverables()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    projects,
    tasks,
    issues,
    deliverables,
    loading,
    error,
    refetch: () => {
      fetchProjects();
      fetchTasks();
      fetchIssues();
      fetchDeliverables();
    },
    updateProjectStatus
  };
};