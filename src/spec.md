# Specification

## Summary
**Goal:** Make authentication easy to find from anywhere in the app and ensure admins can reach the moderation workflow after logging in.

**Planned changes:**
- Update the global header (AppHeader) to always show a visible “Login” control when logged out (navigates to `/login`) and a visible “Logout” control when logged in, while keeping existing navigation links intact.
- Add a prominent “Login” call-to-action in the Home page hero for logged-out users that navigates to `/login`, in addition to the existing hero actions.
- Verify admin-only navigation and routing: show an “Admin” link in the header only for authenticated admins, ensure `/admin` renders the existing moderation page (including “Awaiting Approval”) for admins, and ensure non-admin/logged-out users see an access denied state (with an Internet Identity login prompt when logged out).

**User-visible outcome:** Logged-out users can always find a Login option in the header (and on the Home hero), logged-in users can log out from the header, and admins can navigate to `/admin` to access the moderation/approval workflow while others see an appropriate access-denied view.
