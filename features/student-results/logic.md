# Logic Breakdown: `StudentResults.tsx`

## The "How" and "Why"
The `StudentResults.tsx` file acts as the primary analytics dashboard for the student, consolidating historical performance metrics into a single interactive view.

### 1. Unified Fetching and Dual-State Memory
- **How**: Calls `examService.getUserResults()` on mount. The output is stored identically in two separate state hooks: `results` (the immutable master copy) and `filteredResults` (the mutable display copy).
- **Why**: Standard UI caching mechanism. This allows the user to backspace a search term without the component needing to hit the server a second time to retrieve the lost data.

### 2. Multi-Dimensional Intersectional Filtering
- **How**: A secondary `useEffect` listens to changes in `search`, `subjectFilter`, `dateFilter`, and `results`. It runs the `results` array through sequential `.filter()` pipelines, passing the final pruned array to `setFilteredResults`.
- **Why**: By chaining `.filter()`, the logic acts as an implicit `AND` operator, ensuring the list shrinks accurately when multiple constraints act together (e.g. searching "Algebra" specifically under the "Math" subject dropdown).

### 3. Synchronous Mathematical Aggregations
- **How**: Executes inline reducing math operations (`Math.max`, `Math.min`, `array.reduce`) on the `filteredResults` array during the render cycle.
- **Why**: Ensures that the `StatCard`s at the bottom of the dashboard dynamically update in real-time as the user types into the Search bar.

### 4. Custom Declarative Data Visualization (SVG)
- **How**: The internal `SimpleLineChart` function iterates over the dataset utilizing pure arithmetic (`(percentage / maxY) * availableHeight`) to map data coordinates into raw SVG `<circle>` and `<polyline>` points.
- **Why**: Bypasses the need for heavy external charting libraries like `Chart.js` or `Recharts`, vastly reducing the JavaScript bundle size for a fundamentally simple curve requirement.

---

## 🔍 Review Report (Architectural Audit)
- **Dead Code (Phantom Dependency)**: The state hook `dateFilter` is declared, wired to a `useState`, and listed in the dependency array of the filtering `useEffect`—but it is **never actually used** inside the filtering calculations.
- **Risk of Call Stack Overflow**: The formulation `Math.max(...filteredResults.map(r => r.percentage))` dynamically expands an array into distinct function arguments. While safe for 1-1,000 items, if `filteredResults` grows beyond JavaScript's maximum parameter limit (~65,536), the dashboard will critically crash. This should be rewritten using `.reduce((max, curr) => Math.max(max, curr.percentage), 0)`.
- **Architectural Bleed**: `SimpleLineChart` and `StatCard` are defined as unexported functions *within* the same file but outside the default component. This forces the file to carry weight it shouldn't and makes those highly valuable UI components completely inaccessible to the rest of the application. They should be extracted to `src/components/`.
- **Typing Collapse**: Unlike previous pages which strongly adhered to `Exam` and `ExamResultData` interfaces, this file abandons TypeScript entirely, mapping incoming payloads exclusively to `any[]`. This nullifies IDE autocompletion and drastically increases the risk of runtime errors upon API schema modifications.
