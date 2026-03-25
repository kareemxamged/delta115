# Dependencies: `ExamsList.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useState, useMemo, useEffect }`. Used exclusively for DOM and logic binding.
- `react-router-dom`: Specifically using `{ useNavigate }`. Used for manipulating browser history and dynamic application routing.

## Internal Imports (Project Modules)
- `../../services/examService`: The core data layer interface. Imports both the `examService` execution object and the `Exam` typescript data shape interface.
- `./ExamsList.module.css`: Imported exclusively as `styles`. This enforces CSS Modules methodology, ensuring highly scoped class mappings to prevent cross-page CSS bleed.

## Implicit Data Dependencies (Data Models expected by UI)
The `Exam` interface (traced implicitly based on `ExamsList.tsx` execution) must include:
- `id`: (number or string router ID)
- `status`: `'all' | 'upcoming' | 'ongoing' | 'finished'`
- `title`: `string`
- `subject`: `string`
- `subject_color`: `string` (Optional hex code)
- `tutor_name`: `string`
- `start_time`: `string` (parsable Date object representation)
- `duration_minutes`: `number` or `string`
- `total_questions`: `number` or `string`
- `submission_status`: `'submitted' | 'started' | undefined`
- `score`: `number` (Optional)
