
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar, Users, AlertTriangle, Clock } from "lucide-react";

interface Project {
  id: number;
  name: string;
  status: "green" | "amber" | "red";
  progress: number;
  dueDate: string;
  department: string;
  lead: string;
  deliverables: number;
  completedDeliverables: number;
  blockers: number;
  teamSize: number;
  hoursAllocated: number;
  hoursUsed: number;
}

interface ProjectCardProps {
  project: Project;
}

const statusConfig = {
  green: {
    color: "bg-green-500",
    label: "On Track",
    textColor: "text-green-700",
    bgColor: "bg-green-50",
    borderColor: "border-green-200"
  },
  amber: {
    color: "bg-amber-500", 
    label: "At Risk",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  },
  red: {
    color: "bg-red-500",
    label: "Delayed", 
    textColor: "text-red-700",
    bgColor: "bg-red-50",
    borderColor: "border-red-200"
  }
};

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const config = statusConfig[project.status];
  const initials = project.lead.split(' ').map(n => n[0]).join('');
  const daysToDeadline = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 ${config.borderColor} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold text-slate-900">{project.name}</CardTitle>
            <Badge variant="outline" className="text-xs">{project.department}</Badge>
          </div>
          <div className={`px-2 py-1 rounded-full ${config.bgColor} ${config.textColor}`}>
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${config.color}`}></div>
              <span className="text-xs font-medium">{config.label}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        {/* Key metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              Due Date
            </div>
            <div className="text-sm font-medium">
              {new Date(project.dueDate).toLocaleDateString()}
            </div>
            <div className={`text-xs ${daysToDeadline < 0 ? 'text-red-600' : daysToDeadline <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
              {daysToDeadline < 0 ? `${Math.abs(daysToDeadline)} days overdue` : `${daysToDeadline} days left`}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              Team Size
            </div>
            <div className="text-sm font-medium">{project.teamSize} members</div>
            <div className="text-xs text-slate-500">
              {Math.round(project.hoursUsed / project.teamSize)}h avg
            </div>
          </div>
        </div>

        {/* Deliverables */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600">
            Deliverables: {project.completedDeliverables}/{project.deliverables}
          </div>
          <div className="text-xs text-slate-500">
            {Math.round((project.completedDeliverables / project.deliverables) * 100)}% complete
          </div>
        </div>

        {/* Blockers */}
        {project.blockers > 0 && (
          <div className="flex items-center gap-2 p-2 bg-red-50 rounded-md">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">
              {project.blockers} active blocker{project.blockers > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Project Lead */}
        <div className="flex items-center gap-2 pt-2 border-t">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs bg-slate-200">{initials}</AvatarFallback>
          </Avatar>
          <div className="text-sm text-slate-600">{project.lead}</div>
          <div className="ml-auto text-xs text-slate-500">Lead</div>
        </div>

        {/* Hours utilization */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {project.hoursUsed}h / {project.hoursAllocated}h
          </div>
          <div className={`font-medium ${project.hoursUsed > project.hoursAllocated ? 'text-red-600' : 'text-green-600'}`}>
            {Math.round((project.hoursUsed / project.hoursAllocated) * 100)}%
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
