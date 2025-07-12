import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NavigationTab {
  id: string;
  label: string;
  count?: number;
}

interface ProjectNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: NavigationTab[];
}

export const ProjectNavigation: React.FC<ProjectNavigationProps> = ({
  activeTab,
  onTabChange,
  tabs
}) => {
  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="flex space-x-1 p-4">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? "default" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "relative",
              activeTab === tab.id && "shadow-sm"
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 text-xs"
              >
                {tab.count}
              </Badge>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};