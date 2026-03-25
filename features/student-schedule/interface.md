# Interface: `StudentSchedule.tsx`

## Exported Functions
- **`export default function StudentSchedule()`**: Page module mapping uniquely to `/student/schedule`, executing with zero component parameters.

## Internal State Management
Restricted to standard hooks mapping UI toggles and temporal nodes:
- `[exams, setExams]`: Expected to reflect the global TypeScript Interface `Exam[]`.
- `[loading, setLoading]`: Core Boolean state block.
- `[view, setView]`: Strong runtime union constrained strictly to `'month' | 'week' | 'list'`.
- `[currentDate, setCurrentDate]`: Primary active buffer exclusively mapped to JavaScript `Date` instances.

## Render Abstraction Sub-Routines
- `renderDayCell(dayDate: Date, isOutsideMonth: boolean)`: Component injection factory returning populated JSX block nodes.
- `renderMonthView()` / `renderWeekView()` / `renderListView()`: Core layout template orchestrator functions.

## Internal Calculation Signatures
- `getDaysInMonth(year: number, month: number): number`
- `getFirstDayOfMonth(year: number, month: number): number`
- `navigatePeriod(direction: 'prev' | 'next'): void`
- `isSameDate(d1: Date, d2: Date): boolean`
- `getStatus(exam: Exam): 'upcoming' | 'completed' | 'missed' | 'today'`

## External Integrations
- `examService.getExams()`: Bypassing specialized routing in favor of full macro-payload initialization.
