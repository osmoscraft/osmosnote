# To test production output

1. `cd` to package root.
2. `npm run build`
3. `npm run pack`

# To release

1. `cd` to package root.
2. `npm version patch|minor|major`
3. `npm run release`
4. Github Action will build and create a draft release
