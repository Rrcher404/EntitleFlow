# Design Tokens & Styling

Last updated: 2026-03-21

## CRITICAL: Light Mode Only

No `dark:` Tailwind classes. No `useTheme()`. No ThemeProvider. Ever.

## Brand Colors (inline styles, not Tailwind)

| Token | Hex | Usage |
|-------|-----|-------|
| Primary (Forest Green) | `#1B3B2D` | Primary buttons, primary text |
| Accent (Gold) | `#D4A937` | Highlight numbers, accents |
| Card Background | `#FDFBF7` | Card surfaces |
| Card Border | `#E8E0D0` | Card + form borders |
| Page Background | `#f6f5f0` | `--background` CSS var |

## CSS Variables (V3 Design System)

```css
--background:          #f6f5f0   /* warm cream page background */
--foreground:          #102034   /* deep navy-slate text */
--card:                #ffffff   /* pure white card surface */
--primary:             #0f3c35   /* deep forest teal */
--primary-foreground:  #f8fafc
--secondary:           #edf3f2   /* pale teal-gray */
--muted:               #f0f2f4   /* cool light gray */
--muted-foreground:    #5a6676
--accent:              #dff2ef   /* light teal wash */
--border:              #e2e5e5
--ring:                #25a18e   /* focus ring, interactive teal */
```

## How Colors Are Applied

Cards and buttons use INLINE STYLES for brand colors (not Tailwind custom colors):

```tsx
// Cards
style={{ backgroundColor: '#FDFBF7', borderColor: '#E8E0D0' }}

// Primary buttons
style={{ backgroundColor: '#1B3B2D' }}

// Gold accent numbers
style={{ color: '#D4A937' }}
```

Standard Tailwind classes are used for design system colors:
```tsx
className="text-foreground"        // main text
className="text-muted-foreground"  // secondary text
className="bg-background"          // page background
className="border-border"          // standard borders
```

## Typography

| Usage | Font | Classes |
|-------|------|---------|
| Display/Headings | Manrope | `font-display font-semibold tracking-tight` |
| Body | Instrument Sans | `font-sans` (default) |
| Page title | Manrope | `text-2xl font-semibold tracking-tight text-foreground font-display` |
| Subtitle | Instrument Sans | `text-sm text-muted-foreground` |
| Card title | Manrope | `text-lg font-semibold text-foreground` |
| Label | Instrument Sans | `text-sm font-medium text-foreground` |
| Eyebrow | Instrument Sans | `text-xs font-semibold tracking-widest uppercase text-primary` |

## Component Classes

| Component | Classes |
|-----------|---------|
| Card | `rounded-xl border border-border bg-card shadow-sm` |
| Primary Button | `gap-2` + inline `backgroundColor: '#1B3B2D'` |
| Form input | `w-full px-3 py-2 border border-border rounded-lg bg-white text-foreground placeholder-muted-foreground text-sm` |
| Status badge | `px-2 py-0.5 rounded-full text-xs font-medium` + color from STATUS_COLORS map |
| Error alert | `p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700` |

## Spacing

| Context | Value |
|---------|-------|
| Section padding | `py-16 md:py-24` (marketing) |
| Container | `max-w-6xl mx-auto px-4 md:px-8` (marketing) |
| App main content | `p-6` (set in layout) |
| Card padding | `p-4` (list items), `p-6` (forms) |
| Vertical rhythm | `space-y-6` (sections), `space-y-3` (list items), `space-y-4` (form fields) |

## Status Color Maps

Located in `lib/types/enums.ts`. Each map is `Record<EnumType, { bg: string; text: string }>`:

- `PROJECT_STATUS_COLORS` — draft(slate), active(blue), on_hold(yellow), completed(green), archived(gray)
- `PERMIT_STATUS_COLORS` — draft(gray), submitted(purple), under_review(blue), revision_requested(amber), approved(green), denied(red)
- `PRIORITY_COLORS` — low(green), normal(blue), high(orange), urgent(red)
- `DEADLINE_STATUS_COLORS` — upcoming(blue), due_soon(amber), overdue(red), completed(green)
- `ORG_ROLE_COLORS` — owner(purple), admin(blue), member(green), viewer(gray)

## Icons

Using `lucide-react`. Common icons:
- Plus, X, FileText, FolderPlus, Search, Settings, LogOut
- ChevronDown, ChevronRight, Check, AlertCircle
- Calendar, Clock, MapPin, User, Users, Bell
