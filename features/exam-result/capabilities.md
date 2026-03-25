# Capabilities: `ExamResult.tsx`

This file provides the following atomic features for post-exam review:

1. **Sub-system API Interception**: Executes targeted queries exclusively against the `getSubmissionResult` endpoint rather than standard exam endpoints.
2. **Defensive Error Handling Grid**: Provides a highly styled, inline-coded "Result Not Found" error boundary containing SVG iconography and context-aware callback buttons.
3. **Synchronous Loader Masking**: Blocks partial visual rendering until the backend completes response resolution via `<LoadingSpinner fullScreen />`.
4. **Prop Delegation Orchestration**: Acts as the sole data provider for 5 nested visual modules (Header, Breakdown, Feedback, Chart, Footer).
5. **Macro-Layout Enclosure**: Enforces the maximum constraints (`maxWidth: '800px'`, `margin: '0 auto'`) for the entire nested reporting grid.
6. **Isolated Exit Redirection**: Implements an interactive 'Back to Exams Library' button featuring inline hover-state logic via `onMouseOver` / `onMouseOut` event hooks.
