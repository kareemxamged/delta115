# Capabilities: `ExamsList.tsx`

This file serves as a monolithic component providing the following specific capabilities:

1. **API Integration**: Connects cleanly to the backend `examService.getExams()`.
2. **Text-based Search**: Real-time filtering by exam title (case-insensitive).
3. **Status Tab Filtering**: Top-level macro filtering dividing exams into All, Upcoming, Ongoing, and Finished categories.
4. **Subject Dropdown Filtering**: Generates a dynamic, de-duplicated list of subjects from the incoming payload and filtering items interactively.
5. **Status Dropdown Filtering**: Redundant capability allowing explicit dropdown selection for status limits.
6. **Client-Side Pagination**: Slices the filtered dataset dynamically to display 6 elements at a time.
7. **Smooth Scrolling**: Enforces user viewport changes by scrolling organically to the top when pagination triggers.
8. **Visual State Badging**: Maps dynamic background colors (`exam.subject_color`) and conditional SVG outputs to specific subjects, rendering unique visual identities for cards.
9. **Conditional Routing Execution**: Dynamically maps routing paths based on exam status (e.g., `submission_status === 'submitted'` routes to `/result`, `submission_status === 'started'` routes to `/take`, otherwise routes to Details).
10. **Passing/Failing Heuristics**: Calculates color codes inline for user interface score tracking (Green vs. Red backgrounds for >= 50% / < 50%).
