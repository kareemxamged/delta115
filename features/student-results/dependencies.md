# Dependencies: `StudentResults.tsx`

## External Imports (NPM Modules)
- `react`: Specifically using `{ useEffect, useState }`. 
- `react-router-dom`: Specifically using `{ useNavigate }`. 

## Global Shared Utilities & Services
- `../../services/examService`: The REST interface dependency resolving the specific array payloads.
- `../../components/LoadingSpinner`: Prevents visual shifts until network stabilization is achieved `<LoadingSpinner fullScreen text="Loading results..." />`.

## Inline Structural Dependencies
Unlike previous modules audited, this module houses hardcoded dependencies *internally* rather than importing them, significantly increasing file bloat:
- **`Icons` Dictionary**: Hardcoded constant containing pure SVGs (`Search`, `Filter`, `Download`, `Trophy`, `TrendUp`, `Target`, `Clock`).
- **`StatCard` component**: Built directly into the file.
- **`SimpleLineChart` component**: Built directly into the file.
