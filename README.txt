RAVENWOOD: CONTAINMENT PROTOCOL — NETLIFY MIGRATION SOURCE

DEPLOYMENT STATUS: NOT VERIFIED / NOT A WORKING NETLIFY DROP PACKAGE
This archive contains the migrated multiplayer source and a prebuilt frontend. It cannot honestly be described as a verified, drag-and-drop multiplayer deployment.

Two blockers remain:
1. Netlify Drop uploads static files and does not run the project build. Netlify Functions must be deployed through a supported function deployment/build route. Dropping this whole source ZIP into Netlify Drop will not activate the multiplayer backend.
2. The workspace returned HTTP 403 when downloading the official @netlify/blobs SDK. The complete production build and Netlify-packaged Function therefore remain unverified. The frontend build and local gameplay tests passed.

No game was published. No Netlify resources were created. The original uploaded single-player game is preserved byte-for-byte in Original_Single_Player_Backup.zip.

IMPLEMENTED
- Standard Netlify Function source: netlify/functions/game.ts, with its default route.
- Frontend calls /.netlify/functions/game directly. No custom path configuration or /api/game redirect.
- Helpers are in server/, outside netlify/functions/.
- Netlify Blobs strong-consistency reads, conditional creation, ETag conditional updates and bounded conflict retries.
- Browser-generated pseudonymous sessions; no Firebase project, manual database provisioning, application API key or user-entered environment variable.
- Short request/poll synchronization; no continuously running production server.
- Four distinct investigators, original artwork, movement/collision, inventory, scientific puzzles, accessible controls and local certificates retained.
- All six zones grouped into three cooperative rounds, as selected. Each completed investigation and required review earns 100 team points. Two zones per round: 200 points per round; 600 total. The final winning result names the investigation team. No individual ranking, speed bonus or retry penalty.
- Scoring is derived on the server from verified progress. Clients cannot submit arbitrary scores.

FILES
frontend/ — editable complete frontend source.
dist/ — prebuilt static frontend, insufficient by itself for multiplayer.
netlify/functions/game.ts — the only Function entry.
server/ — storage-independent request service, trusted scientific/progression policies and round scoring.
netlify.toml — standard publish/build/function configuration.
package.json and package-lock.json — dependency-free local build/test tooling.
scripts/build.mjs — copies/verifies the frontend, then automatically installs the pinned official Netlify Blobs SDK (10.5.0) for a supported hosted build. This step failed in this workspace with HTTP 403. Runtime SDK transitive packages have not been resolved or locked here; they are not represented by the tooling-only lockfile. This limitation must be resolved before calling the package production verified.
tests/ — request-service tests and optional two-client scientific route tests.
VERIFICATION.txt — actual tests and untested items.
ACCEPTANCE-CHECKLIST.txt — checks needed before release.

OWNER SETUP
There is no Firebase setup, database editor, API key or environment-variable form to fill in. A correctly built/deployed Netlify Function receives its Blobs context from Netlify automatically. A supported function-capable deployment route is still necessary. A plain static drag-and-drop upload does not meet that requirement.

SAVING AND PRIVACY
The room code and anonymous session stay in the same browser-tab session. Refresh can rejoin that identity. Clearing storage, closing the tab or switching devices may lose access to a started room. Scientific drafts, evidence reviews and fictional codenames are shared room data. Optional certificate real names stay local and are never sent to the service.
Rooms expire after approximately 23 hours. Expiration denies access; it does not automatically delete retained blobs. Presence expires after 20 seconds without polling; the client pauses movement on connection failure. Exact network timing has not been verified on Netlify.

PRODUCTION LIMITS
Actual Netlify latency, Blobs concurrency guarantees as observed through the SDK, function packaging, usage/cost under movement polling, browser layouts, accessibility and printing remain unverified. Blobs is documented for frequent reads/infrequent writes; classroom load testing is essential for this movement workload.

PRIMARY DEPLOYMENT REFERENCES
https://docs.netlify.com/deploy/create-deploys/
https://docs.netlify.com/build/functions/get-started/
https://docs.netlify.com/build/data-and-storage/netlify-blobs/
