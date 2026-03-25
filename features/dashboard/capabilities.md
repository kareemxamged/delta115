# Dashboard — Capabilities

## Live Features

| Feature | Status | Data Source |
|---|---|---|
| Next Event countdown (H:M:S) | ✅ Live | `exams.start_time` |
| Quick Stats row (3 cards) | ✅ Live | `submissions`, `enrollments` |
| Active Assignments panel | ✅ Live | `exams` + `submissions` |
| Status badges (Live/Upcoming/Missed/Done) | ✅ Live | Computed from `start_time / end_time` |
| "Start Now" / "View Result" CTAs | ✅ Live | Routes to `/student/exams/:id` or `/student/results/:id` |
| Performance mini chart | ✅ Live | `submissions.score` history |
| Term GPA gauge (sidebar) | ✅ Live | Computed from `submissions.score / exam.total_marks` |
| Quick Links sidebar | ✅ Static routes |

## Design System Compliance

- All icons: `lucide-react` only (no raw SVG)
- Active buttons: Purple gradient (`var(--primary)` → `var(--accent)`)
- Card style: Glassmorphism (`rgba(30,41,59,0.4)` + `backdrop-filter: blur`)
- Sidebar: Sticky `position: sticky; top: 1.5rem`
- Responsive: Single column below 1100px; stats collapse below 640px
