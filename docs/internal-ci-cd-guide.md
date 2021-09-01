# To publish

## Update version
```sh
# In root package
npm version <major|minor|patch|prerelease> -w packages/server

# Git commit and push
```

## Tag and share to remote
```sh
# Auto pick up version from package.json
# In root package
npm run release

# OR, manually tag the version
# In root package
git tag v<major>.<minor>.<patch>-<alpha|beta>.<prerelease>
git push origin vX.Y.Z
```