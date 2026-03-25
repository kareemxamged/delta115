# Dependencies: `StudentCourses.tsx`

## External TypeScript/NPM Imports
- `react`: Implements standard Hooks (`useState`, `useEffect`).
- `react-router-dom`: Imports the `useNavigate` hook for state-injected redirections.
- `lucide-react`: Resolves explicit icon assets `{ Loader2, FileText, BarChart2, Library, BookOpen }`.

## Global Shared Entities
- `../../services/courseService`: Connects specifically against the API proxy and extracts the specific data interface `<EnrolledCourse>`.

## Inline Asset Dependencies
- `const Icons`: An internal Javascript dictionary storing unmapped, unmanaged raw SVGs. Creates duplicated technical debt as it bypasses the `lucide-react` import.
