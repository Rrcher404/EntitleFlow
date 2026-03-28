'use client';

import { useState, useMemo } from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as Dialog from '@radix-ui/react-dialog';
import { Search, Plus, ChevronDown, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  id: string;
  name: string;
  jurisdiction: string;
  status: 'In Review' | 'Approved' | 'Resubmittal' | 'Submitted' | 'Draft' | 'Active';
  permitsCount: number;
  commentsCount: number;
  leadName: string;
  lastActivity: string;
  description?: string;
  address?: string;
  type?: string;
  permitList?: string[];
}

const mockProjectsData: Project[] = [
  {
    id: 'PRJ-2024-0045',
    name: 'Brightwater Mixed-Use',
    jurisdiction: 'Greensboro',
    status: 'In Review',
    permitsCount: 4,
    commentsCount: 12,
    leadName: 'Sarah Chen',
    lastActivity: '2 hours ago',
    description: 'Mixed-use development with retail and residential components.',
    address: '245 Main St, Greensboro, NC',
    type: 'Mixed Use',
    permitList: ['Site Plan Review', 'Building Permit', 'Stormwater Review'],
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
    description: 'Residential subdivision with 45 single-family lots.',
    address: '892 Oak Crest Rd, Raleigh, NC',
    type: 'Residential',
    permitList: ['Subdivision Review', 'Site Plan Review'],
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
    description: 'Historic building conversion to residential lofts.',
    address: '567 Church St, Durham, NC',
    type: 'Residential',
    permitList: ['Building Permit', 'Historic Preservation'],
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
    description: 'Senior living community with 120 independent living units.',
    address: '1200 Parkside Drive, Cary, NC',
    type: 'Institutional',
    permitList: ['Site Plan', 'Building Permit', 'Stormwater', 'Zoning Variance'],
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
    description: 'Townhome community with 32 units.',
    address: '789 Elm St, Greensboro, NC',
    type: 'Residential',
    permitList: ['Site Plan', 'Building Permit'],
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
    description: 'Conversion of industrial warehouse to office and maker space.',
    address: '456 Industrial Blvd, Raleigh, NC',
    type: 'Commercial',
    permitList: ['Site Plan Review'],
  },
  {
    id: 'PRJ-2024-0050',
    name: 'Riverfront Shopping Center',
    jurisdiction: 'Chapel Hill',
    status: 'Active',
    permitsCount: 4,
    commentsCount: 10,
    leadName: 'Jennifer Lee',
    lastActivity: '8 hours ago',
    description: 'New 65,000 sq ft shopping center with restaurant space.',
    address: '1500 Riverfront Pkwy, Chapel Hill, NC',
    type: 'Commercial',
    permitList: ['Site Plan', 'Building Permit', 'Stormwater'],
  },
  {
    id: 'PRJ-2024-0044',
    name: 'Tech Campus Expansion',
    jurisdiction: 'Raleigh',
    status: 'Active',
    permitsCount: 6,
    commentsCount: 16,
    leadName: 'Marcus Johnson',
    lastActivity: '3 hours ago',
    description: 'New innovation center with lab and office space.',
    address: '2400 Tech Boulevard, Raleigh, NC',
    type: 'Commercial',
    permitList: ['Site Plan', 'Building Permit', 'Stormwater', 'Parking Study'],
  },
  {
    id: 'PRJ-2024-0046',
    name: 'Greenfield Residential Community',
    jurisdiction: 'Durham',
    status: 'In Review',
    permitsCount: 5,
    commentsCount: 20,
    leadName: 'Elena Rodriguez',
    lastActivity: '1 hour ago',
    description: 'Sustainable community with 200 mixed-income units.',
    address: '3200 Greenfield Lane, Durham, NC',
    type: 'Residential',
    permitList: ['Site Plan', 'Building Permit', 'Stormwater', 'Traffic Study'],
  },
  {
    id: 'PRJ-2024-0049',
    name: 'Historic Preservation District',
    jurisdiction: 'Chapel Hill',
    status: 'Draft',
    permitsCount: 2,
    commentsCount: 2,
    leadName: 'Jennifer Lee',
    lastActivity: '5 days ago',
    description: 'Downtown revitalization with historic facade restoration.',
    address: '250 Main St, Chapel Hill, NC',
    type: 'Commercial',
    permitList: ['Historic Preservation', 'Site Plan'],
  },
];

type SortKey = 'name' | 'jurisdiction' | 'status' | 'permits' | 'comments' | 'lead' | 'activity';
type SortOrder = 'asc' | 'desc';

interface SortArrowProps {
  columnKey: SortKey;
  sortKey: SortKey | null;
  sortOrder: 'asc' | 'desc';
}

const SortArrow = ({ columnKey, sortKey, sortOrder }: SortArrowProps) => {
  if (sortKey !== columnKey) return null;
  return <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
};


