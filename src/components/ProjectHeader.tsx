import React from 'react';
import { Badge } from "@/components/ui/badge";
import { User, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Project {
  id: number;
  name: string;
  department: string;
  lead: string;
  pmStatus: 'red' | 'amber' | 'green';
  opsStatus: 'red' | 'amber' | 'green';
  healthTrend: 'improving' | 'declining' | 'constant';
  pastWeeksStatus: Array<{ week: string; status: 'red' | 'amber' | 'green' }>;
}

interface ProjectHeaderProps {
  project: Project;
}

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "On Track",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  amber: {
    color: "bg-amber-500", 
    label: "At Risk",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  red: {
    color: "bg-red-500",
    label: "Delayed", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  }
};

const trendConfig = {
  improving: {
    icon: TrendingUp,
    color: "text-green-600",
    label: "Improving"
  },
  declining: {
    icon: TrendingDown,
    color: "text-red-600",
    label: "Declining"
  },
  constant: {
    icon: Minus,
    color: "text-amber-600",
    label: "Constant"
  }
};

export const ProjectHeader: React.FC<ProjectHeaderProps> = ({ project }) => {
  const pmConfig = statusConfig[project.pmStatus];
  const opsConfig = statusConfig[project.opsStatus];
  const trendData = trendConfig[project.healthTrend];
  const TrendIcon = trendData.icon;

  return (
    <div className="bg-white rounded-lg shadow-lg border border-slate-200 overflow-hidden">
      {/* Notebook Header - Rings/Binding Effect */}
      <div className="bg-slate-100 border-b border-slate-200 p-1">
        <div className="flex justify-center space-x-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="w-4 h-4 rounded-full bg-slate-300 shadow-inner"></div>
          ))}
        </div>
      </div>

      {/* Project Header */}
      <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{project.name}</h1>
            <div className="flex items-center gap-3">
              <Badge variant="outline">{project.department}</Badge>
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <User className="w-4 h-4" />
                {project.lead}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <TrendIcon className={`w-5 h-5 ${trendData.color}`} />
              <span className={`text-sm font-medium ${trendData.color}`}>
                {trendData.label}
              </span>
            </div>
            <div className="text-xs text-slate-500">Health Trend (2 weeks)</div>
          </div>
        </div>

        {/* Status Row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">PM Status</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${pmConfig.bgColor} ${pmConfig.textColor}`}>
              <div className={`w-2 h-2 rounded-full ${pmConfig.color}`}></div>
              <span className="text-sm font-medium">{pmConfig.label}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-700">Ops Status</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${opsConfig.bgColor} ${opsConfig.textColor}`}>
              <div className={`w-2 h-2 rounded-full ${opsConfig.color}`}></div>
              <span className="text-sm font-medium">{opsConfig.label}</span>
            </div>
          </div>
        </div>

        {/* Past Weeks Status */}
        <div className="mt-6 space-y-3">
          <div className="text-sm font-medium text-slate-700">Past 4 Weeks Status</div>
          <div className="flex items-center gap-3">
            {project.pastWeeksStatus.map((week, index) => (
              <div key={index} className="flex flex-col items-center gap-1">
                <div 
                  className={`w-3 h-3 rounded-full border-2 border-dashed ${
                    week.status === 'green' ? 'bg-green-500 border-green-300' :
                    week.status === 'amber' ? 'bg-amber-500 border-amber-300' :
                    'bg-red-500 border-red-300'
                  }`}
                ></div>
                <span className="text-xs text-slate-500">{week.week}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};