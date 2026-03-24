'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  FileText,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Bell,
} from 'lucide-react';

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'comments', label: 'Comments' },
  { id: 'permits', label: 'Permits' },
  { id: 'documents', label: 'Documents' },
];

const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    type: 'comment_assigned',
    title: 'New comment on Brightwater Mixed-Use permit',
    description: 'John Roberts commented: "Can we expedite the environmental review?"',
    timestamp: '2 hours ago',
    read: false,
    icon: MessageSquare,
  },
  {
    id: 2,
    type: 'permit_status_changed',
    title: 'Permit status updated: Phase 2 approved',
    description: 'Your Waterfront Development permit has moved to Phase 2 review.',
    timestamp: '5 hours ago',
    read: false,
    icon: CheckCircle,
  },
  {
    id: 3,
    type: 'document_uploaded',
    title: 'New document: Environmental Impact Assessment',
    description: 'Sarah Chen uploaded a new document to the Brightwater project.',
    timestamp: '1 day ago',
    read: true,
    icon: FileText,
  },
  {
    id: 4,
    type: 'deadline_approaching',
    title: 'Deadline approaching: Final submittal review',
    description: 'Permit submittal deadline in 7 days for Mixed-Use Development.',
    timestamp: '1 day ago',
    read: true,
    icon: AlertCircle,
  },
  {
    id: 5,
    type: 'team_invitation',
    title: 'You\'ve been invited to Coastal Redevelopment project',
    description: 'Join the team to collaborate on this new project.',
    timestamp: '2 days ago',
    read: true,
    icon: Users,
  },
  {
    id: 6,
    type: 'comment_assigned',
    title: 'New comment on Sustainability Guidelines revision',
    description: 'Michael Zhang commented: "I have feedback on Section 5"',
    timestamp: '2 days ago',
    read: true,
    icon: MessageSquare,
  },
  {
    id: 7,
    type: 'document_uploaded',
    title: 'Compliance checklist updated',
    description: 'The project compliance checklist has been updated with new requirements.',
    timestamp: '3 days ago',
    read: true,
    icon: FileCheck,
  },
  {
    id: 8,
    type: 'permit_status_changed',
    title: 'Permit rejected: Resubmission required',
    description: 'Your Parking Structure permit requires revisions. See details for more info.',
    timestamp: '3 days ago',
    read: true,
    icon: AlertCircle,
  },
  {
    id: 9,
    type: 'deadline_approaching',
    title: 'Reminder: Monthly compliance report due',
    description: 'Your monthly compliance report is due in 3 days.',
    timestamp: '4 days ago',
    read: true,
    icon: Clock,
  },
  {
    id: 10,
    type: 'comment_assigned',
    title: 'New comment on Zoning Appeal documentation',
    description: 'Lisa Wong replied to your earlier comment.',
    timestamp: '5 days ago',
    read: true,
    icon: MessageSquare,
  },
];

function getTypeColor(type: string): string {
  switch (type) {
    case 'comment_assigned':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'permit_status_changed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'document_uploaded':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'deadline_approaching':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    case 'team_invitation':
      return 'bg-pink-50 text-pink-700 border-pink-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredNotifications = MOCK_NOTIFICATIONS.filter((notif) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'unread') return !notif.read;
    return notif.type.includes(activeFilter.replace(/s$/, ''));
  });

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-display font-bold text-gray-900">
                Notifications
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Stay updated on project and permit activity.
              </p>
            </div>
            {unreadCount > 0 && (
              <Badge className="bg-blue-100 text-blue-800 border-0 text-sm">
                {unreadCount} unread
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto">
            {NOTIFICATION_TYPES.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`whitespace-nowrap border-b-2 px-4 py-4 text-sm font-medium transition-colors ${
                  activeFilter === tab.id
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-4">
          {filteredNotifications.map((notification, index) => {
            const IconComponent = notification.icon;
            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="p-4 transition-all hover:shadow-sm"
                  style={{
                    backgroundColor: '#FDFBF7',
                    borderColor: '#E8E0D0',
                  }}
                >
                  <div className="flex gap-4">
                    {/* Unread Indicator + Icon */}
                    <div className="flex flex-shrink-0 items-start gap-3 pt-1">
                      {!notification.read && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 mt-2"></div>
                      )}
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-lg ${getTypeColor(
                          notification.type
                        )}`}
                      >
                        <IconComponent size={20} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {notification.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="mt-2 flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {notification.timestamp}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getTypeColor(
                            notification.type
                          )}`}
                        >
                          {notification.type
                            .split('_')
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')}
                        </Badge>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex flex-shrink-0 items-center pt-1">
                      <button
                        className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                        style={{
                          backgroundColor: '#0f3c35',
                          color: 'white',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#1B3B2D';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#0f3c35';
                        }}
                      >
                        View
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {filteredNotifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bell size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600">No notifications in this category</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}