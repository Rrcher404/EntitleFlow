'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Building2, Bell } from 'lucide-react';

const NOTIFICATION_PREFERENCES = [
  { type: 'Comments', inApp: true, email: true, digest: false },
  { type: 'Permit Status Changes', inApp: true, email: true, digest: true },
  { type: 'Document Uploads', inApp: true, email: false, digest: true },
  { type: 'Deadline Reminders', inApp: true, email: true, digest: false },
  { type: 'Team Invitations', inApp: true, email: true, digest: false },
  { type: 'Project Updates', inApp: false, email: true, digest: true },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">
            Settings
          </h1>
          <p className="mt-2 text-base text-gray-600">
            Manage your account and notification preferences.
          </p>
        </div>
      </div>

      {/* Settings Content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <User size={20} className="text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
            </div>
            <Card
              className="p-6"
              style={{
                backgroundColor: '#FDFBF7',
                borderColor: '#E8E0D0',
              }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value="Sarah Chen"
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value="sarah@brightwater-dev.com"
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    value="Project Manager"
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                  />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Notification Preferences Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Bell size={20} className="text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">
                Notification Preferences
              </h2>
            </div>
            <Card
              className="p-6 overflow-x-auto"
              style={{
                backgroundColor: '#FDFBF7',
                borderColor: '#E8E0D0',
              }}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">
                      Notification Type
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">
                      In-App
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">
                      Email
                    </th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-900">
                      Digest
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {NOTIFICATION_PREFERENCES.map((pref, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-200 hover:bg-white/50 transition-colors"
                    >
                      <td className="py-4 px-2 text-gray-900">{pref.type}</td>
                      <td className="py-4 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={pref.inApp}
                          disabled
                          className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={pref.email}
                          disabled
                          className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                        />
                      </td>
                      <td className="py-4 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={pref.digest}
                          disabled
                          className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-4 text-xs text-gray-500">
                Demo mode: Notification preferences are read-only
              </p>
            </Card>
          </motion.div>

          {/* Organization Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="mb-4 flex items-center gap-2">
              <Building2 size={20} className="text-gray-700" />
              <h2 className="text-xl font-semibold text-gray-900">Organization</h2>
            </div>
            <Card
              className="p-6"
              style={{
                backgroundColor: '#FDFBF7',
                borderColor: '#E8E0D0',
              }}
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value="Brightwater Development Group"
                    disabled
                    className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plan
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value="Starter"
                        disabled
                        className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                      />
                      <Badge
                        className="text-xs font-medium"
                        style={{
                          backgroundColor: '#0f3c35',
                          color: 'white',
                          border: 'none',
                        }}
                      >
                        Active
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Team Members
                    </label>
                    <input
                      type="text"
                      value="5 of 10"
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2 text-gray-900"
                    />
                  </div>
                </div>
                <div className="rounded-lg bg-white/50 p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Add Team Member
                    </button>
                    <button
                      disabled
                      className="w-full rounded-lg px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 cursor-not-allowed"
                    >
                      Upgrade Plan
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-gray-500">
                    Demo mode: Actions disabled
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}