'use client';

import { useEffect, useState } from 'react';
import { ChevronRight, Plus, Trash2 } from 'lucide-react';

interface GroupNode {
  id: string;
  name: string;
  userCount: number;
  children: GroupNode[];
  expanded?: boolean;
}

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
    ))}
  </div>
);

const GroupTree = ({
  node,
  level = 0,
  onToggle,
  expanded,
}: {
  node: GroupNode;
  level?: number;
  onToggle: (id: string) => void;
  expanded: Record<string, boolean>;
}) => {
  const isExpanded = expanded[node.id];

  return (
    <div>
      <div className="flex items-center gap-2 p-3 hover:bg-[#f6f5f0] rounded-lg transition-colors group" style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}>
        {node.children.length > 0 && (
          <button
            onClick={() => onToggle(node.id)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronRight
              className="w-4 h-4 text-gray-600 transition-transform"
              style={{ transform: isExpanded ? 'rotate(90deg)' : '' }}
            />
          </button>
        )}
        {node.children.length === 0 && <div className="w-6"></div>}

        <span className="text-sm font-medium text-[#1B3B2D] flex-1">{node.name}</span>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">{node.userCount} users</span>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all">
          <Trash2 className="w-4 h-4 text-red-600" />
        </button>
      </div>

      {isExpanded &&
        node.children.map((child) => (
          <GroupTree
            key={child.id}
            node={child}
            level={level + 1}
            onToggle={onToggle}
            expanded={expanded}
          />
        ))}
    </div>
  );
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<GroupNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch('/api/company-admin/groups');
        if (!response.ok) throw new Error('Failed to fetch groups');
        const data = await response.json();
        setGroups(data);
        // Expand all groups by default
        const expandAll: Record<string, boolean> = {};
        const traverse = (node: GroupNode) => {
          expandAll[node.id] = true;
          node.children?.forEach(traverse);
        };
        data.forEach(traverse);
        setExpanded(expandAll);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
        Error loading groups: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600">
        <span>Admin</span> / <span className="font-medium text-[#1B3B2D]">Groups</span>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#1B3B2D]" style={{ fontFamily: 'var(--font-display, sans-serif)' }}>
            Company Groups
          </h1>
          <p className="text-gray-600 mt-2">Organize users into hierarchical groups</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0f3c35] text-white px-4 py-2 rounded-lg hover:bg-[#0a2a24] transition-colors">
          <Plus className="w-4 h-4" />
          New Group
        </button>
      </div>

      {/* Groups Tree */}
      <div className="rounded-xl border border-[#e2e5e5] bg-white p-6 shadow-sm">
        {loading ? (
          <LoadingSkeleton />
        ) : groups.length === 0 ? (
          <div className="text-center py-12 text-gray-600">
            No groups found. Create one to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {groups.map((group) => (
              <GroupTree
                key={group.id}
                node={group}
                onToggle={toggleExpand}
                expanded={expanded}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          Drag and drop users to move them between groups, or click the menu icon to manage group members.
        </p>
      </div>
    </div>
  );
}
