# Repository change policy

## Git and remote operations

- Keep all code and asset changes local by default.
- Do not run `git add`, `git commit`, `git push`, `git pull`, merge, rebase, force-push, remote configuration, or any other Git operation that changes local history or remote state unless the user explicitly requests that exact operation in their current message.
- A previous request to connect a repository or push a commit is not standing permission for later commits or pushes.
- If the user asks for implementation only, make the requested local changes and report them without staging, committing, or pushing.
- Before any user-requested destructive Git operation, state the target and confirm its scope.

## Asset changes

- Preserve user-provided source assets unless the user explicitly asks to replace or delete them.
