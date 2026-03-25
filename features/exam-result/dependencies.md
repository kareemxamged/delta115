# Dependencies: `ExamResult.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useState, useEffect }`. Essential for standard functional lifecycle architecture.
- `react-router-dom`: Specifically using `{ useParams, useNavigate }`. Routes back to `/student/exams` strictly matching library catalogs.

## Internal Sub-module Dependencies (Components)
- `./components/ResultHeader`: Mounts score overviews.
- `./components/PerformanceBreakdown`: Renders granular categorical percentages.
- `./components/TutorFeedback`: Mounts free-text human analysis responses.
- `./components/ComparisonChart`: Injects global metric graphics compared to class averages.
- `./components/ResultFooter`: Provides closing actions and final verifications.

*(Note: These are bound firmly by the prop `data: ExamResultData`, which dictates extremely tight coupling).*

## Global Shared Utilities & Services
- `../../../services/examService`: The REST interface dependency.
- `../../../components/LoadingSpinner`: Fullscreen loading mechanism.
- `./types`: Specific data shape validation interface (`ExamResultData`).
