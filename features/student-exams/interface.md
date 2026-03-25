# Interface: `ExamsList.tsx`

## Exported Functions
- **`export default function ExamsList()`**: The primary default export acting as the React Page Component. It accepts no `props`.

## Internal Hooks & State Interfaces
The component implements 6 individual `useState` hooks enforcing strict typing where necessary:
- `[exams, setExams]`: Type -> `Exam[]`
- `[loading, setLoading]`: Type -> `boolean`
- `[searchTerm, setSearchTerm]`: Type -> `string`
- `[statusFilter, setStatusFilter]`: Type -> `'all' | 'upcoming' | 'ongoing' | 'finished'`
- `[subjectFilter, setSubjectFilter]`: Type -> `string`
- `[activeTab, setActiveTab]`: Type -> `'all' | 'upcoming' | 'ongoing' | 'finished'`
- `[currentPage, setCurrentPage]`: Type -> `number`

## API Interactions
- **`examService.getExams()`**: 
  - An asynchronous function imported from `../../services/examService`. 
  - Expected to return an array matching the `Exam` interface.
  - Handled cleanly via `try/catch` resolving the main promise chain.

## Routing Interactions
Relies heavily on `react-router-dom`'s `useNavigate()` hook to act as an internal redirection module mapping to:
- `/student/exams/${exam.id}/result`
- `/student/exams/${exam.id}/take`
- `/student/exams/${exam.id}`
