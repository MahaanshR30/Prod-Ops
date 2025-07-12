import React, { useState } from 'react';
import { ResourceOverview } from "@/components/ResourceOverview";
import { projectsAndProducts } from "@/data/projectsData";

const Resources = () => {
  const [projectsData] = useState(projectsAndProducts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Resource Management</h1>
          <p className="text-slate-600 mt-1">Monitor and optimize resource allocation across projects</p>
        </div>
        
        <ResourceOverview projects={projectsData} />
      </div>
    </div>
  );
};

export default Resources;