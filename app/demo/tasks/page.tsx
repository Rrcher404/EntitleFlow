'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, AlertCircle, FileText } from 'lucide-react';

type TaskStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue';
type TaskPriority = 'High' | 'Medium' | 'Low';
type FilterTab = 'all' | 'assigned' | 'overdue' | 'completed';

interface Task {
  id: string;
  title: string;
  projectName: string;
  assignedTo: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Respond to stormwater comment #3',
    projectName: 'Willow Creek Subdivision',
    assignedTo: 'Sarah Chen',
    dueDate: '2026-03-28',
    priority: 'High',
    status: 'Open',
  },
  {
    id: '2',
    title: 'Address environmental review feedback',
    projectName: 'Asheville Town Center',
    assignedTo: 'Marcus Johnson',
    dueDate: '2026-03-26',
    priority: 'High',
    status: 'Overdue',
  },
  {
    id: '3',
    title: 'Submit traffic impact analysis revision',
    projectName: 'Research Triangle Corporate Park',
    assignedTo: 'You',
    dueDate: '2026-03-25',
    priority: 'High',
    status: 'In Progress',
  },
  {
    id: '4',
    title: 'Clarify grading plan details',
    projectName: 'Chapel Hill Mixed Use Development',
    assignedTo: 'You',
    dueDate: '2026-03-30',
    priority: 'Medium',
    status: 'Open',
  },
  {
    id: '5',
    title: 'Respond to utilities coordination request',
    projectName: 'Greensboro Commerce District',
    assignedTo: 'Jennifer Williams',
    dueDate: '2026-03-22',
    priority: 'Medium',
    status: 'Completed',
  },
  {
    id: '6',
    title: 'Update architectural elevations',
    projectName: 'Raleigh Gateway Project',
    assignedTo: 'You',
    dueDate: '2026-04-05',
    priority: 'Low',
    status: 'Open',
  },
  {
    id: '7',
    title: 'Review and approve landscape plan',
    projectName: 'Durham Innovation District',
    assignedTo: 'David Martinez',
    dueDate: '2026-03-24',
    priority: 'Medium',
    status: 'Completed',
  },
  {
    id: '8',
    title: 'Submit wetland delineation report',
    projectName: 'Wilmington Waterfront Commons',
    assignedTo: 'You',
    dueDate: '2026-03-20',
    priority: 'High',
    status: 'Overdue',
  },
];

const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'High':
      return '#DC2626';
    case 'Medium':
      return '#EA580C';
    case 'Low':
      return '#16A34A';
    default:
      return '#666666';
  }
};

const getStatusIcon = (status: TaskStatus) => {
  switch (status) {
    case 'Completed':
      return <CheckCircle2 size={16} className="text-green-600" />;
    case 'Overdue':
      return <AlertCircle size={16} className="text-red-600" />;
    case 'In Progress':
      return <Clock size={16} className="text-amber-600" />;
    default:
      return <FileText size={16} className="text-gray-600" />;
  }
};

const getStatusBadgeStyle = (
  status: TaskStatus
): { backgroundColor: string; color: string } => {
  switch (status) {
    case 'Completed':
      return { backgroundColor: '#DCFCE7', color: '#166534' };
    case 'Overdue':
      return { backgroundColor: '#FEE2E2', color: '#991B1B' };
    case 'In Progress':
      return { backgroundColor: '#FEF3C7', color: '#92400E' };
    case 'Open':
      return { backgroundColor: '#EFF6FF', color: '#1E40AF' };
    default:
      return { backgroundColor: '#F3F4F6', color: '#374151' };
  }
};

const filterTasks = (tasks: Task[], filter: FilterTab): Task[] => {
  switch (filter) {
    case 'assigned':
      return tasks.filter((task) => task.assignedTo === 'You');
    case 'overdue':
      return tasks.filter((task) => task.status === 'Overdue');
    case 'completed':
      return tasks.filter((task) => task.status === 'Completed');
    case 'all':
    default:
      return tasks;
  }
};

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const filteredTasks = filterTasks(MOCK_TASKS, activeFilter);

  const filterTabs: Array<{ value: FilterTab; label: string }> = [
    { value: 'all', label: 'All' },
    { value: 'assigned', label: 'Assigned to Me' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-white p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-gray-900 mb-2">
            Tasks
          </h1>
          <p className="text-foreground">
            Track and manage your assigned comment responses.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`px-4 py-3 font-medium transition-all ${
                activeFilter === tab.value
                  ? 'text-[#0f3c35] border-b-2 border-[#0f3c35]'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className="p-6 hover:shadow-md transition-shadow cursor-pointer"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: '#E8E0D0',
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    {/* Left Section - Task Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-display text-lg font-semibold text-gray-900 truncate">
                          {task.title}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge
                          variant="secondary"
                          className="bg-white border border-gray-300 text-gray-700"
                        >
                          {task.projectName}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground mb-1">Assigned to</p>
                          <p className="font-medium text-foreground">
                            {task.assignedTo}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Due date</p>
                          <p className="font-medium text-foreground">
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Priority</p>
                          <Badge
                            style={{
                              backgroundColor: getPriorityColor(task.priority),
                            }}
                            className="text-white"
                          >
                            {task.priority}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Status</p>
                          <Badge
                            style={getStatusBadgeStyle(task.status)}
                            className="flex items-center gap-1.5 w-fit"
                          >
                            {getStatusIcon(task.status)}
                            <span>{task.status}</span>
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-12"
            >
              <FileText
                size={48}
                className="mx-auto text-gray-300 mb-4"
              />
              <p className="text-foreground">No tasks found in this filter.</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}