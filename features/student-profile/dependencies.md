# Dependencies: `StudentProfile.tsx`

## External NPM Modules
- `react`: Maps `{ useState, useEffect }`.
- `react-hot-toast`: Employs global layout notification bindings `toast`.
- `lucide-react`: Resolves massive visual asset array (e.g. `User`, `Mail`, `Phone`, `Calendar`, `Shield`, `Settings`).

## Global Shared Entities
- `../../hooks/useAuth`: Retrieves the application-wide `user` session singleton object context.
- `../../services/supabase`: Imports the core initialized Supabase SDK engine directly rather than routing through specific table services.

## Stylesheets 
- `./StudentProfile.module.css`: Strict local implementation of scoped CSS classes mapping directly against `styles.container`, `styles.headerCard`, etc., ensuring total isolation from other pages.
