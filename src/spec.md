# Specification

## Summary
**Goal:** Enable admins to create and publish the first article directly so the Articles page can show published content.

**Planned changes:**
- Add a new admin-only backend method to create and publish an article directly (without a prior user submission), validating required fields and rejecting empty/duplicate titles.
- Update the Admin moderation UI to include a “Create & Publish Article” form (title, author pseudonym, story/body, anonymity + author name as applicable) that calls the new backend method, shows success, and refetches published-article data so `/articles` updates without a hard refresh.
- Adjust the Articles page empty-state message (English) to clarify that articles appear after being published, while keeping the existing “Share Your Story” call-to-action for regular users.

**User-visible outcome:** Admins can publish an article from the moderation page and see it appear on the Articles page immediately; non-admins continue to see access denied for admin features, and the Articles empty state clearly explains that content appears after publication.
