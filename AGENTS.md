# Repository instructions

## Commit and push identity

- When the user says "push", commit the intended changes and push them as **Unigalactix**, unless the user explicitly overrides this preference.
- Use `https://github.com/Unigalactix/RCB.git` as `origin` and `main` as the default branch.
- Set the repository-local Git author and committer identity to `Unigalactix <119551096+Unigalactix@users.noreply.github.com>`. Do not change global Git identity.
- Authenticate GitHub operations with the stored **Unigalactix** account. In PowerShell, scope authentication to the current process:

  ```powershell
  $env:GH_TOKEN = gh auth token --hostname github.com --user Unigalactix
  if ($LASTEXITCODE -ne 0) { throw 'Unigalactix authentication is unavailable.' }
  gh api user --jq .login
  ```

- Verify that the authenticated login is `Unigalactix` before writing to GitHub. Never print, persist, or commit the token, and do not switch the globally active account.
- For HTTPS Git operations, use the process-scoped token through GitHub CLI:

  ```powershell
  git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push -u origin main
  ```

- Review the intended staged changes, run the relevant checks, commit with a descriptive message, and verify that the remote branch matches the local commit after pushing.
- Never force-push, overwrite remote history, include secrets, or commit unrelated user changes.
- On this Windows drive, Git may report dubious ownership because the filesystem does not record owners. If needed, use `git -c safe.directory=D:\Personal\RCB ...` for each command, or the equivalent process-scoped `GIT_CONFIG_COUNT`/`GIT_CONFIG_KEY_0`/`GIT_CONFIG_VALUE_0` settings. Do not disable ownership checks globally or trust all directories.
- Include this commit-message trailer unless the user requests otherwise:

  ```text
  Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>
  ```

## Project conventions

- This is a static HTML/CSS/JavaScript site for GitHub Pages. Keep asset URLs relative and preserve repository-subpath compatibility.
- Run `npm test` and `npm run build` before committing website changes. Do not commit generated `dist`, browser snapshots, or dependencies.
- Preserve explicit historical season labels and source attribution; do not present archived facts as live scores or a current roster.
- See [README.md](README.md) for architecture, content scope, local preview, and deployment instructions.
