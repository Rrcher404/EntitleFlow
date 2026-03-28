'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, Plus, X } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  body: string;
  type: 'info' | 'warning' | 'maintenance' | 'feature';
  active: boolean;
  startDate: string;
  endDate: string;
}

const typeColors: Record<Announcement['type'], { bg: string; text: string }> = {
  info: { bg: '#DBEAFE', text: '#1E40AF' },
  warning: { bg: '#FEF3C7', text: '#92400E' },
  maintenance: { bg: '#FEE2E2', text: '#991B1B' },
  feature: { bg: '#DCFCE7', text: '#166534' },
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    body: '',
    type: 'info' as Announcement['type'],
    startDate: '',
    endDate: '',
  });
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/announcements');
        if (!res.ok) throw new Error('Failed to fetch announcements');
        const data = await res.json();
        setAnnouncements(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching announcements');
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create announcement');
      const newAnnouncement = await res.json();
      setAnnouncements((prev) => [newAnnouncement, ...prev]);
      setFormData({
        title: '',
        body: '',
        type: 'info',
        startDate: '',
        endDate: '',
      });
      setShowForm(false);
    } catch (err) {
      console.error('Error creating announcement:', err);
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/admin/announcements`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: !active }),
      });
      if (!res.ok) throw new Error('Failed to update announcement');
      setAnnouncements((prev) =>
        prev.map((ann) =>
          ann.id === id ? { ...ann, active: !active } : ann
        )
      );
    } catch (err) {
      console.error('Error updating announcement:', err);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
              Announcements
            </h1>
            <p className="text-gray-600">Create and manage platform announcements</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            New Announcement
          </Button>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {showForm && (
          <Card className="mb-6 border p-6" style={{ borderColor: '#E8E0D0' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold" style={{ color: '#1B3B2D' }}>
                Create New Announcement
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                  Title
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Announcement title"
                  required
                  style={{ borderColor: '#E8E0D0' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                  Body
                </label>
                <textarea
                  value={formData.body}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, body: e.target.value }))
                  }
                  placeholder="Announcement body"
                  required
                  rows={4}
                  className="w-full p-2 rounded border"
                  style={{ borderColor: '#E8E0D0' }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as Announcement['type'],
                      }))
                    }
                    className="w-full p-2 rounded border"
                    style={{ borderColor: '#E8E0D0' }}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="feature">Feature</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    style={{ borderColor: '#E8E0D0' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    style={{ borderColor: '#E8E0D0' }}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  style={{ backgroundColor: '#1B3B2D', color: '#FDFBF7' }}
                >
                  Create Announcement
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: '#E8E0D0',
                    color: '#1B3B2D',
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : announcements.length === 0 ? (
          <Card className="border p-12 text-center" style={{ borderColor: '#E8E0D0' }}>
            <p className="text-gray-500">No announcements yet</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card
                key={announcement.id}
                className="border p-6 cursor-pointer"
                style={{ borderColor: '#E8E0D0' }}
                onClick={() => toggleExpanded(announcement.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <ChevronDown
                        size={16}
                        className={`transition-transform ${
                          expandedIds.has(announcement.id) ? 'rotate-180' : ''
                        }`}
                      />
                      <h3
                        className="text-lg font-semibold"
                        style={{ color: '#1B3B2D' }}
                      >
                        {announcement.title}
                      </h3>
                      <Badge
                        style={{
                          backgroundColor: typeColors[announcement.type].bg,
                          color: typeColors[announcement.type].text,
                        }}
                      >
                        {announcement.type}
                      </Badge>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleActive(announcement.id, announcement.active);
                    }}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      announcement.active ? 'text-green-700' : 'text-gray-600'
                    }`}
                    style={{
                      backgroundColor: announcement.active ? '#DCFCE7' : '#E5E7EB',
                    }}
                  >
                    {announcement.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                {expandedIds.has(announcement.id) && (
                  <div
                    className="mt-4 pt-4"
                    style={{ borderTop: '1px solid #E8E0D0' }}
                  >
                    <p className="text-gray-700 mb-4">{announcement.body}</p>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <p className="text-xs uppercase mb-1">Start Date</p>
                        <p>{new Date(announcement.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase mb-1">End Date</p>
                        <p>{new Date(announcement.endDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
