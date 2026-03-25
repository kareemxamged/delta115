# Interface: `StudentProfile.tsx`

## Exported Functions
- **`export default function StudentProfile()`**: Root layout module mapped firmly to `/student/profile`.

## Internal Types
- `type Tab = 'info' | 'security' | 'preferences' | 'stats'`: Exact string union driving menu visibility.

## Internal State Hooks
- `[activeTab, setActiveTab]`: Instantiated securely via the `Tab` definition lock.
- `[loading, setLoading]`: `boolean` blocker preventing multi-firing mutation calls.
- `[isEditing, setIsEditing]`: `boolean` map transitioning forms from purely visible to highly mutable interactions.
- `[profileData, setProfileData]`: Blind Object (`any`) mapping raw backend reads.
- `[formData, setFormData]`: Enforced Object shape specifically tracking the writable string matrix.

## Edge API Execution
- Direct implementation of Supabase SDK abstractions:
  - `supabase.from('profiles').select('*').eq('id', user?.id).single()`
  - `supabase.from('profiles').update({ ... }).eq('id', user?.id)`
  - `supabase.auth.updateUser({ data: { ... } })`
