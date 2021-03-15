# Dependencies

- ripgrep: fast full text search
- xargs: format rg output to be piped back to itself
  - Can be removed if we use javascript process i/o instead of bash pipe
- git

# WSL setup

- Make sure the repo has proper git permissions. If your org has 2FA, make sure you can access the repo from WSL, not from Windows. This might mean you have you clone it from the SSH remote url, instead of HTTPS.

# To release

1. `cd` to package root.
1. `npm version patch|minor|major`
1. `npm run build`
1. `npm run pack`
1. `npm run release`
1. Github Action will build and create a draft release

# Manual

## Tagging

- Tags are case sensitive. However, during the search, tags are case insentivie to encourage spontaneous discovery
