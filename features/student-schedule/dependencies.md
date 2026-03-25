# Dependencies: `StudentSchedule.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useState, useEffect }`. 
- `react-router-dom`: Specifically using `{ useNavigate }` for cross-portal transfers.

## Global Shared Utilities & Services
- `../../services/examService`: Central API proxy exposing both the async fetcher and the globally mapped `Exam` Interface schema.
- `../../components/LoadingSpinner`: Fullscreen takeover component (`<LoadingSpinner fullScreen text="Loading schedule..." />`).

## Extracted Inline Components
- Constant `Icons`: In-memory object graph storing non-exported functional SVGs (`ChevronLeft`, `ChevronRight`, `Calendar`, `List`, `Clock`). Maintains strict internal cohesion rather than utilizing an external Asset Library pipeline.
