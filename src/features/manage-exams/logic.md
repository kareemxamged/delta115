# Exam Lifecycle & Control Center Logic

This document details the architectural decisions and features tied to the **Manage Exams** control center. It explains how visibility, status, and randomization are computed and enforced globally across the Exam Management System.

## Exam Status & Visibility Engine

Exams can dynamically shift through 5 different derived states depending on configuration parameters (`start_time`, `is_published`, `status`).

1. **Disabled**:
   - Condition: `is_published = false`
   - Outcome: The exam is hidden from the student dashboard and strictly blocked from access, regardless of its start_time or deadline.
   
2. **Always Available (Evergreen)**:
   - Condition: `is_published = true` AND `start_time = null`
   - Outcome: The exam immediately shows up on targeted students' dashboards. The "Starts In" countdown is hidden, replaced with "Availability: Always Available". Students can take the exam at any time.
   
3. **Upcoming**:
   - Condition: `is_published = true` AND `start_time > now` AND `status != 'finished'`
   - Outcome: Exam is visible to students but the start button is disabled. A reactive countdown timer shows the duration until it unlocks.
   
4. **Active**:
   - Condition: `is_published = true` AND `start_time <= now` AND `status != 'finished'`
   - Outcome: Exam is fully active. Students can start or resume their submissions. It ranks highest on the dashboard sorting hierarchy.

5. **Expired**:
   - Condition: `status = 'finished'`
   - Outcome: The exam has been manually or systemically ended. It moves to the bottom of the dashboard ("Recent"). If students haven't submitted, they are marked as missed.

## Randomization Algorithm (`shuffle_questions`)

The control center features a toggle for **"Shuffle Qs"**. This maps directly to the `is_randomized` boolean column on the `exams` table.

### Implementation Flow:
1. **Teacher Action**: Teacher toggles "Shuffle Qs" on the Manage Exams dashboard.
2. **Database State**: `is_randomized` flips to `true`.
3. **Student Engine Load**: When a student enters `/exams/:id/take`, the `ExamEngine.tsx` component fetches the questions.
4. **Shuffling Execution**:
   - The engine checks `examData.is_randomized`.
   - If true, it uses the **Fisher-Yates Shuffle Algorithm** on the client side exclusively for *display order*.
   - Algorithm guarantees cryptographic-level randomness while ensuring the underlying ID mappings remain consistent for grading accuracy.

```typescript
// Fisher-Yates conceptual implementation in the UI layer
if (exam.is_randomized) {
    for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
    }
}
```

## Duplication Engine

The **Duplicate Exam** function (`duplicateExam(examId)` in `examService.ts`) performs a deep copy of an existing exam.

1. **Exam Row Cloning**: It fetches the parent exam, strips the `id` and `created_at` fields to allow Postgres to auto-generate them, appends `(Copy)` to the title, and forcefully resets the status to `upcoming`.
2. **Questions Cloning**: Once the new exam ID is generated, it fetches all related rows from the `questions` table, overwrites their `exam_id` with the new exam ID, and inserts them sequentially.
3. This creates a fully independent replica. Results/Submissions are *not* copied to prevent cross-contamination.
