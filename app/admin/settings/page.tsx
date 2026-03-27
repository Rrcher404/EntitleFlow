'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X } from 'lucide-react';

interface ConfigItem {
  key: string;
  value: string;
  description?: string;
}

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<ConfigItem[]>([]);
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [savingKeys, setSavingKeys] = useState<Set<string>>(new Set());
  const [savingFlags, setSavingFlags] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [configRes, flagsRes] = await Promise.all([
          fetch('/api/admin/config'),
          fetch('/api/admin/flags'),
        ]);

        // Parse responses gracefully — treat non-OK as empty data
        let configData: ConfigItem[] = [];
        let flagsData: FeatureFlag[] = [];

        if (configRes.ok) {
          const raw = await configRes.json();
          configData = Array.isArray(raw) ? raw : raw?.data ? [raw.data] : [];
        }
        if (flagsRes.ok) {
          const raw = await flagsRes.json();
          flagsData = Array.isArray(raw) ? raw : raw?.data ? [raw.data] : [];
        }

        setConfig(configData);
        setFlags(flagsData);

        const values: Record<string, string> = {};
        configData.forEach((item: ConfigItem) => {
          values[item.key] = item.value;
        });
        setEditingValues(values);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching settings');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleConfigSave = async (key: string) => {
    setSavingKeys((prev) => new Set(prev).add(key));
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: editingValues[key] }),
      });
      if (!res.ok) throw new Error('Failed to save config');
    } catch (err) {
      console.error('Error saving config:', err);
    } finally {
      setSavingKeys((prev) => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  };

  const handleFlagToggle = async (flagId: string, enabled: boolean) => {
    setSavingFlags((prev) => new Set(prev).add(flagId));
    try {
      const res = await fetch('/api/admin/flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flagId, enabled }),
      });
      if (!res.ok) throw new Error('Failed to save flag');
      setFlags((prev) =>
        prev.map((flag) =>
          flag.id === flagId ? { ...flag, enabled } : flag
        )
      );
    } catch (err) {
      console.error('Error saving flag:', err);
    } finally {
      setSavingFlags((prev) => {
        const next = new Set(prev);
        next.delete(flagId);
        return next;
      });
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#FDFBF7' }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1B3B2D' }}>
            Settings
          </h1>
          <p className="text-gray-600">Platform configuration and feature flags</p>
        </div>

        {error && (
          <Card className="mb-6 border p-4" style={{ borderColor: '#E8E0D0', backgroundColor: '#FEE2E2' }}>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Platform Configuration
              </h2>
              <div className="space-y-4">
                {config.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-end gap-4 p-4 rounded-lg"
                    style={{ backgroundColor: '#F5F3F0' }}
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-2" style={{ color: '#1B3B2D' }}>
                        {item.key}
                      </label>
                      {item.description && (
                        <p className="text-xs text-gray-600 mb-2">{item.description}</p>
                      )}
                      <Input
                        value={editingValues[item.key] || ''}
                        onChange={(e) =>
                          setEditingValues((prev) => ({
                            ...prev,
                            [item.key]: e.target.value,
                          }))
                        }
                        style={{ borderColor: '#E8E0D0' }}
                      />
                    </div>
                    <Button
                      onClick={() => handleConfigSave(item.key)}
                      disabled={savingKeys.has(item.key)}
                      style={{
                        backgroundColor: '#1B3B2D',
                        color: '#FDFBF7',
                      }}
                      className="whitespace-nowrap"
                    >
                      {savingKeys.has(item.key) ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border p-6" style={{ borderColor: '#E8E0D0' }}>
              <h2 className="text-xl font-semibold mb-6" style={{ color: '#1B3B2D' }}>
                Feature Flags
              </h2>
              <div className="space-y-4">
                {flags.map((flag) => (
                  <div
                    key={flag.id}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{ backgroundColor: '#F5F3F0' }}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium" style={{ color: '#1B3B2D' }}>
                        {flag.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{flag.description}</p>
                    </div>
                    <button
                      onClick={() =>
                        handleFlagToggle(flag.id, !flag.enabled)
                      }
                      disabled={savingFlags.has(flag.id)}
                      className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
                        flag.enabled ? 'text-green-700' : 'text-red-700'
                      }`}
                      style={{
                        backgroundColor: flag.enabled ? '#DCFCE7' : '#FEE2E2',
                      }}
                    >
                      {flag.enabled ? (
                        <>
                          <Check size={16} />
                          Enabled
                        </>
                      ) : (
                        <>
                          <X size={16} />
                          Disabled
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
