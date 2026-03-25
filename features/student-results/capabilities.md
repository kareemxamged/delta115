# Capabilities: `StudentResults.tsx`

This file is responsible for the following localized capabilities:

1. **Macro Data Retrieval**: Exclusively pulls aggregated historical logs mapping to a single user context (`getUserResults()`).
2. **Interactive Search & Indexing**: Real-time cross-filtering via Title Text Search and dynamically pooled Subject dropdowns.
3. **Data Mathematics**: Real-time dynamic recalculations of Macro Trends (Average Scope, Peak Score, Minimum Scope, Item Counts).
4. **Visual Charting Engine**: Generates a responsive, natively scaled SVG representation of chronological exam performance mapping percentage points over an X-Y axis.
5. **Conditional Progression Badging**: Dynamically assigns color variables (Green `$10b981`, Yellow `#f59e0b`, Red `#ef4444`) to percentage scores based on passing severity heuristics.
6. **Action Funnels**: Routes historical items down the pipeline to deep review modules (`/exam/:id` and `/exam/:id/review`).
7. **Mock Export Trigger**: Currently binds a theoretical PDF export module via a UI alert placeholder.
