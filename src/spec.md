# Specification

## Summary
**Goal:** Help users and developers recover from the “Canister ID Not Resolved” (Error 400) issue by adding in-app troubleshooting guidance and repo documentation for forcing a clean redeploy.

**Planned changes:**
- Add a new user-facing UI section/page titled “Troubleshooting: Canister ID Not Resolved” (or similar) explaining what the error means and that it’s commonly due to routing/edge propagation.
- Display the app’s known access URLs in a copyable format for both patterns using the app canister ID available at build time: `https://<CANISTER_ID>.icp0.io` and `https://<CANISTER_ID>.raw.icp0.io`.
- Include basic troubleshooting guidance in the panel (refresh/wait, try alternate network/browser) and make it reachable from existing navigation (e.g., footer/About) without authentication.
- Add a new repository doc file (e.g., `DEPLOYMENT.md`) with step-by-step `dfx` commands to stop, clean, redeploy, and verify canister IDs, plus verification steps for opening via `icp0.io` and `raw.icp0.io`.
- Include a brief checklist in the doc of common causes for “Canister ID Not Resolved” and what to try before redeploying.

**User-visible outcome:** Users can open an in-app troubleshooting page that explains the error and provides copyable `icp0.io` and `raw.icp0.io` URLs for the app canister, while developers have clear redeploy steps in a new doc to force a clean redeploy and verify canister IDs.
