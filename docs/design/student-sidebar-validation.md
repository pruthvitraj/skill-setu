# Student sidebar theme validation

Only application-source changes for this task:
- `client/src/styles/student-sidebar.css`: IBM Plex Sans import and student-role-scoped navigation styles, including sidebar, mobile bar/drawer, account controls, focus, active indicator and scrollbar.
- `client/src/layouts/WorkspaceShell.jsx`: one CSS import. Rendering, navigation links, route matching, focus effects, Escape handling, focus restoration, scroll locking, account controls and logout handlers are unchanged.

All selectors are restricted to `.workspace-shell[data-role='student']` navigation elements. No page-content tokens, sign-in components, backend, routes or workflows changed. Existing uncommitted learning-screen work was preserved.

Validation on 2026-10-07 (Asia/Calcutta):
- Three existing navigation tests passed.
- Client production build passed; existing approximately 1 MB main bundle warning remains.
- Existing synthetic audit accounts used with retained `skillsetu_audit_1791216328267`, API 5001/frontend 5174, process-only environment overrides; no seed, migration fixture or configuration edit.
- All 17 student navigation destinations opened on desktop and had exactly one correct active item and #050505 sidebar background.
- All 17 destinations also opened using the mobile drawer at 390px. Each selection closed the drawer, removed main inertness, restored scrolling and focused `workspace-main`.
- Mobile keyboard opening focused Close menu; reverse Tab from the first control wrapped to Log out; Tab from Log out wrapped to the brand link. Escape and Close menu restored focus to Menu. Open drawer preserved main inertness and body scroll lock.
- Student computed navigation styles: #050505 background; IBM Plex Sans family; #00FF66 active text; rgba(0,255,102,.08) active background; 2px green indicator. Almost-square controls and visible green focus outline inspected in screenshots.
- Mobile and desktop student logout returned to sign-in. A protected student URL redirected to sign-in after logout. A read-only MongoDB count confirmed the mobile logout removed one student session (9 to 8); other existing sessions were retained.
- Company and TPO authenticated desktop and mobile navigation retained #202827 background and the original styles. Desktop font remained Segoe UI and active text remained #123F37 for both roles.
- Screenshots: `screenshots/student-sidebar/desktop.jpg` (1280px) and `mobile.jpg` (390px).

The IBM Plex Sans font uses the existing project approach of remote font CSS with local fallbacks. No native 200% zoom or forced reduced-motion browser test was performed; reduced-motion CSS disables the scoped transitions. All temporary validation servers and browser tabs were closed after checks.
