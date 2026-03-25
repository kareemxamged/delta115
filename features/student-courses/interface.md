# Interface: `StudentCourses.tsx`

## Exported Functions
- **`export default function StudentCourses()`**: Top-level functional component corresponding to `/student/courses`. Accepts no parameters.

## Internal State Hooks
- `[searchQuery, setSearchQuery]`: String tracking text intersections.
- `[filterSemester, setFilterSemester]`: String map. Danger: Hardcoded values vs `'all'`.
- `[filterDept, setFilterDept]`: String map. Danger: Hardcoded values vs `'all'`.
- `[activeTab, setActiveTab]`: Strong type literal union `<'current' | 'past' | 'all'>`.
- `[courses, setCourses]`: Typed cleanly to `EnrolledCourse[]`.
- `[loading, setLoading]`: Core Boolean state map.

## Interaction & State Mutations
- Re-evaluates `filteredCourses` entirely on each synchronous render frame based on 4-step variable combinations.

## Routing Execution
Instead of simple URI location switches, delegates state configurations out to the downstream consumer:
- `navigate('/student/courses/:id', { state: { activeTab: 'exams' } })`
- `navigate('/student/courses/:id', { state: { activeTab: 'grades' } })`
- `navigate('/student/courses/:id', { state: { activeTab: 'materials' } })`
