# Profile — Logic & Data Flow

## State & Data Sources
- **`StudentProfile` (Orchestrator)**
  - Fetches from `profiles` table to populate the header (name, id, major, mobile, etc.).
  - Pulls `avatar_url` locally and optimistically scales the `<img src>`.
  - Lazy-loads 4 independent tabs (`<Suspense>`).

## Tab-Specific Logic

### 1. `PersonalTab` (RHF + Zod)
- **Validation**:
  - `mobile`: Regex `^(\+\d{1,3}\s?)?\d{9,13}$`.
  - `date_of_birth`: Must not be in the future.
- **Save Strategy**:
  - Updates `profiles` table first.
  - Then updates `supabase.auth.updateUser` metadata (to keep JWT in sync).
  - Unsaved changes banner tracks `isDirty`.

### 2. `SecurityTab` (Password)
- **Strength Algorithm**:
  - 1 point each for: length > 8, length > 12, uppercase, number, special char.
  - Score mapped to: Weak (0-1), Fair (2), Good (3), Strong (4), Very Strong (5).
- **Update Flow**:
  1. `signInWithPassword` using `currentPassword` to verify identity.
  2. If valid, `updateUser({ password: newPassword })`.
  3. Confirms matching passwords client-side via Zod refinement.

### 3. `AcademicTab` (GPA)
- **Data Source**: Fetches from `submissions` joined with `exams(total_marks)`.
- **Computation**:
  - `avgScore` = sum of `(score / total_marks) * 100` / `count`.
  - `gpa` = `(avgScore / 100) * 4.0` (Standard 4.0 scale).
  - `passRate` = `%` of exams where score ≥ 50%.

### 4. Avatar Upload
- **Preview**: `URL.createObjectURL(file)`
- **Optimization**: Canvas API `drawImage()` scales to **256x256**. Outputs as `'image/webp'` via `canvas.toBlob()`.
- **Storage**: Upserts to `avatars` bucket → `[uuid]/avatar.webp`.
