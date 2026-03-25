# Advanced Exam Timing & Safety Logic

This document specifies the architecture and logic for the "Smart Timer", auto-termination, and incremental saving features within the `ExamEngine.tsx` and `ManageExams.tsx` systems.

## 1. Exam Setup Structure
Exams now have a required `end_time` logic field. 
- **Start Time**: The window opens.
- **Duration**: The individual student's allotted time.
- **End Time (Global Expiry)**: The hard deadline when the exam portal forcefully closes, ignoring individual left-over duration. 

## 2. Smart Timer & Late-Entry Logic
The timer logic is embedded within `useExamEngine.ts`.
When a student initiates an attempt:
`remaining_time = Math.max(0, Math.min(endTime - now, durationMs))`

- If a student enters exactly on time: Their `remaining_time = durationMs`.
- If a student enters 15 minutes late but the exam has 30 minutes until global `end_time`: `remaining_time = durationMs`.
- If a student enters late and the global `end_time` is closer than `durationMs`: `remaining_time = end_time - now`.
- If they enter *after* `end_time`, they are forcefully denied entry from `examService.startExam`.

## 3. Incremental Saving (Zero-Loss Policy)
To combat connection drops, browser crashes, or accidental page reloads, the implementation utilizes real-time upserts via `examService.submitAnswer(submission.id, newAnswers)`.

**Execution Flow:**
1. Student clicks a radio option.
2. `useExamEngine` immediately mutates local RAM state, enabling instant UI feedback.
3. System asynchronously calls `supabase.from('submissions').update({ answers }).eq('id', submission.id)`.
4. `isSaved` indicator briefly toggles "Saving..." -> "Saved".
5. Because `auth` tokens persist, this network transaction silently syncs in the background.

## 4. Auto-Termination (Force Logout)
When `remaining_time <= 0`:
1. The `setInterval` interval is cleared.
2. Form fields disable (blocking race-condition edits).
3. System accesses the latest `answersRef.current`.
4. `examService.finishExam(submission.id, answers, exam.id)` executes, flipping the attempt `status` to `completed`.
5. Frontend explicitly redirects to `/student/exams/:id/result` with the notice: "Time Expired".

## Proposed Engineering Steps (Enriched Prompt)
1. Inject `end_time` into `examService.getExamForEdit` and `examService.createExam` schemas.
2. Modify `Step3Settings.tsx` to include an "End Time (Hard Deadline)" Date/Time picker alongside "Available From". 
3. Modify `ManageExams.tsx` row-renderer to display "Expired" if `new Date(exam.end_time) < Date.now()`.
4. Refactor `useExamEngine.ts`'s internal interval calculation line:
   `const hardDeadline = exam.end_time ? new Date(exam.end_time).getTime() : Infinity;`
   `const endTime = Math.min(startTime + durationMs, hardDeadline);`
5. Test AutoSubmit UI overlay and timeout redirect logic inside `ExamEngine.tsx`.
