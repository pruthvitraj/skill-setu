# Custom login role dropdown validation

Only the login role field was replaced. No accessible dropdown primitive was installed in the project, so a small controlled select-only combobox/listbox component was added. Existing student/tpo/recruiter values, default Student selection, parent selection state and authentication submit handler remain unchanged. No dependency, backend, credentials or other UI was modified.

The menu uses #0C0C0C, a white/10 border, 3px corners and comfortably spaced rows. Lucide GraduationCap, Building2 and Briefcase icons identify roles; Check marks the selected value in green. The menu matches the field width and uses subtle green active/hover treatments. All styling is scoped under the existing authentication root.

The trigger remains the keyboard focus owner, with a labeled combobox, listbox and selected options; aria-activedescendant identifies the active option. Arrow keys navigate, Home/End jump, Enter/Space open or commit, Escape closes without changing selection, and Tab closes while moving onward. Selection returns focus to the trigger. Outside pointer clicks dismiss without stealing focus. Pointer highlighting only reacts to movement so a stationary pointer cannot override keyboard selection. Typeahead and mobile touch selection are supported.

## Checks on October 7, 2026

- Headless Edge browser checks passed at desktop 1440x1000 and mobile 390x844, using synthetic authentication fixtures.
- Verified default value and all three selections, Arrow/Home/Enter/Space controls, Escape cancellation, Tab order, selected focus restoration, outside dismissal, touch selection and no horizontal overflow.
- Menu width/left position matched the field on both viewports, and computed menu background was #0C0C0C.
- Native email/password validation, busy/error feedback, recovery/registration links and all three mocked role redirects remained unchanged. Login payload still contained only email and password.
- All 13 focused client search/recommendation/navigation checks passed.
- Production client build passed with the existing large-chunk warning.
- Updated screenshots were visually inspected; they show synthetic fixtures, not real login or account data.

Files: `client/src/components/common/AuthRoleSelect.jsx`, login field markup in `client/src/routes/AppRoutes.jsx`, dropdown-only rules in `client/src/styles/auth-login.css`, and `client/tests/auth-login.browser.cjs`.

Screenshots: `docs/design/screenshots/auth-login/desktop.png` and `mobile.png`.

Repeat the browser check from the client directory with a local client on port 5173: `node tests/auth-login.browser.cjs`. It uses installed Edge and Playwright, supplied via PLAYWRIGHT_MODULE if the package is bundled, and mocks all API traffic. No real authentication or database write occurs.
