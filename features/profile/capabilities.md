# Profile — Capabilities

## 1. Avatar Management
- Click profile picture to upload a new one.
- Automatic client-side resize to 256x256 (WebP).
- Immediate local UI update before network finishes.

## 2. Personal Information
- Edit Name, Student ID, Major, Level, Mobile, and Date of Birth.
- Inline form validation (Zod) prevents bad data.
- Email is strictly read-only.
- Form detects unsaved changes and blocks immediate exit without warning.

## 3. Account Security
- Full password reset with Current Password verification.
- Dynamic password strength meter highlighting missing criteria (caps, numbers, etc).
- Eye/EyeOff toggles to view typing.
- 2FA toggle (currently UI-only, placeholder for TOTP).

## 4. Academic Snapshot
- Live-computed GPA and Average Score across all taken exams.
- Radial SVG gauge colored dynamically (A/B/C/D/F).
- Dynamic achievement badges:
  - **High Achiever** (unlocks at avg > 80%).
  - **Exam Veteran** (unlocks at total exams >= 5).

## 5. Preferences
- Language selection (English / Arabic).
- System appearance (Dark / Light) themes.
- View status of Email & Push notifications.
