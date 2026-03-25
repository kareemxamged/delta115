# Exam Result — Interface

## Components

| Component | Responsibility |
|---|---|
| `ResultHeader` | SVG radial gauge, score label, stats grid |
| `PerformanceBreakdown` | Per-type bars derived from real answers |
| `TutorFeedback` | Auto-generated strengths/weaknesses |
| `ComparisonChart` | Horizontal "You vs Class Avg" bars |
| `ResultFooter` | 4 action buttons |

## Gauge Spec
- SVG 160×160, viewBox 0 0 100 100, radius 45, strokeWidth 9
- 3 rings: track (`rgba white 0.12`), glow overlay (`color 0.08`), progress arc
- `strokeDashoffset = CIRCUM * (1 - pct/100)`, transition 1.2s cubic-bezier
- Pass → `#10b981`, Fail → `#ef4444`

## Breakdown Bar States
- Objective (MCQ/T/F): colored bar @ real `score/totalScore %`
- Pending (Essay/Code): diagonal striped grey bar

## ComparisonChart Bars
- `minWidth: 28px` (always visible even at 0%)
- You bar: pass/fail color; Class bar: `#3b82f6`
- Percentile callout below

## Icon Library
All icons: `lucide-react`. No raw SVG paths in component files.

## Color Tokens
| Performance | Color |
|---|---|
| Excellent | `#10b981` |
| Very Good | `#34d399` |
| Good | `#f59e0b` |
| Needs Improvement | `#ef4444` |
| Pending Review | `#94a3b8` |
