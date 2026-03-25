# Course Details — Interface

## Layout
- **Max width**: 1200px, centered
- **Header**: Back button + course code badge + course name
- **Sticky bar**: Instructor / Dept / Credits / Semester — `position: sticky; top: 0; z-index: 20`
- **Tab bar**: Icon + label + count badge; active tab has primary bottom border
- **Tab panels**: Animated with `cdFadeSlide` (280ms ease) on switch

## Components

### `RadialProgress`
SVG ring, `stroke-dashoffset` driven, color = `gradeColor(value)`.  
Props: `value: number`, `size?: number`, `stroke?: number`.

### `StatusTag`
Props: `status: 'upcoming' | 'active' | 'submitted' | 'completed'`.  
Renders colored pill badge. Active status shows pulsing dot prefix.

### `MiniBar`
4px high horizontal progress bar.  
Props: `pct: number`. Color matches `gradeColor(pct)`.

## Color System
| Meaning | Color |
|---|---|
| ≥80% / good | `#10b981` (emerald) |
| 60–79% / average | `#f59e0b` (amber) |
| <60% / poor | `#ef4444` (red) |
| Upcoming | `#60a5fa` (blue) |
| Active | `#fbbf24` (yellow) |
| Submitted | `#34d399` (green) |

## Icon Library
All icons: `lucide-react` (no custom SVGs).
