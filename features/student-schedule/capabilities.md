# Capabilities: `StudentSchedule.tsx`

This file provides localized capabilities specifically addressing temporal organization:

1. **Mass Chronological Aggregation**: Bootstraps the entire payload of available `Exam[]` objects.
2. **Tri-State Formatting**: Projects dataset mappings via Calendar Grid (Month), Sparse Calendar Grid (Week), or Linear Chronological Stack (List).
3. **Temporal Math Resolving**: Handles precise chronological drift computations mapping Leap Years, variable month days, and week intersections organically.
4. **Interactive Navigation Paging**: Implements directional toggling (Previous/Next) mapped seamlessly between different contextual units (7-day intervals vs 1-month intervals).
5. **Real-Time Automated Priority Escrow**: Computes dynamic visual prioritization tags (Upcoming = Blue, Today = Green, Missed = Red, Completed = Orange) determined against exact-minute server alignments.
6. **Cross-View Synchronization**: Mutating state parameters natively persists across all visualization formats allowing a single source of truth for `currentDate`.
