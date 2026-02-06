# Specification

## Summary
**Goal:** Replace the removed “My Submissions” area with a dedicated Login page for Internet Identity authentication.

**Planned changes:**
- Remove the “My Submissions” entry from the header navigation while keeping all other existing nav items intact.
- Add a new `/login` route that uses the existing Internet Identity hook to let users log in (when unauthenticated) and log out (when authenticated), with English-only UI text.
- Remove/disable the existing `MySubmissionsPage` route and make `/my-submissions` redirect to (or render) the `/login` experience.
- Update any UI that links to `/my-submissions` (e.g., post-submit success state) to link to `/login` instead, with updated English call-to-action text.

**User-visible outcome:** Users no longer see “My Submissions” in the header; they can visit `/login` to log in/out with Internet Identity, and any attempt to visit `/my-submissions` will take them to the Login page.
