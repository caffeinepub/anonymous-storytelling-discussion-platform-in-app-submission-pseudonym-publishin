# Specification

## Summary
**Goal:** Replace the app’s generated header wordmark and feed hero image color palette to a warm, neutral editorial look (no prominent blue/light-blue).

**Planned changes:**
- Recolor the existing generated wordmark and hero assets to warm neutrals (off-white paper, warm grays, ink/charcoal) and save as new filenames under `frontend/public/assets/generated`.
- Update the frontend to reference the new warm image filenames wherever the header wordmark and feed hero image are used.

**User-visible outcome:** The header wordmark and feed hero illustration display with a warm editorial palette and render correctly without broken image links.
