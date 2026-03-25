# Profile Avatar Management

## Overview
This feature allows users (Students, Teachers, Admins) to upload, display, update, and remove their custom profile avatars. It uses Supabase Storage for storing images and the `avatar_url` column in `public.profiles` and `auth.users` for referencing them.

## Backend Architecture

### 1. Storage Bucket
- **Name**: `avatars`
- **Public**: `true` (Avatars must be readable by the public/all authenticated users for UI rendering across the app)

### 2. Row Level Security (RLS) Policies on `objects` table
Avatars must be highly secure so users cannot overwrite or delete other users' files.
- **Select**: `true` for all authenticated users.
- **Insert**: `auth.uid() = (storage.foldername(name))[1]`
- **Update**: `auth.uid() = (storage.foldername(name))[1]`
- **Delete**: `auth.uid() = (storage.foldername(name))[1]`

_Structure note_: Files are saved in the format `{user.id}/avatar.webp`. The RLS policy enforces that a user can only upload to a folder matching their own `uuid`.

### 3. Database
- `public.profiles` table utilizes the `avatar_url` column (`text`).

## UI / UX Implementation

### Core Requirements
1. **Reusable Component (`<UserAvatar />`)**
   - Renders the avatar image if available.
   - Casts a placeholder (Initials) using a dark theme gradient (`#334155` to `#1e293b`) if missing.
   - Handles `size` properties.

2. **Upload Flow (`StudentProfile.tsx`)**
   - Clickable avatar circle with `lucide-react` Camera overlay.
   - Instantly shows a client-side Blob URL preview.
   - Resizes image client-side to 256x256 via HTML5 Canvas (improves performance, ensures uniform aspect ratio).
   - Converts image to `image/webp`.
   - Uploads to `avatars` bucket with `upsert: true`.
   - Caches-busts the new image URL by appending `?t=timestamp`.

3. **Remove Flow**
   - Visible only if a custom avatar is set.
   - Uses a Red/Danger style button (`lucide-react` Trash2 icon).
   - Calls `supabase.storage.from('avatars').remove()`.
   - Nullifies `avatar_url` in both `profiles` and `auth.users`.

4. **Sidebar Integration (`Layout.tsx`)**
   - Utilizes `<UserAvatar />` or directly renders the image securely.
   - Updates dynamically when the global `user` context changes.
