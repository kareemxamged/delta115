# Course Details — Capabilities

## Tabs
| Tab | Capability |
|---|---|
| Overview | Course health radial ring, stat bars, recent results, materials preview, sticky upcoming sidebar |
| Exams | Month-grouped list, status tags (Upcoming / Active / Submitted / Completed), score mini-bar, correct CTA button per status |
| Grades | Summary dashboard card (earned/total pts, letter grade, gradient bar), per-exam score row with mini-bar + letter badge |
| Materials | Week-grouped list, typed icons, inline action link, Mark-as-Viewed toggle (localStorage-persisted), viewed progress counter |

## Computed Features
- `getExamStatus(exam)` — pure function, no side effects
- `gradeLetter(pct)` — A+ / A / B / C / D / F
- `gradeColor(pct)` — green / yellow / red threshold coloring
- Tab count badges auto-update from live data

## Data Sources
- `courseService.getCourseDetails(id)` — course meta + exams
- `courseService.getMaterials(id)` — course_materials table
- `localStorage` — viewed material IDs (client-only)
