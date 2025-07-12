import React, { useState } from 'react';
import { IssuesTracker } from "@/components/IssuesTracker";
import { projectsAndProducts } from "@/data/projectsData";

const Escalation = () => {
  const [projectsData] = useState(projectsAndProducts);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Escalation Management</h1>
          <p className="text-slate-600 mt-1">Track and resolve critical issues requiring escalation</p>
        </div>
        
        <IssuesTracker projects={projectsData} />
      </div>
    </div>
  );
};

export default Escalation;