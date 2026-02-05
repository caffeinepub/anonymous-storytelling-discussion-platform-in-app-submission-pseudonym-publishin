# Specification

## Summary
**Goal:** Improve diagnostics and user guidance when the stories feed fails to load by distinguishing backend unreachability/propagation delays from application-level errors, and by providing clearer retry progress and troubleshooting actions.

**Planned changes:**
- Add a lightweight backend public availability method (e.g., ping/health) that returns immediately when the backend canister is reachable, and expose its result to the frontend.
- Update the feed error handling to call the availability check when story fetch fails and label the error as “Backend unreachable/not propagated” vs “Backend reachable but request failed”.
- Enhance the “Failed to load stories” feed error state with actionable troubleshooting text, detected canister details (frontend asset canister ID, backend canister ID when available, standard/raw URLs), and one-click actions (Retry now, open Troubleshooting, open raw.icp0.io URL when detectable), including copy-to-clipboard/copy affordances.
- Adjust frontend retry/backoff behavior for fetching stories to show an explicit “Checking backend…” / “Retrying…” progress state for the first ~10–15 seconds, using increasing delays up to a cap and ending in a final actionable error state with manual retry.

**User-visible outcome:** When stories fail to load, users see clear progress and then a helpful, actionable error screen that explains whether the backend is unreachable/still propagating versus a request error, and provides canister/URL details plus quick actions to retry or troubleshoot.
