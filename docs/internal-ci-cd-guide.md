# To publish

## Update version
```sh
# In server package
npm version <major|minor|patch|prerelease>
```

## Tag a commit
```sh
# In root package
git tag v<major>.<minor>.<patch>-<alpha|beta>.<prerelease>
```

## Share the tag to remote
```sh
git push origin vX.Y.Z
```