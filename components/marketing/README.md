# EntitleFlow NC Marketing Components (V2)

A suite of production-ready, accessible marketing components for the EntitleFlow NC Next.js application. All components use Tailwind CSS v4, React 19, framer-motion, and shadcn/ui patterns.

## Design System Integration

All components leverage the design tokens defined in `app/globals.css`:
- **Colors**: bg-background, bg-card, bg-primary, text-foreground, text-muted-foreground, border-border
- **Typography**: font-display (Manrope), font-sans (Instrument Sans)
- **Dark Mode**: Automatic via CSS variables and .dark class
- **Animations**: Keyframes (fade-in, slide-up, slide-down, scale-in, pulse-glow) with prefers-reduced-motion support
- **Shadows**: xs, sm, md, lg, xl elevation utilities

## Components

### 1. HeroSection
**File**: `hero-section.tsx`

The main landing page hero with animated gradient text, CTA buttons, and embedded dashboard preview.

**Props**:
```typescript
interface HeroSectionProps {
  eyebrow: string;
  title: string;
  description: string;
  stats: Array<{ value: string; label: string }>;
}
```

**Features**:
- Animated gradient text reveal on headline (last word)
- Subtle grid/dot background pattern
- Dual CTA buttons with hover glow effects
- Stats row with 3-column layout
- Responsive: stacks on mobile, side-by-side on lg+
- Scroll-triggered animations with useInView

**Usage**:
```tsx
<HeroSection
  eyebrow="Built for NC"
  title="Permitting workflows made simple"
  description="Track approvals, manage comments, and move permits faster."
  stats={[
    { value: "NC-first", label: "approach" },
    { value: "1 view", label: "of truth" },
    { value: "Founder-led", label: "onboarding" }
  ]}
/>
```

---

### 2. FeatureGrid (Bento-style)
**File**: `feature-grid.tsx`

2-column grid showcasing key product features with icons and highlights.

**Props**:
```typescript
interface FeatureGridProps {
  eyebrow: string;
  title: string;
  description: string;
  features: Array<{
    icon: React.ElementType;
    title: string;
    description: string;
    highlights: string[];
  }>;
}
```

**Features**:
- Bento grid layout (2 columns on md+, stacked on mobile)
- Icon badges with primary color background
- Hover elevation + subtle border glow
- Highlighted bullet points within each feature
- Scroll-triggered stagger animation

**Usage**:
```tsx
import { Zap, Users, Shield } from 'lucide-react';

<FeatureGrid
  eyebrow="Capabilities"
  title="Everything you need"
  description="Built for the complexity of real permit workflows."
  features={[
    {
      icon: Zap,
      title: "Response Tracking",
      description: "...",
      highlights: ["Track all comments", "Map to documents", "Auto-organize by department"]
    },
    // ...more features
  ]}
/>
```

---

### 3. HowItWorks (Timeline/Stepper)
**File**: `how-it-works.tsx`

Sequential workflow visualization with numbered steps and connecting lines.

**Props**:
```typescript
interface HowItWorksProps {
  eyebrow: string;
  title: string;
  description: string;
  stages: Array<{
    number: string;
    title: string;
    job: string;
    value: string;
  }>;
}
```

**Features**:
- Horizontal stepper on lg+, vertical on mobile
- Animated connecting lines with gradient fill
- Numbered step badges with primary color
- Each step shows: title, job label, and value
- Scroll-triggered sequential reveal

**Usage**:
```tsx
<HowItWorks
  eyebrow="The Flow"
  title="How it works"
  description="Simple workflow from upload to approval."
  stages={[
    {
      number: "1",
      title: "Upload plans",
      job: "Your team",
      value: "One central place"
    },
    // ...more stages
  ]}
/>
```

---

### 4. CTABanner
**File**: `cta-banner.tsx`

Full-width dark section for secondary CTAs with animated top border.

**Props**:
```typescript
interface CTABannerProps {
  eyebrow?: string;
  title: string;
  description: string;
  primaryHref?: string;
  primaryLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
}
```

**Features**:
- Dark slate-950 background with gradient decorations
- Animated top border beam effect
- White text on dark background
- Dual button layout (primary + secondary)
- Responsive padding and typography
- Entrance animation on scroll

