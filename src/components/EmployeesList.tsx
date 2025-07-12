import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Mail, Phone } from "lucide-react";

const employeesData = [
  // Developers
  { id: 1, name: "Alex Thompson", role: "Developer", department: "Engineering", email: "alex.thompson@company.com", phone: "+1 (555) 123-4567", status: "Active", skills: ["React", "Node.js", "TypeScript"] },
  { id: 2, name: "Sarah Chen", role: "Developer", department: "Engineering", email: "sarah.chen@company.com", phone: "+1 (555) 234-5678", status: "Active", skills: ["Python", "Django", "PostgreSQL"] },
  { id: 3, name: "Mike Rodriguez", role: "Developer", department: "Engineering", email: "mike.rodriguez@company.com", phone: "+1 (555) 345-6789", status: "Active", skills: ["Java", "Spring Boot", "AWS"] },
  
  // Designers
  { id: 4, name: "Emma Wilson", role: "Designer", department: "Design", email: "emma.wilson@company.com", phone: "+1 (555) 456-7890", status: "Active", skills: ["Figma", "Adobe Creative Suite", "UI/UX"] },
  { id: 5, name: "David Kim", role: "Designer", department: "Design", email: "david.kim@company.com", phone: "+1 (555) 567-8901", status: "Active", skills: ["Sketch", "Prototyping", "User Research"] },
  
  // QA
  { id: 6, name: "Lisa Anderson", role: "QA", department: "Quality Assurance", email: "lisa.anderson@company.com", phone: "+1 (555) 678-9012", status: "Active", skills: ["Manual Testing", "Automation", "Selenium"] },
  { id: 7, name: "James Brown", role: "QA", department: "Quality Assurance", email: "james.brown@company.com", phone: "+1 (555) 789-0123", status: "Active", skills: ["API Testing", "Performance Testing", "Jest"] },
  
  // PM
  { id: 8, name: "Rachel Green", role: "PM", department: "Product", email: "rachel.green@company.com", phone: "+1 (555) 890-1234", status: "Active", skills: ["Agile", "Scrum", "Product Strategy"] },
  { id: 9, name: "Tom Wilson", role: "PM", department: "Product", email: "tom.wilson@company.com", phone: "+1 (555) 901-2345", status: "Active", skills: ["Roadmapping", "Stakeholder Management", "Analytics"] },
  
  // HR
  { id: 10, name: "Jennifer Davis", role: "HR", department: "Human Resources", email: "jennifer.davis@company.com", phone: "+1 (555) 012-3456", status: "Active", skills: ["Recruitment", "Employee Relations", "HRIS"] },
  
  // Ops
  { id: 11, name: "Kevin Martinez", role: "Ops", department: "Operations", email: "kevin.martinez@company.com", phone: "+1 (555) 123-4567", status: "Active", skills: ["Process Improvement", "Data Analysis", "Project Coordination"] },
  
  // Admin
  { id: 12, name: "Nancy Taylor", role: "Admin", department: "Administration", email: "nancy.taylor@company.com", phone: "+1 (555) 234-5678", status: "Active", skills: ["Office Management", "Compliance", "Documentation"] },
  
  // DevOps
  { id: 13, name: "Chris Johnson", role: "DevOps", department: "Engineering", email: "chris.johnson@company.com", phone: "+1 (555) 345-6789", status: "Active", skills: ["Docker", "Kubernetes", "CI/CD", "AWS"] },
  { id: 14, name: "Maria Garcia", role: "DevOps", department: "Engineering", email: "maria.garcia@company.com", phone: "+1 (555) 456-7890", status: "Active", skills: ["Terraform", "Monitoring", "Linux", "Azure"] },
  
  // L1 Support
  { id: 15, name: "Robert Lee", role: "L1 Support", department: "Support", email: "robert.lee@company.com", phone: "+1 (555) 567-8901", status: "Active", skills: ["Customer Service", "Troubleshooting", "Documentation"] },
  { id: 16, name: "Amanda Clark", role: "L1 Support", department: "Support", email: "amanda.clark@company.com", phone: "+1 (555) 678-9012", status: "Active", skills: ["Ticketing Systems", "Communication", "Problem Solving"] },
];

const roleCategories = ["All", "Developer", "Designer", "QA", "PM", "HR", "Ops", "Admin", "DevOps", "L1 Support"];

export const EmployeesList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  const filteredEmployees = employeesData.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || employee.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getEmployeeCountByRole = (role: string) => {
    return employeesData.filter(emp => emp.role === role).length;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {roleCategories.slice(1).map((role) => (
          <Card key={role} className="text-center">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{role}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{getEmployeeCountByRole(role)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedRole} onValueChange={setSelectedRole}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            {roleCategories.map((role) => (
              <SelectItem key={role} value={role}>{role}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Employees Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${employee.name}`} />
                  <AvatarFallback>{employee.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                  <Badge variant="secondary" className="text-xs">{employee.role}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-600">{employee.department}</div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Mail className="h-3 w-3" />
                <span className="truncate">{employee.email}</span>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-slate-600">
                <Phone className="h-3 w-3" />
                <span>{employee.phone}</span>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {employee.skills.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {employee.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{employee.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredEmployees.length === 0 && (
        <div className="text-center py-8">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">No employees found</h3>
          <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};