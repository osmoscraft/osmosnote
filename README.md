# Dependencies

- ripgrep: fast full text search
- xargs: format rg output to be piped back to itself
  - Can be removed if we use javascript process i/o instead of bash pipe
- git

# WSL setup

- Make sure the repo has proper git permissions. If your org has 2FA, make sure you can access the repo from WSL, not from Windows. This might mean you have you clone it from the SSH remote url, instead of HTTPS.

# To release

1. `npm version patch|minor|major`
2. `npm run release`
3. Github Action will build and create a draft release
