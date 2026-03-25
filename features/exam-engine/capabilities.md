# Capabilities: `ExamEngine.tsx`

This file provides the following atomic features specifically for the live Exam taking environment:

1. **Dual-Payload Bootstrapping**: Automatically synchronizes the fetching of exam metadata with the instantiation of a secure backend submission tracker.
2. **State Orchestration**: Acts as the central nervous system connecting the `useExamEngine` math/logic module to 6 distinct Presentational UI modules.
3. **Automated Sub-component Routing**: Dynamically ejects the user to the `/result` page when the underlying engine signals a `finished` state. 
4. **Fatal Error Boundary**: Traps network and execution errors independently, rendering a highly stylized "Failed to Load" glass-card component with a hard `window.location.reload()` retry mechanism.
5. **Initial Responsive Viewport Trapping**: Detects screen geometries under 1024px on load and auto-collapses the `ExamSidebar` to prevent mobile overlay clipping.
6. **Overlay Management**: Controls the Z-index rendering cycles for both the `SummaryModal` (Exam grid overview) and the `ConfirmSubmitModal` (The final strict gating before exam completion).
7. **Floating Action Trigger**: Implements a fixed-position lateral toggle button to manually hide/show the question sidebar on-demand, injecting CSS transform transitions for smoothness.
