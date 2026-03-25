# Course Details — Logic

## Data Flow

```
useParams(:id) → Promise.all([getCourseDetails, getMaterials])
                 → setCourse, setMaterials
```

## Derived State

| Variable | Computation |
|---|---|
| `pastResults` | `exams.filter(submitted).map(→ {id, title, score, total, date})` |
| `earnedPts` | `pastResults.reduce(sum scores)` |
| `overallPct` | `Math.round(earnedPts / totalPts * 100)` |
| `groupedExams` | `reduce by month string` |
| `groupedMaterials` | `reduce by week number` |

## Exam Status Logic

```
submitted         → 'submitted'
now < start       → 'upcoming'
now ∈ [start,end] → 'active'
else              → 'completed'
```

## Viewed State (Materials)

Persisted to `localStorage` as `course_materials_viewed_{courseId}` (JSON array of IDs). Initialized from `localStorage` on mount. Toggled with `Set<number>` via `useCallback`.

## Tab Animation

Each tab panel carries `key={activeTab}` (via an incrementing `tabKey`), causing React to re-mount on switch. CSS `@keyframes cdFadeSlide` runs `opacity 0→1, translateY 10px→0` in 280ms.
