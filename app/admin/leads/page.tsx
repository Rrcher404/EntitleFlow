'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  intent: string;
  status: 'new' | 'contacted' | 'converted' | 'archived';
  notes: string;
  createdAt: string;
}

const statusColors: Record<Lead['status'], { bg: string; text: string }> = {
  new: { bg: '#E5E7EB', text: '#1F2937' },
  contacted: { bg: '#DBEAFE', text: '#1E40AF' },
  converted: { bg: '#DCFCE7', text: '#166534' },
  archived: { bg: '#E5E7EB', text: '#6B7280' },
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/leads');
        if (!res.ok) throw new Error('Failed to fetch leads');
        const data = await res.json();
        setLeads(data);
        const notes: Record<string, string> = {};
        data.forEach((lead: Lead) => {
          notes[lead.id] = lead.notes || '';
        });
        setEditingNotes(notes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching leads');
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const handleStatusChange = async (leadId: string, newStatus: Lead['status']) => {
    try {
      const res = await fetch(`/api/admin/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === leadId ? { ...lead, status: newStatus } : lead
        )
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleNotesChange = async (leadId: string) => {
    setSaving((prev) => ({ ...prev, [leadId]: true }));
    try {
      const res = await fetch(`/api/admin/leads`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, notes: editingNotes[leadId] }),
      });
      if (!res.ok) throw new Error('Failed to save notes');
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setSaving((prev) => ({ ...prev, [leadId]: false }));
    }
  };

  const filteredLeads =
    activeTab === 'all'
      ? leads
      : leads.filter((lead) => lead.status === activeTab);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Leads
          </h1>
          <p className="text-gray-600">Manage and track sales leads</p>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        <Card className="border" style={{ borderColor: '#E8E0D0' }}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-5" style={{ backgroundColor: '#F5F3F0' }}>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="new">New</TabsTrigger>
                <TabsTrigger value="contacted">Contacted</TabsTrigger>
                <TabsTrigger value="converted">Converted</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  No leads found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="p-4 rounded-lg border"
                      style={{ borderColor: '#E8E0D0', backgroundColor: '#FFFFFF' }}
                    >
                      <div className="grid grid-cols-5 gap-4 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Name</p>
                          <p className="font-semibold" style={{ color: '#1B3B2D' }}>
                            {lead.name}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Email</p>
                          <p className="text-sm text-gray-700">{lead.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Company</p>
                          <p className="text-sm text-gray-700">{lead.company}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Intent</p>
                          <p className="text-sm text-gray-700">{lead.intent}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Status</p>
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              handleStatusChange(
                                lead.id,
                                e.target.value as Lead['status']
                              )
                            }
                            className="mt-1 px-2 py-1 rounded text-sm border"
                            style={{
                              borderColor: '#E8E0D0',
                              color: '#1B3B2D',
                            }}
                          >
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="converted">Converted</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t" style={{ borderColor: '#E8E0D0' }}>
                        <p className="text-xs text-gray-500 uppercase mb-2">
                          Notes
                        </p>
                        <textarea
                          value={editingNotes[lead.id] || ''}
                          onChange={(e) =>
                            setEditingNotes((prev) => ({
                              ...prev,
                              [lead.id]: e.target.value,
                            }))
                          }
                          onBlur={() => handleNotesChange(lead.id)}
                          placeholder="Add notes..."
                          className="w-full p-2 rounded border text-sm"
                          style={{ borderColor: '#E8E0D0' }}
                          rows={2}
                        />
                        {saving[lead.id] && (
                          <p className="text-xs text-gray-500 mt-1">Saving...</p>
                        )}
                      </div>
                      <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                        <span>
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </span>
                        <Badge
                          style={{
                            backgroundColor: statusColors[lead.status].bg,
                            color: statusColors[lead.status].text,
                          }}
                        >
                          {lead.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
