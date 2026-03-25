# Interface: `ExamDetails.tsx`

## Exported Functions
- **`export default function ExamDetails()`**: The default React Page Component export. Accepts no `props`.

## Internal Hooks & State Interfaces
Four localized states managed via `useState`:
- `[exam, setExam]`: Expects strictly `Exam | null`.
- `[loading, setLoading]`: `boolean` (Defaults to `true`).
- `[showStartModal, setShowStartModal]`: `boolean` (Defaults to `false`).
- `[timeLeft, setTimeLeft]`: `string` (Defaults to `'00:00:00'`).

## URL Parameters
- Extracted via `useParams<{ id: string }>()`. Requires an implicit string param mapping to `Number(id)` upon API execution.

## API Interactions
- **`examService.getExamById(Number(id))`**:
  - Imported from `../../services/examService`.
  - Triggered synchronously on initial mount within a localized `useEffect`.

## Routing Interactions
- **`useNavigate()` bindings**:
  - `navigate('/student/exams')` (Backwards Navigation / Error Fallback)
  - `navigate('/student/exams/${exam.id}/take')` (Start / Resume Forward Action)
  - `navigate('/student/exams/${exam.id}/result')` (Results Forward Action)
