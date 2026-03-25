# Dashboard — Data Aggregation Logic

## Parallel Queries on Mount

All data is fetched inside a single `useEffect` on `StudentDashboard`. Supabase calls are sequential but logically grouped:

1. **Enrollments** → resolves the set of `course_id`s for the current student.
2. **Exams** → fetches all exams belonging to enrolled courses, joined with `courses(name)`.
3. **Submissions** → fetches all submissions for the current student ordered by `submitted_at DESC`.

## Exam Status Classification

Each exam is categorized at render time (not stored):

| Status | Condition |
|---|---|
| `live` | `start_time <= now <= end_time` AND not submitted |
| `upcoming` | `start_time > now` OR no `start_time` AND not submitted |
| `missed` | `end_time < now` AND not submitted |
| `done` | Submission exists for this exam |

## GPA Computation

Term GPA is computed client-side:
```
avgPct = Σ (submission.score / exam.total_marks) / count
gpa = avgPct × 4.0  (capped at 4.0)
```

## Countdown Timer

A `useCountdown(targetIso)` custom hook ticks every second via `setInterval`. It computes `H / M / S` from `targetDate.getTime() - Date.now()`. The component re-renders on the 1-second interval only when the Next Event card is visible.

## Quick Stats

- **Active Exams**: `liveExams.length`
- **New Grades**: Count of completed submissions with `score IS NOT NULL`
- **Completion %**: `completedCount / allExamList.length × 100`
