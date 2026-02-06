# Specification

## Summary
**Goal:** Add a clear articles/blog publishing flow so users can browse published articles publicly and submitters can verify their submissions (pending vs published).

**Planned changes:**
- Add an "Articles" entry to primary navigation and implement an Articles listing page powered by the existing published-content feed, including an empty state.
- Add an Article detail page that reuses the existing published story detail rendering so full article content is readable.
- Add a login-gated "My Submissions" page where authenticated users can view their own submitted articles with status (Pending/Published), backed by a new backend query tied to the caller identity.
- Update backend submission storage to record submitter Principal for each submission and to expose the caller’s submissions with status.
- Update the post-submit confirmation UI to clearly state submissions aren’t public until published, and provide a direct link to "My Submissions" (or a login call-to-action if logged out).
- Ensure existing story routes continue to function without broken links.

**User-visible outcome:** Visitors can browse published articles under a dedicated Articles section and read full article pages; logged-in users can see their own submissions immediately with a Pending/Published status and understand that submissions won’t appear publicly until published.
