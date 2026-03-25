# Capabilities: `StudentResults.tsx`

This target file provides the following operational mechanics:

1. **Global Result Hydration**: Automatically invokes `examService.getUserResults()` upon component mount to pull historic data.
2. **Dynamic Aggregate Computations**: Calculates total exams taken, absolute highest score, lowest score, and averaged sum metrics dynamically based tightly on the intersecting search/filter parameters.
3. **Data Visualization**: Renders an internal, self-calculating `<SimpleLineChart />` generating a `<polyline>` mapped strictly against historic percentages. Note: This chart handles an internal empty state ("Take more exams to see your trend!").
4. **Parameterized Routing**: Navigates outwardly to isolated deep-views using explicit IDs (`/student/exam/${result.examId}` and `/student/exam/${result.examId}/review`).
5. **Partial Content Matching**: Resolves localized string filtering checking inputs against exam `.title`.
6. **Unique Subject Extrapolation**: Uses `Array.from(new Set(...))` to automatically extract unique subjects from the data payload, preventing hardcoded dropdown lists.
