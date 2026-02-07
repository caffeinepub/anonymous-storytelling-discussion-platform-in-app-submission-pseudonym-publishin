# Specification

## Summary
**Goal:** Finalize access-control initialization so normal authenticated users can use core app features without an admin token, ensure heartbeat reliability, and verify the app is ready to publish/go live.

**Planned changes:**
- Update backend access-control initialization so `_initializeAccessControlWithSecret` never traps on empty/invalid secrets and does not block authenticated actor creation or normal user actions.
- Ensure any authenticated principal can obtain `#user` permissions (via the existing initialization flow) to use user endpoints: `submitStory`, `addComment`, `addReview`, `getMySubmissions`, `getCallerUserProfile`, `saveCallerUserProfile`, without requiring an admin token.
- Keep admin-only endpoints restricted to admins (no permission widening).
- Make `checkBackendHeartbeat()` callable anonymously and reliably return `true` without trapping for consistent frontend availability checks.
- Perform final pre-release verification in the deployed environment covering: anonymous browsing, Internet Identity login, story submission and “My Submissions”, commenting/reviewing, admin moderation restrictions, and heartbeat-based reachability checks.

**User-visible outcome:** Users can browse the app anonymously, log in with Internet Identity, submit stories, view their submissions, and add comments/reviews without authorization traps even without an admin token; admins retain exclusive access to moderation actions; the app’s backend availability check consistently reports reachability when the backend is up.
