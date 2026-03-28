# EntitleFlow NC — V3 Platform Architecture

## Overview

V3 is a light-only, typography-refined, visually polished overhaul of the marketing site, plus the addition of an authenticated demo portal that shows what the platform looks like after signup.

## Design Philosophy

- **Light-only**: Remove all dark mode infrastructure. One canonical palette.
- **Warm professional**: The teal-on-warm-beige palette stays. Tighten contrast ratios.
- **Typography hierarchy**: Manrope for display, Instrument Sans for body. Increase body line-height, tighten heading letter-spacing.
- **Card & box refinements**: Softer shadows, consistent border-radius, better internal spacing.
- **Demo portal**: Authenticated route group `(portal)` showing a realistic dashboard, project list, permit detail, and analytics view.

## Color Tokens (Light Only)

```
--background:          #f6f5f0   (warm cream)
--foreground:          #102034   (deep navy-slate)
--card:                #ffffff   (pure white — cleaner than #fffefa)
--card-foreground:     #102034
--primary:             #0f3c35   (deep teal)
--primary-foreground:  #f8fafc
--secondary:           #edf3f2   (pale teal-gray)
--secondary-foreground:#153045
--muted:               #f0f2f4   (cool light gray)
--muted-foreground:    #5a6676
--accent:              #dff2ef   (light teal wash)
--accent-foreground:   #0f3c35
--destructive:         #dc2626
--destructive-foreground: #fafafa
--border:              #e2e5e5   (slightly warmer)
--input:               #ffffff
--ring:                #25a18e
```

## What Gets Removed

1. `@media (prefers-color-scheme: dark)` block in globals.css
2. `.dark { ... }` block in globals.css
3. `.dark .surface-panel` block
4. `.dark .eyebrow-pill` block
5. `next-themes` dependency and ThemeProvider
6. `theme-toggle.tsx` component
7. All `dark:` Tailwind classes across every component
8. `enableSystem` / `suppressHydrationWarning` / theme attribute

## Demo Portal Architecture

### Route Structure
```
app/
  (marketing)/     ← existing public site
  (portal)/        ← NEW authenticated demo area
    layout.tsx     ← sidebar + topbar shell
    dashboard/
      page.tsx     ← overview metrics, recent activity
    projects/
      page.tsx     ← project list with status filters
      [id]/
        page.tsx   ← project detail with permit timeline
    permits/
      page.tsx     ← permit queue with reviewer comments
    analytics/
      page.tsx     ← charts, jurisdiction coverage
    settings/
      page.tsx     ← account preferences
```

### Portal Components
```
components/portal/
  portal-sidebar.tsx    ← collapsible sidebar nav
  portal-topbar.tsx     ← search, notifications, user menu
  stat-card.tsx         ← metric display card
  activity-feed.tsx     ← recent activity timeline
  project-table.tsx     ← sortable project list
  permit-card.tsx       ← permit detail with status
  comment-thread.tsx    ← reviewer comment display
  analytics-chart.tsx   ← chart wrapper
```

### Mock Data
All portal data is static/mock for the demo. No real auth required — just a route gate with a simple "Enter Demo" button from the marketing site.
