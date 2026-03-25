# Dependencies: `ExamDetails.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useEffect, useState }`. Enforces standard functional component lifecycle controls and state management.
- `react-router-dom`: Specifically using `{ useParams, useNavigate }`. Traps the browser URL endpoint variables and executes cross-page redirects.

## Internal Imports (Project Modules)
- `./ExamDetails.module.css`: Strict scoped CSS bindings resolving as the explicit `styles` object.
- `../../services/examService`: The abstraction boundary for database operations (imports `examService` class instance and `Exam` TS Interface).
- `../../components/LoadingSpinner`: A project-specific UI component invoked recursively across the dashboard ecosystem (`<LoadingSpinner fullScreen />`).

## Implicit Data Dependencies
The component expects the `Exam` backend construct to provide deeply nested arrays:
- `topics`: Expected to be `string[] | undefined`
- `instructions`: Expected to be `string[] | undefined`
- `status`: String mapping that strictly maps to corresponding CSS rules inside the Module framework (`status_upcoming`, etc.).
