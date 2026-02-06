# Specification

## Summary
**Goal:** Add an admin approval workflow so user-submitted stories stay pending until published by an admin, and allow admins to remove already-published articles.

**Planned changes:**
- Ensure newly submitted stories are stored as pending and excluded from all public story/feed/article listings until an admin publishes them.
- Add/adjust an admin-only publish action that moves a story from pending to published (so it no longer appears in pending moderation views).
- Add admin-only functionality (backend + admin UI) to list published stories and remove/unpublish a published story by title, updating the UI immediately after removal.

**User-visible outcome:** Users can submit stories but they won’t appear publicly until an admin publishes them; admins can publish pending submissions and remove published articles so they disappear from listings and show a not-found/error state on their detail page.