export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjectsData);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    jurisdiction: '',
    type: '',
    address: '',
    description: '',
  });

  const allStatuses = Array.from(new Set(projects.map((p) => p.status)));

  const filteredProjects = useMemo(() => {
    const result = projects.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.jurisdiction.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter ? p.status === statusFilter : true;

      return matchesSearch && matchesStatus;
    });

    // Sorting
    result.sort((a, b) => {
      let aVal: string | number, bVal: string | number;

      switch (sortKey) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'jurisdiction':
          aVal = a.jurisdiction;
          bVal = b.jurisdiction;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'permits':
          aVal = a.permitsCount;
          bVal = b.permitsCount;
          break;
        case 'comments':
          aVal = a.commentsCount;
          bVal = b.commentsCount;
          break;
        case 'lead':
          aVal = a.leadName;
          bVal = b.leadName;
          break;
        case 'activity':
          aVal = a.lastActivity;
          bVal = b.lastActivity;
          break;
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortOrder === 'asc' ? Number(aVal) - Number(bVal) : Number(bVal) - Number(aVal);
    });

    return result;
  }, [projects, searchQuery, statusFilter, sortKey, sortOrder]);

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    const newProject: Project = {
      id: `PRJ-2024-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      name: formData.name,
      jurisdiction: formData.jurisdiction || 'Raleigh',
      status: 'Draft',
      permitsCount: 1,
      commentsCount: 0,
      leadName: 'You',
      lastActivity: 'just now',
      description: formData.description,
      address: formData.address,
      type: formData.type,
      permitList: [],
    };

    setProjects([newProject, ...projects]);
    setIsDialogOpen(false);
    setFormData({ name: '', jurisdiction: '', type: '', address: '', description: '' });
    setCurrentPage(1);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'In Review': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Resubmittal': 'bg-amber-100 text-amber-800',
      'Submitted': 'bg-purple-100 text-purple-800',
      'Draft': 'bg-gray-100 text-gray-800',
      'Active': 'bg-indigo-100 text-indigo-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };


  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-semibold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and track all your development projects
          </p>
        </div>
        <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <Dialog.Trigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              New Project
            </Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border rounded-lg shadow-lg z-50 p-6">
              <div className="flex items-center justify-between mb-4">
                <Dialog.Title className="text-lg font-semibold text-foreground">
                  Create New Project
                </Dialog.Title>
                <Dialog.Close asChild>
                  <button className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                  </button>
                </Dialog.Close>
              </div>

              <form onSubmit={handleAddProject} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Project Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="e.g., Riverside Development"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Jurisdiction</label>
                    <select
                      value={formData.jurisdiction}
                      onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select...</option>
                      {['Greensboro', 'Raleigh', 'Durham', 'Cary', 'Chapel Hill'].map((j) => (
                        <option key={j} value={j}>
                          {j}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    >
                      <option value="">Select...</option>
                      {['Residential', 'Commercial', 'Mixed Use', 'Industrial'].map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Street address"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Project description"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Dialog.Close asChild>
                    <button
                      type="button"
                      className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </Dialog.Close>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-accent text-primary hover:bg-accent/90 transition-colors text-sm font-medium"
                  >
                    Create
                  </button>
                </div>
              </form>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* Search and Filters */}
      <Card className="border-border">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2 px-0">
            <Search className="w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects, jurisdiction, lead..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Status Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setStatusFilter(null);
            setCurrentPage(1);
          }}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            statusFilter === null
              ? 'bg-accent text-primary'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {allStatuses.map((status) => (
          <button
            key={status}
            onClick={() => {
              setStatusFilter(status);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              statusFilter === status
                ? 'bg-accent text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Project Name <SortArrow columnKey="name" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('jurisdiction')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Jurisdiction <SortArrow columnKey="jurisdiction" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('status')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Status <SortArrow columnKey="status" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('permits')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Permits <SortArrow columnKey="permits" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('comments')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Comments <SortArrow columnKey="comments" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('lead')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Lead <SortArrow columnKey="lead" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
              <th
                onClick={() => handleSort('activity')}
                className="px-6 py-3 text-left font-semibold text-foreground cursor-pointer hover:bg-secondary/70"
              >
                Last Activity <SortArrow columnKey="activity" sortKey={sortKey} sortOrder={sortOrder} />
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedProjects.map((project) => (
              <motion.tr
                key={project.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="border-b border-border hover:bg-secondary/30 transition-colors"
              >
                <td
                  className="px-6 py-4 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                >
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {project.name}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          expandedId === project.id ? 'rotate-180' : ''
                        }`}
                      />
                    </p>
                    <p className="text-xs text-muted-foreground">{project.id}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-foreground">{project.jurisdiction}</td>
                <td className="px-6 py-4">
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                </td>
                <td className="px-6 py-4 text-foreground">{project.permitsCount}</td>
                <td className="px-6 py-4 text-foreground">{project.commentsCount}</td>
                <td className="px-6 py-4 text-foreground">{project.leadName}</td>
                <td className="px-6 py-4 text-muted-foreground">{project.lastActivity}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Expanded Detail Panel */}
      {expandedId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-border bg-secondary/20 p-4"
        >
          {paginatedProjects.find((p) => p.id === expandedId) && (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {paginatedProjects.find((p) => p.id === expandedId)?.description}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Address</h4>
                <p className="text-sm text-muted-foreground">
                  {paginatedProjects.find((p) => p.id === expandedId)?.address}
                </p>
              </div>
              {paginatedProjects.find((p) => p.id === expandedId)?.permitList && (
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Permits</h4>
                  <div className="flex gap-2 flex-wrap">
                    {paginatedProjects
                      .find((p) => p.id === expandedId)
                      ?.permitList?.map((permit) => (
                        <Badge key={permit} variant="outline" className="text-xs">
                          {permit}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredProjects.length)} of {filteredProjects.length}{' '}
            projects
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 rounded-lg border border-border text-foreground disabled:opacity-50 hover:bg-secondary disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-accent text-primary font-medium'
                    : 'border border-border text-foreground hover:bg-secondary'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 rounded-lg border border-border text-foreground disabled:opacity-50 hover:bg-secondary disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
