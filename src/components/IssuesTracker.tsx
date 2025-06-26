
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, CheckCircle, Plus, Search } from "lucide-react";

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

interface Issue {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  assignee: string;
  dateCreated: string;
  dateResolved?: string;
  department: string;
}

interface IssuesTrackerProps {
  projects: Project[];
}

// Mock issues data
const mockIssues: Issue[] = [
  {
    id: 1,
    projectId: 2,
    projectName: "API Integration Platform",
    title: "Database connection timeout",
    description: "Intermittent connection timeouts causing API failures during peak hours",
    severity: "high",
    status: "open",
    assignee: "Michael Chen",
    dateCreated: "2024-06-25",
    department: "Engineering"
  },
  {
    id: 2,
    projectId: 2,
    projectName: "API Integration Platform", 
    title: "Third-party API rate limiting",
    description: "External service rate limits blocking batch operations",
    severity: "medium",
    status: "in-progress",
    assignee: "Sarah Johnson",
    dateCreated: "2024-06-24",
    department: "Engineering"
  },
  {
    id: 3,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Data pipeline failing",
    description: "ETL process failing due to schema changes in source system",
    severity: "critical",
    status: "open",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-23",
    department: "Data"
  },
  {
    id: 4,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Performance issues with large datasets",
    description: "Dashboard loading times exceed 30 seconds for enterprise customers",
    severity: "high",
    status: "open",
    assignee: "David Park",
    dateCreated: "2024-06-22",
    department: "Data"
  },
  {
    id: 5,
    projectId: 3,
    projectName: "Customer Analytics Dashboard",
    title: "Missing user permissions module",
    description: "Role-based access control not implemented for sensitive data",
    severity: "medium",
    status: "in-progress",
    assignee: "Emily Rodriguez",
    dateCreated: "2024-06-21",
    department: "Data"
  },
  {
    id: 6,
    projectId: 5,
    projectName: "Marketing Automation Tool",
    title: "Email template rendering issues",
    description: "Templates not displaying correctly in certain email clients",
    severity: "medium",
    status: "open",
    assignee: "Jessica Wu",
    dateCreated: "2024-06-20",
    department: "Marketing"
  }
];

const severityConfig = {
  low: { color: "bg-blue-500", label: "Low", textColor: "text-blue-700", bgColor: "bg-blue-50" },
  medium: { color: "bg-yellow-500", label: "Medium", textColor: "text-yellow-700", bgColor: "bg-yellow-50" },
  high: { color: "bg-orange-500", label: "High", textColor: "text-orange-700", bgColor: "bg-orange-50" },
  critical: { color: "bg-red-500", label: "Critical", textColor: "text-red-700", bgColor: "bg-red-50" }
};

const statusConfig = {
  open: { color: "bg-red-500", label: "Open", textColor: "text-red-700" },
  "in-progress": { color: "bg-amber-500", label: "In Progress", textColor: "text-amber-700" },
  resolved: { color: "bg-green-500", label: "Resolved", textColor: "text-green-700" }
};

export const IssuesTracker: React.FC<IssuesTrackerProps> = ({ projects }) => {
  const [issues, setIssues] = useState<Issue[]>(mockIssues);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIssues = issues.filter(issue => {
    const matchesStatus = filterStatus === "all" || issue.status === filterStatus;
    const matchesSeverity = filterSeverity === "all" || issue.severity === filterSeverity;
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         issue.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSeverity && matchesSearch;
  });

  // Issue statistics
  const issueStats = {
    total: issues.length,
    open: issues.filter(i => i.status === "open").length,
    inProgress: issues.filter(i => i.status === "in-progress").length,
    resolved: issues.filter(i => i.status === "resolved").length,
    critical: issues.filter(i => i.severity === "critical").length,
    high: issues.filter(i => i.severity === "high").length
  };

  // Department issue breakdown
  const departmentIssues = issues.reduce((acc, issue) => {
    if (!acc[issue.department]) {
      acc[issue.department] = { total: 0, open: 0, critical: 0 };
    }
    acc[issue.department].total += 1;
    if (issue.status === "open") acc[issue.department].open += 1;
    if (issue.severity === "critical") acc[issue.department].critical += 1;
    return acc;
  }, {} as Record<string, any>);

  return (
    <div className="space-y-6">
      {/* Issues Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Open Issues</CardTitle>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.open}</div>
            <p className="text-xs text-slate-600 mt-1">
              {issueStats.critical} critical, {issueStats.high} high priority
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">In Progress</CardTitle>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.inProgress}</div>
            <p className="text-xs text-slate-600 mt-1">Being actively worked on</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Resolved</CardTitle>
              <CheckCircle className="w-4 h-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.resolved}</div>
            <p className="text-xs text-slate-600 mt-1">
              {Math.round((issueStats.resolved / issueStats.total) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Issues</CardTitle>
              <Plus className="w-4 h-4 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{issueStats.total}</div>
            <p className="text-xs text-slate-600 mt-1">All time tracked issues</p>
          </CardContent>
        </Card>
      </div>

      {/* Department Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Issues by Department</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(departmentIssues).map(([dept, stats]) => (
              <div key={dept} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-900">{dept}</span>
                  <Badge variant="outline">{stats.total} issues</Badge>
                </div>
                <div className="text-sm text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Open:</span>
                    <span className="font-medium text-red-600">{stats.open}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical:</span>
                    <span className="font-medium text-red-600">{stats.critical}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Issues & Blockers</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder="Issue title" />
                  <Textarea placeholder="Issue description" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id.toString()}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Create Issue</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search issues..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Issues List */}
          <div className="space-y-4">
            {filteredIssues.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>No issues found matching the current filters</p>
              </div>
            ) : (
              filteredIssues.map((issue) => {
                const severityStyle = severityConfig[issue.severity];
                const statusStyle = statusConfig[issue.status];
                
                return (
                  <div key={issue.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium text-slate-900">{issue.title}</h4>
                          <Badge 
                            className={`text-xs ${severityStyle.textColor} ${severityStyle.bgColor}`}
                          >
                            {severityStyle.label}
                          </Badge>
                          <Badge 
                            variant="outline"
                            className={`text-xs ${statusStyle.textColor}`}
                          >
                            {statusStyle.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-2">{issue.description}</p>
                        <div className="text-xs text-slate-500">
                          Project: {issue.projectName} • Assignee: {issue.assignee} • Created: {new Date(issue.dateCreated).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
