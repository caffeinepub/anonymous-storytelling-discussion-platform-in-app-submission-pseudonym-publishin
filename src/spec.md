# Specification

## Summary
**Goal:** Add a dedicated Contact page and ensure the app’s Contact navigation reliably shows the author’s details and social links.

**Planned changes:**
- Create a new `/contact` route that renders within the existing `AppLayout` and is reachable via the app router.
- Update the header/top navigation “Contact” action to navigate to `/contact` (remove `mailto:` behavior from the header action).
- Build Contact page content to display: Name “Sana Khan”, book title “Shining Gaze - A search for the unknown”, and clickable Instagram/LinkedIn links that open in a new tab with appropriate `rel` attributes.

**User-visible outcome:** Users can click “Contact” in the navigation to open a Contact page that clearly shows Sana Khan’s name, the book title, and working Instagram/LinkedIn links.
