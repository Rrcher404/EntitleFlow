# Marketing Components V2 Integration Guide

## Quick Start

All 7 marketing components have been created in `/components/marketing/` and are ready for integration into your Next.js pages.

### Component Files Created

1. **hero-section.tsx** - Main hero with animated gradient text, dashboard preview, and dual CTAs
2. **feature-grid.tsx** - Bento-style feature cards with icons and highlights
3. **how-it-works.tsx** - Horizontal/vertical stepper timeline with connecting lines
4. **cta-banner.tsx** - Dark full-width CTA section with animated border
5. **trust-band.tsx** - Social proof credibility signals grid (4 items)
6. **dashboard-preview.tsx** - Interactive dashboard mockup with animated comments
7. **status-badge.tsx** - Polymorphic status indicator with 5 variants

## Usage Examples

### Example 1: Basic Home Page Integration

```tsx
// app/page.tsx
'use client';

import { HeroSection } from '@/components/marketing/hero-section';
import { FeatureGrid } from '@/components/marketing/feature-grid';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { TrustBand } from '@/components/marketing/trust-band';
import { CTABanner } from '@/components/marketing/cta-banner';
import { MapPin, BarChart3, Users, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <main>
      <HeroSection
        eyebrow="Built for North Carolina"
        title="Permitting workflows that keep up"
        description="Streamline approvals, track reviewer comments, and manage complex permit projects without the enterprise overhead."
        stats={[
          { value: "NC-first", label: "approach" },
          { value: "1 view", label: "of truth" },
          { value: "Founder-led", label: "onboarding" }
        ]}
      />

      <FeatureGrid
        eyebrow="What you get"
        title="Built for the complexity"
        description="Designed specifically for the post-submission workflow where the real work happens."
        features={[
          {
            icon: BarChart3,
            title: "Response Tracking",
            description: "See all reviewer comments in one place, mapped to your documents.",
            highlights: [
              "Automatic comment organization by discipline",
              "Status tracking for each reviewer",
              "Timeline view of feedback"
            ]
          },
          {
            icon: MapPin,
            title: "Jurisdiction-Specific",
            description: "Pre-configured for Greensboro, Raleigh, Charlotte, and DEQ workflows.",
            highlights: [
              "Pre-built discipline groups",
              "Standard approval sequences",
              "Known reviewer patterns"
            ]
          },
          {
            icon: Users,
            title: "Team Collaboration",
            description: "Share projects with your team and track who's responsible for each comment.",
            highlights: [
              "Role-based access",
              "Assignment tracking",
              "Team notifications"
            ]
          },
          {
            icon: Zap,
            title: "Fast Onboarding",
            description: "Get set up in minutes with founder-led walkthroughs.",
            highlights: [
              "Guided project setup",
              "Workflow audit assistance",
              "Best practices sharing"
            ]
          }
        ]}
      />

      <HowItWorks
        eyebrow="The process"
        title="Simple workflow"
        description="From upload to approval tracking in a few steps."
        stages={[
          {
            number: "01",
            title: "Upload plans",
            job: "Your team",
            value: "Centralized document hub"
          },
          {
            number: "02",
            title: "Distribute for review",
            job: "System",
            value: "Auto-assign to reviewers"
          },
          {
            number: "03",
            title: "Track comments",
            job: "Your team",
            value: "See all feedback in one place"
          },
          {
            number: "04",
            title: "Submit revisions",
            job: "Your team",
            value: "Quick resubmit workflow"
          }
        ]}
      />

      <TrustBand />

      <CTABanner
        eyebrow="Ready to accelerate?"
        title="Join early access"
        description="Be among the first NC teams to transform your permitting workflow."
        primaryHref="/early-access"
        primaryLabel="Join the program"
        secondaryHref="/walkthrough"
        secondaryLabel="See it in action"
      />
    </main>
  );
}
```

### Example 2: Custom Props

```tsx
import { HeroSection } from '@/components/marketing/hero-section';

<HeroSection
  eyebrow="Product"
  title="Approval operations made visible"
  description="The single source of truth for all your permit review comments and approvals."
  stats={[
    { value: "100%", label: "comment visibility" },
    { value: "3-5 min", label: "time to centralize" },
    { value: "Every detail", label: "tracked" }
  ]}
/>
```

### Example 3: Status Badge in Custom UI

```tsx
import { StatusBadge } from '@/components/marketing/status-badge';

export function ReviewItem() {
  return (
    <div>
      <StatusBadge status="in-progress" pulse>
        In Review
      </StatusBadge>
      <StatusBadge status="ready-for-review">
        Ready for review
      </StatusBadge>
      <StatusBadge status="resolved">
        Resolved
      </StatusBadge>
      <StatusBadge status="blocked">
        Blocked on client input
      </StatusBadge>
    </div>
  );
}
```

