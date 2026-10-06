# Targeted audit demo-account setup

This utility updates only these existing users, with the exact expected roles:

| Email | Role |
| --- | --- |
| audit.student@skillsetu.test | student |
| audit.recruiter@skillsetu.test | recruiter |
| audit.tpo@skillsetu.test | tpo |

It does not create users, reseed, migrate, change profiles or permissions, or touch the other audit accounts. Missing, duplicate, inactive or wrongly assigned accounts fail preflight before writes. Password hashing uses the application's bcrypt helper (cost 12). Apply changes only passwordHash, authVersion and password-reset fields on the selected users, then deletes sessions belonging to their IDs. Incrementing authVersion invalidates existing JWTs as well as deleting persisted sessions.

## Choose the database explicitly

The two retained audit databases are `skillsetu_audit_1791216328267` and `skillsetu_audit_1791231388332`. Choose one; never assume the running backend uses it. The saved backend configuration currently names `skillsetu`. The utility requires `--database`, overriding any database component of the connection URI. It does not load environment files. Without process-level MONGO_URI, it connects to local MongoDB at 127.0.0.1:27017. For another MongoDB server, set MONGO_URI privately in the current process.

From PowerShell, inspect first (no password needed, no writes):

```powershell
Set-Location D:\Setup\skill-setu\server
$demoDatabase = 'skillsetu_audit_1791216328267' # replace with the chosen existing database
node src/scripts/setup-demo-accounts.js --database $demoDatabase --check
```

Then enter the password at a masked prompt. Do not put it in a command, tracked file, environment file or Git commit:

```powershell
$demoSecret = Read-Host 'Demo password (at least 8 characters)' -AsSecureString
$demoCredential = [System.Management.Automation.PSCredential]::new('demo', $demoSecret)
try {
    $env:DEMO_PASSWORD = $demoCredential.GetNetworkCredential().Password
    node src/scripts/setup-demo-accounts.js --database $demoDatabase --apply
    if ($LASTEXITCODE -ne 0) { throw 'Demo setup failed; inspect and rerun before using accounts.' }
    node src/scripts/setup-demo-accounts.js --database $demoDatabase --verify
    if ($LASTEXITCODE -ne 0) { throw 'Demo verification failed.' }
} finally {
    Remove-Item Env:DEMO_PASSWORD -ErrorAction SilentlyContinue
    $demoCredential = $null
    $demoSecret = $null
}
```

Successful apply includes verification of all three stored hashes and zero remaining sessions; independent `--verify` is read-only. Output contains database, emails, roles and counts, never the password or hashes. Default mode is `--check`. Reapplying revokes any new demo sessions again. Stop demo-account activity during setup/verification: a concurrent login can cause verification to fail.

MongoDB standalone does not support a multi-collection transaction. If a write or session cleanup fails mid-run, setup exits nonzero and may be incomplete; rerun with the same password after resolving the failure. The changed authVersion prevents old tokens from being accepted even if session deletion fails. This script deliberately does not start the backend or change its configuration. For a browser login check, use a backend already configured for the same chosen database, and sign in separately as each role; fresh logins create new sessions, so perform the zero-session verification before those logins.

Regression tests: `node --test tests/demo-account-setup.test.js` from server. Do not run `test:live` to validate this utility: that fixture creates a new database and accounts.

## Validation of this change

- Server regression suite: 42 tests passed, including six targeted setup tests.
- Read-only `--check` passed against both retained audit databases and identified exactly the designated student, recruiter and TPO accounts.
- Tests cover refusal before writes for missing/duplicate/inactive/wrong-role accounts, preservation of unrelated users and sessions, bcrypt cost 12, authVersion increments, reset-token removal, verification failures and session cleanup failures.
- No seed or migration fixture was executed. A live password update requires an explicit database selection and process-level DEMO_PASSWORD; read-only checks alone do not establish that a password was changed.
