# Capabilities: `ExamDetails.tsx`

This file provides the following atomic features specifically for the Exam Details routing context:

1. **Hydration via URL Parameter**: Automatically extracts the `/exams/:id` param and resolves the specific exam payload.
2. **Graceful Error Recovery**: Rebounds users to a safe catalog page if network responses yield 404s or network timeouts.
3. **Immersive Loading States**: Renders an exclusive, full-screen `<LoadingSpinner />` component trapping the UI until network resolution.
4. **Live Visual Countdown**: Presents a localized (mock) countdown timer.
5. **Dynamic Data Presentation Layout**: Organizes multiple sub-sections (Exam Structure, Topics Covered, Important Instructions) based on dynamic array lengths, gracefully falling back to static strings if array data is null/undefined.
6. **Interaction Gating**: Traps the start mechanism inside a two-step verification process (Button -> Confirmation Modal).
7. **Action Status Mapping**: Automatically provides context-aware CTA buttons (e.g. "Not Started Yet" [Disabled] vs "Resume Exam" vs "Review Results").