## Design System Alignment

All components automatically use these tokens from `app/globals.css`:

### Colors
- `bg-background` - Page background
- `bg-card` - Card surfaces
- `bg-primary` - Primary action color (teal #0f3c35 → #25a18e dark)
- `text-foreground` - Primary text
- `text-muted-foreground` - Secondary text
- `border-border` - Border color

### Typography
- `font-display` - Manrope (headlines)
- `font-sans` - Instrument Sans (body)

### Animations
Built-in support for:
- Fade-in
- Slide-up / Slide-down
- Scale-in
- Pulse-glow

All animations respect `prefers-reduced-motion` automatically.

## Responsive Behavior

All components are fully responsive:

| Component | Mobile | Tablet | Desktop |
|-----------|--------|--------|---------|
| HeroSection | Stacked | Stacked | Side-by-side |
| FeatureGrid | 1 column | 2 columns | 2 columns |
| HowItWorks | Vertical | Vertical | Horizontal |
| TrustBand | Stacked | 2 columns | 4 columns |
| CTABanner | Full width | Full width | Full width |
| DashboardPreview | Responsive | Responsive | Responsive |

## Dark Mode

All components automatically support dark mode:
- Light mode: Warm tones with teal primary
- Dark mode: Slate-950 with teal primary
- Automatic switching based on system preference

## Customization

### Theme Colors

To use different colors, modify `app/globals.css` color tokens. All components will automatically update.

### Icons

Replace lucide-react icons in FeatureGrid and TrustBand with custom icons:

```tsx
import { MyCustomIcon } from '@/components/icons';

<FeatureGrid
  features={[
    {
      icon: MyCustomIcon,
      title: "Feature",
      description: "...",
      highlights: [...]
    }
  ]}
/>
```

### Content

All props accept strings and components. Some accept arrays for multiple items (stats, features, stages).

## Performance Notes

- All components use `'use client'` directive (required for framer-motion)
- Scroll animations only trigger once (`once: true` in useInView)
- No external image dependencies (all use Tailwind utilities + lucide icons)
- CSS Grid and Flexbox for layouts (no additional dependencies)
- Responsive classes for mobile-first design

## Animation Details

### Scroll-Triggered Animations
- Hero, FeatureGrid, HowItWorks, and TrustBand use scroll-triggered animations
- Animations trigger when element is 100px into viewport
- Use `margin: '-100px'` in useInView hook

### Staggered Reveals
- Parent container uses `staggerChildren` for sequential child animations
- Each child animates with slight delay for cascade effect

### Hover Effects
- Cards elevate and get subtle border glow on hover
- Buttons have gradient overlay animation on hover

## Integration Checklist

- [ ] Components directory exists at `/components/marketing/`
- [ ] All 7 .tsx files created
- [ ] Import statements reference correct UI components
- [ ] framer-motion installed (`npm list framer-motion`)
- [ ] lucide-react installed (`npm list lucide-react`)
- [ ] globals.css has animation keyframes and design tokens
- [ ] Dark mode testing (toggle prefers-color-scheme)
- [ ] Mobile responsiveness testing
- [ ] Motion preferences testing (reduce motion in accessibility settings)

## Troubleshooting

### Animations not working
- Ensure framer-motion is installed: `npm install framer-motion`
- Check that `'use client'` directive is at top of file
- Verify prefers-reduced-motion is set in globals.css

### Dark mode not applying
- Ensure globals.css is imported in layout
- Check that html element or body has `.dark` class for dark mode
- Verify CSS variables are set in :root and .dark

### Icons not showing
- Ensure lucide-react is installed: `npm install lucide-react`
- Icons are passed as React components, not strings
- Check icon names are correct (case-sensitive)

## File Sizes

- hero-section.tsx: 6.0 KB
- feature-grid.tsx: 4.0 KB
- how-it-works.tsx: 6.0 KB
- cta-banner.tsx: 4.2 KB
- trust-band.tsx: 2.5 KB
- dashboard-preview.tsx: 6.9 KB
- status-badge.tsx: 1.8 KB
- **Total**: ~31 KB (minified: ~8 KB)

## Next Steps

1. Import components into your pages
2. Provide required props (eyebrow, title, description, etc.)
3. Test responsive behavior on mobile/tablet/desktop
4. Customize content and icons as needed
5. Deploy and monitor performance

For detailed component documentation, see `/components/marketing/README.md`
