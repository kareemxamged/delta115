# Interface: `StudentResults.tsx`

## Exported Functions
- **`export default function StudentResults()`**: The overarching page module representing `/student/results`. Requires no properties.

## Internal Sub-Components
- `function StatCard({ icon, title, value, subtext, color }: any)`
- `function SimpleLineChart({ data }: { data: any[] })`

## Internal Hook State Management
Strictly restricted to primitives and untyped arrays via `useState`:
- `[results, setResults]`: **Explicitly typed as `any[]`** (Danger: TypeScript blindspot).
- `[filteredResults, setFilteredResults]`: **Explicitly typed as `any[]`**.
- `[search, setSearch]`: String map updating on text-box mutation.
- `[subjectFilter, setSubjectFilter]`: String filter defaulting to `'All'`.
- `[dateFilter, setDateFilter]`: String filter (Currently dormant logic).

## API Interactions
- **`examService.getUserResults()`**: Resolves a JSON array expected to contain objects mapping strictly to { id, title, subject, date, percentage, status } based on inline dot-notation usage. 

## Routing Links
- Initiates `navigate()` strictly for historical drill-down mapping to:
  - `/student/exam/${result.examId}`
  - `/student/exam/${result.examId}/review`
