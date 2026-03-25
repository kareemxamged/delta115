# Logic Breakdown: `StudentResults.tsx`

## Phase 1: Deep-Scan Audit (Logic & UI Overhaul)

### 1. State Management & Filtering Arrays
- **Synchronous Filtering**: The component uses a `useEffect` hook to map `results` into `filteredResults`. It accurately checks `search` (against `.title`), `subjectFilter` and `sortOrder`.
- **Mathematical Aggregations**: The `avgScore`, `highestScore`, and `lowestScore` are safely calculated using `.reduce()`. This guarantees $O(N)$ execution safety against massive datasets, permanently resolving `Maximum Call Stack Size Exceeded` risks.

### 2. UI Engineering & Data Visualization
- **Recharts Integration**: The visualization engine is powered by `recharts`. A native `<ResponsiveContainer>` wraps the `<LineChart>` to guarantee fluid layout scaling. The chart uses custom `<linearGradient>` injections for deep-purple strokes.
- **Topological Conditionals**: The trend container implements a triple-branch rendering state:
  - **`N = 0` (No Data)**: Renders a constrained 200px empty state.
  - **`N = 1` (Baseline)**: Renders a "Baseline Established" blocker over a faux SVG cubic-bezier curve to fill the visual void (since mathematically 1 point cannot draw a trend line).
  - **`N > 1` (Live Data)**: Renders the fully functional `<LineChart>`.

---

## Phase 2: Feature Matrix (Resolving Missing Gaps)

*   **Empty States (Resolved)**: An intelligent `length === 0` fallback intercept handles zero-result filtering, rendering a friendly `AlertCircle` prompt.
*   **Search/Sort (Resolved)**: 
    *   *Search*: Exists and functions correctly against the `title` node.
    *   *Sort*: Users can securely sort payloads by Date (`Newest`/`Oldest`) or Score (`Highest`/`Lowest`).
*   **Export Functionality (Resolved)**: The `handleDownload` trigger generates a native JS Blob, mapping `filteredResults` to raw CSV format and initiating a secure browser download.
*   **Mobile Responsiveness (Resolved)**: The rigid grid locks were replaced with `flexWrap: 'wrap'` and isolated component fluid caps, fixing the 550px overflow constraint on mobile viewports.