**Usage**:
```tsx
<CTABanner
  eyebrow="Ready to get started?"
  title="Join early access"
  description="Be among the first NC teams to streamline permitting."
  primaryHref="/early-access"
  primaryLabel="Join now"
  secondaryHref="/walkthrough"
  secondaryLabel="See it in action"
/>
```

---

### 5. TrustBand (Social Proof)
**File**: `trust-band.tsx`

Horizontal grid of credibility signals with icons and descriptions.

**Props**:
```typescript
interface TrustBandProps {
  items?: TrustBandItem[];
}

interface TrustBandItem {
  icon: React.ComponentType<{ className?: string }>;
  value: string;
  description: string;
}
```

**Features**:
- Uses lucide-react icons (CheckCircle, Zap, Users, Shield by default)
- 4-column on lg, 2-col on sm, stack on mobile
- Icon badge with primary color background
- Scroll-triggered stagger animation
- Uses surface-panel styling from globals.css

**Usage**:
```tsx
import { CheckCircle, Users } from 'lucide-react';

<TrustBand
  items={[
    {
      icon: CheckCircle,
      value: "NC expertise",
      description: "Built on real Greensboro, Raleigh, Charlotte workflows"
    },
    // ...more items
  ]}
/>

// Or use default items from credibility signals
<TrustBand />
```

---

### 6. DashboardPreview
**File**: `dashboard-preview.tsx`

Interactive mockup of the approval operations dashboard with animated comments.

**Features**:
- Dark slate-950 header with jurisdiction name and status badge
- Animated comment items with reviewer initials and status
- Stats row (permits mapped, response matrix, status)
- Scroll-triggered card animation (slide-up + fade)
- Subtle parallax on hover (using isHovered state)
- StatusBadge integration for status display

**Usage**:
```tsx
<DashboardPreview />
```

---

### 7. StatusBadge
**File**: `status-badge.tsx`

Polymorphic badge component for status indicators with optional pulse animation.

**Props**:
```typescript
interface StatusBadgeProps {
  status: 'open' | 'in-progress' | 'ready-for-review' | 'resolved' | 'blocked';
  children: React.ReactNode;
  pulse?: boolean;
}
```

**Variants**:
- **open**: Blue (bg-blue-50, border-blue-200, text-blue-900)
- **in-progress**: Amber (bg-amber-50, border-amber-200, text-amber-900)
- **ready-for-review**: Purple (bg-purple-50, border-purple-200, text-purple-900)
- **resolved**: Emerald (bg-emerald-50, border-emerald-200, text-emerald-900)
- **blocked**: Red (bg-red-50, border-red-200, text-red-900)

**Features**:
- Color-coded status indicators with dot
- Optional pulse animation for active states
- Dark mode support for all variants
- Used within DashboardPreview and other dashboard UI

**Usage**:
```tsx
<StatusBadge status="in-progress" pulse>
  In Review
</StatusBadge>

<StatusBadge status="resolved">
  Approved
</StatusBadge>
```

---

## Animation Details

All components leverage framer-motion with proper motion preferences:

1. **Scroll-triggered animations**: Use `useInView` hook to trigger animations when element enters viewport
2. **Stagger effects**: `containerVariants` with `staggerChildren` for sequential reveals
3. **Hover effects**: `whileHover` variants for interactive feedback
4. **Accessibility**: Respect `prefers-reduced-motion` media query (set in globals.css)

## Dark Mode

All components automatically adapt to dark mode through:
- CSS custom properties defined in `app/globals.css`
- Tailwind dark: prefix utilities (e.g., `dark:bg-slate-900`)
- Automatic color variable switching via prefers-color-scheme

## Performance Considerations

- Uses motion.div instead of wrapping in motion() for better performance
- Implements `once: true` in useInView to avoid re-triggering animations
- Leverages Tailwind's static analysis with no dynamic class generation
- No external image dependencies (icons from lucide-react)

## Tailwind CSS v4 Compatibility

All components use:
- CSS variables for design tokens
- Compound selectors for utility classes
- Grid and flexbox layouts without requiring additional grid plugins
- Fluid typography utilities (text-fluid-h1, text-fluid-h2, etc.)

## Export Pattern

All components are named exports:
```tsx
export function ComponentName(props) { ... }
```

This allows flexible importing:
```tsx
import { HeroSection } from '@/components/marketing/hero-section';
```
