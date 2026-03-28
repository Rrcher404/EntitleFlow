# Component Patterns

Last updated: 2026-03-21

## App Page Pattern (Client Component)

All app pages under `app/app/` follow this pattern:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { /* types and enums */ } from '@/lib/types/index';
import type { Database } from '@/lib/database.types';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Organization = Database['public']['Tables']['organizations']['Row'];

export default function PageName() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [data, setData] = useState<DataType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const loadData = async () => {
      if (!supabase) { setLoading(false); return; }
      try {
        // 1. Get user
        const { data: { user } } = await supabase.auth.getUser();
        // 2. Get profile
        // 3. Get org data using profile.organization_id
        // 4. Fetch page-specific data scoped to org
      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [supabase]);

  if (loading) return <SkeletonLayout />;

  return (
    <div className="space-y-6">
      {/* Header with title + action button */}
      {/* Optional form (shown/hidden) */}
      {/* Data list or empty state */}
    </div>
  );
}
```

## Card Styling

Always use inline style for brand colors (not Tailwind classes for custom colors):

```tsx
<Card className="p-4" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
  {/* content */}
</Card>
```

## Button Styling

Primary buttons use inline style:
```tsx
<Button style={{ backgroundColor: '#1B3B2D' }}>Action</Button>
```

Secondary/outline buttons use variant:
```tsx
<Button variant="outline">Cancel</Button>
```

## Status Badge Pattern

```tsx
const statusKey = (item.status ?? 'draft') as StatusType;
const statusColor = STATUS_COLORS[statusKey];

<span className={cn(statusColor.bg, statusColor.text, 'px-2 py-0.5 rounded-full text-xs font-medium')}>
  {STATUS_LABELS[statusKey]}
</span>
```

## Form Pattern

```tsx
<form onSubmit={handleSubmit} className="space-y-4">
  <div>
    <label className="block text-sm font-medium text-foreground mb-1">Label</label>
    <input
      type="text"
      name="fieldName"
      value={formData.fieldName}
      onChange={handleInputChange}
      placeholder="..."
      className="w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm"
      required
    />
  </div>
</form>
```

## Date Formatting

```typescript
const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });
};
```

## Page Header Pattern

```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Title</h1>
    <p className="mt-1 text-sm text-muted-foreground">Description text.</p>
  </div>
  <Button onClick={action} className="gap-2" style={{ backgroundColor: '#1B3B2D' }}>
    <Plus className="w-4 h-4" />
    Action
  </Button>
</div>
```

## Empty State Pattern

```tsx
<Card className="p-12 text-center" style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}>
  <p className="text-muted-foreground mb-4">No items yet.</p>
  <Button onClick={action} className="gap-2" style={{ backgroundColor: '#1B3B2D' }}>
    <Plus className="w-4 h-4" />
    Create Your First Item
  </Button>
</Card>
```

## Loading Skeleton Pattern

```tsx
<div className="space-y-6">
  <div>
    <h1 className="text-2xl font-semibold tracking-tight text-foreground font-display">Title</h1>
    <p className="mt-1 text-sm text-muted-foreground">Description.</p>
  </div>
  <div className="space-y-3">
    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
  </div>
</div>
```

## Component Directory Structure

| Directory | Purpose |
|-----------|---------|
| `components/ui/` | Shared primitives (Button, Card, Input, Skeleton, etc.) |
| `components/app/` | App shell (sidebar, topbar) |
| `components/portal/` | Portal layout elements |
| `components/marketing/` | Marketing page sections |
| `components/forms/` | Lead capture forms |
| `components/maps/` | Google Maps components |

## App Layout

`app/app/layout.tsx` wraps all authenticated pages:
- SidebarProvider → flex container → AppSidebar + main content area
- Main content has `p-6` padding and `overflow-y-auto`
- FloatingActionMenu for quick actions
- OnboardingDialog for new users
