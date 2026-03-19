'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Plus } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  jurisdiction: string;
  status: 'In Review' | 'Approved' | 'Resubmittal' | 'Submitted' | 'Draft';
  permitsCount: number;
  commentsCount: number;
  leadName: string;
  lastActivity: string;
}

const mockProjects: Project[] = [
  {
    id: 'PRJ-2024-0045',
    name: 'Brightwater Mixed-Use',
    jurisdiction: 'Greensboro',
    status: 'In Review',
    permitsCount: 4,
    commentsCount: 12,
    leadName: 'Sarah Chen',
    lastActivity: '2 hours ago',
  },
  {
    id: 'PRJ-2024-0038',
    name: 'Oak Hills Subdivision Ph. 3',
    jurisdiction: 'Raleigh',
    status: 'Approved',
    permitsCount: 3,
    commentsCount: 8,
    leadName: 'Marcus Johnson',
    lastActivity: '1 day ago',
  },
  {
    id: 'PRJ-2024-0041',
    name: 'Downtown Lofts Renovation',
    jurisdiction: 'Durham',
    status: 'Resubmittal',
    permitsCount: 2,
    commentsCount: 18,
    leadName: 'Elena Rodriguez',
    lastActivity: '4 hours ago',
  },
  {
    id: 'PRJ-2024-0032',
    name: 'Parkside Senior Living',
    jurisdiction: 'Cary',
    status: 'Submitted',
    permitsCount: 5,
    commentsCount: 5,
    leadName: 'James Williams',
    lastActivity: '3 days ago',
  },
  {
    id: 'PRJ-2024-0039',
    name: 'Elm Street Townhomes',
    jurisdiction: 'Greensboro',
    status: 'In Review',
    permitsCount: 3,
    commentsCount: 14,
    leadName: 'Sarah Chen',
    lastActivity: '6 hours ago',
  },
  {
    id: 'PRJ-2024-0033',
    name: 'Warehouse District Adaptive Reuse',
    jurisdiction: 'Raleigh',
    status: 'Draft',
    permitsCount: 1,
    commentsCount: 0,
    leadName: 'Marcus Johnson',
    lastActivity: '1 week ago',
  },
];

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    'In Review': 'bg-blue-100 text-blue-800',
    'Approved': 'bg-green-100 text-green-800',
    'Resubmittal': 'bg-amber-100 text-amber-800',
    'Submitted': 'bg-purple-100 text-purple-800',
    'Draft': 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function ProjectsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">
            Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your development projects
          </p>
        </div>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          New Project
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 px-0">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects..."
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
            />
          </div>
        </CardHeader>
      </Card>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Project Name
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Jurisdiction
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Status
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Permits
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Comments
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Lead
              </th>
              <th className="px-6 py-3 text-left font-semibold text-foreground">
                Last Activity
              </th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map((project) => (
              <tr
                key={project.id}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-medium text-foreground">
                      {project.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {project.id}
                    </p>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground">
                  {project.jurisdiction}
                </td>
                <td className="px-6 py-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                </td>
                <td className="px-6 py-4 text-foreground">
                  {project.permitsCount}
                </td>
                <td className="px-6 py-4 text-foreground">
                  {project.commentsCount}
                </td>
                <td className="px-6 py-4 text-foreground">
                  {project.leadName}
                </td>
                <td className="px-6 py-4 text-muted-foreground">
                  {project.lastActivity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
