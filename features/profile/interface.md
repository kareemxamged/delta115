# Profile — Interface

## Component Tree
```text
StudentProfile.tsx
├── Header Card (Avatar + Contact info)
├── Navigation Tabs (info, security, academic, preferences)
└── <Suspense>
    ├── PersonalTab.tsx (Form Grid)
    ├── SecurityTab.tsx (Password Grid + Two-Factor Row)
    ├── AcademicTab.tsx (SVG Gauge + Stats Grid + Badges)
    └── PreferencesTab.tsx (Language + Theme + Notifications)
```

## UI Specs

### Form Fields (`PersonalTab`, `SecurityTab`)
- Read-only fields have a `<Lock>` icon on the right edge.
- Edit-mode selects have a rotated `<ChevronDown>` icon.
- Invalid fields add a `.ring-error` class (`#f87171` border + glow).

### GPA Gauge (`AcademicTab`)
- Exact copy of `CourseDetails` radial gauge logic.
- Radius 45 (`CIRCUM = 282.74`).
- **A/B grading**: Green (`#10b981`) for `> 75%`. Orange (`#f59e0b`) for `> 50%`. Red (`#ef4444`) for `< 50%`.

### Password Strength Bar
- Grey track (`rgba 0.07`), transitions width smoothly.
- **Colors map**:
  - Weak: Red (`#ef4444`)
  - Fair: Orange (`#f59e0b`)
  - Good/Strong: Blue/Green (`#3b82f6` / `#10b981` / `#6ee7b7`)

### Icons
- Strictly standardizing on `lucide-react` across all tabs.
- No raw SVG paths allowed in markup (except custom radial gauges).
