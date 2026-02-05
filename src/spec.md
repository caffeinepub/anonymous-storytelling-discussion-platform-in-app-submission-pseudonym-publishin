# Specification

## Summary
**Goal:** Add an About Me page with the creator’s bio/mission text and provide navigation to it from the global footer.

**Planned changes:**
- Create a new About page that renders the full provided “About Me” text in English, including “Genuine Being Real” and “Shining Gaze – A Search for the Unknown,” styled to match the existing warm editorial theme and responsive on mobile/desktop.
- Add a new TanStack Router route at `/about` wired to the About page component, ensuring existing routes continue to work (`/`, `/submit`, `/story/$title`, `/admin`).
- Add an “About” link to the global layout footer that navigates to `/about` while keeping the existing footer content intact, including “© 2026. Built with love using caffeine.ai”.

**User-visible outcome:** Users can click an “About” link in the footer to navigate (client-side) to an About page that displays the creator’s full bio/mission text in the site’s existing warm editorial style.
