# 2FA (TOTP) Security Logic

## Authentication Layers
The 2FA implementation uses Supabase Auth's native Multi-Factor Authentication (MFA) APIs. We do not use third-party OTP generation libraries like `otplib` on the client, as doing so would compromise security by generating secrets in the browser instead of the secure Auth server.

### 1. Enrollment (`mfa.enroll`)
When a user begins the setup process:
1. The client requests a new TOTP factor creation via `supabase.auth.mfa.enroll({ factorType: 'totp' })`.
2. Supabase generates a secure cryptographically random secret on the backend.
3. Supabase returns two representations to the client:
   - `totp.qr_code`: A pre-rendered SVG string containing the `otpauth://` URI payload.
   - `totp.secret`: The raw secret string (essential for users who cannot scan QR codes, serving as their initial recovery/setup key).

### 2. Verification Challenge (`mfa.challenge` & `mfa.verify`)
MFA setup is not complete merely by generating the QR code.
1. The client must prove possession of the secret by generating a valid 6-digit Time-based One-Time Password (TOTP).
2. The client opens a verification window via `mfa.challenge({ factorId })`.
3. The client submits the user-inputted 6-digit code via `mfa.verify({ factorId, challengeId, code })`.
4. The Supabase backend validates the TOTP against the server-stored secret using the current Unix timestamp (with standard 30-second window skew tolerance).
5. If valid, the factor status changes to `verified`. The user's session JWT is elevated from Assurance Level 1 (`aal1`) to Assurance Level 2 (`aal2`).

### 3. Database Synchronization
For application-level UI ease (e.g., displaying "2FA Enabled" badges), we mirror the MFA status into the `profiles` table:
- **Enable**: `update({ '2fa_enabled': true })` upon successful `verify()` response.
- **Disable**: `update({ '2fa_enabled': false })` upon successful `unenroll()` response.

### 4. Recovery & Backup Codes
Supabase currently does not natively generate static backup codes (unlike traditional custom implementations). 
To ensure users do not lock themselves out:
- During the **Enrollment phase**, the raw `totp.secret` is displayed to the user.
- The UI explicitly instructs the user to copy and save this secret in a secure location (e.g., a password manager) as their sole "Recovery Key". If their authenticator device is lost, entering this raw secret into a new app will restore TOTP generation capabilities.
