# Hosting setup tutorial

## GitHub

In this tutorial, you will create a new GitHub repository to host your notes.

### Create a repo

1. Navigate to [github.com/new](https://github.com/new).
2. Given the repo a name.
3. Choose "Private". (Choose "Public" if you want to open-source all of your notes).
4. Leave other options as default. Click "Create repository".

### Create personal access token

1. Navigate to [github.com/settings/tokens/new](https://github.com/settings/tokens/new).
2. Give the token a name.
3. Check the `repo` checkbox. Its children should be auto selected.
4. Leave otgher options as default. Click "Generate token".
5. Copy and save the token somewhere safe. You will not see it again once you leave the page.

### Initialize the repo for knowledge capture

1. Open a GitHub a
2. Use <kbd>Ctrl</kbd>+<kbd>Space</kbd> to open command input. Type <kbd>ss</kbd> to open settings page.
3. Fill in `Owner` field with your GitHub username.
4. Fill in `Repo` field with the name of the repo you just created.
5. Select `HTTPS` as your Network protocol.
6. Fill in the personal access token you just created.
7. Click "Test" to make sure your credentials are correct.
8. Click "Save connection" to connect and initialize the repo.

## Other hosting options

1. If you want to use SSH protocol, you need to make sure the SSH private keys are available on the container. See [Storage setup guide](./storage-setup-guide#mount-a-directory-with-ssh-private-keys)
