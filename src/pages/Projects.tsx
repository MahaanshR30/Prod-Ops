import React, { useState } from 'react';
import { ProjectCard } from "@/components/ProjectCard";
import { TaskFilters } from "@/components/TaskFilters";
import { projectsAndProducts } from "@/data/projectsData";

const Projects = () => {
  const [filters, setFilters] = useState({ status: 'all', type: 'all', assignee: '', department: 'all' });
  const [projectsData, setProjectsData] = useState(projectsAndProducts);

  const handleStatusUpdate = (projectId: number, statusType: 'status' | 'pmStatus' | 'opsStatus', newStatus: string) => {
    setProjectsData(prevProjects => 
      prevProjects.map(project => 
        project.id === projectId 
          ? { ...project, [statusType]: newStatus }
          : project
      )
    );
  };
  
  // Filter projects based on filters
  const filteredProjects = projectsData.filter(project => {
    if (filters.status !== "all" && project.status !== filters.status) return false;
    if (filters.department !== "all" && project.department !== filters.department) return false;
    if (filters.assignee && !project.lead?.toLowerCase().includes(filters.assignee.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Projects and Products</h1>
            <p className="text-slate-600 mt-1">Track and manage all your active projects and products</p>
          </div>
          <TaskFilters 
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              onStatusUpdate={handleStatusUpdate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Projects;