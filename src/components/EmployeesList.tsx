import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Mail, Phone, Loader2 } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";

export const EmployeesList = () => {
  const { employees, loading, error } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-64">
          <CardContent className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin text-brand-primary mr-2" />
            <span>Loading employees...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <Card className="w-64">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">Error: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get unique roles from employees data
  const roleCategories = ["All", ...new Set(employees.map(emp => emp.position))];

  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.profile?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === "All" || employee.position === selectedRole;
    return matchesSearch && matchesRole;
  });

  const getEmployeeCountByRole = (role: string) => {
    return employees.filter(emp => emp.position === role).length;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card className="text-center">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-slate-600">Total Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{employees.length}</div>
          </CardContent>
        </Card>
        {roleCategories.slice(1, 6).map((role) => (
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={employee.profile?.avatar_url} alt={employee.profile?.full_name} />
                  <AvatarFallback>
                    {employee.profile?.full_name?.split(' ').map(n => n[0]).join('') || employee.employee_id}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg">{employee.profile?.full_name || 'Unknown'}</CardTitle>
                  <p className="text-sm text-muted-foreground">{employee.position}</p>
                </div>
                <Badge variant={employee.status === "active" ? "default" : "secondary"}>
                  {employee.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.department}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{employee.profile?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">ID: {employee.employee_id}</span>
              </div>
              {employee.skills && employee.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-2">
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
              )}
              <div className="pt-2 border-t">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-muted-foreground">Utilization</span>
                  <span className="text-sm font-medium">{employee.utilization_rate}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${employee.utilization_rate}%` }}
                  />
                </div>
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