1. Make sure nvm is properly exposing `npx` in login shell
   1. If launching via window manager's launcher, `.profile` should have nvm setup script.
1. Put content of the `app` folder somewhere in the system. Make sure the script is executable
1. Put the content of the `desktop` folder on the desktop
1. Adjust the `Exec` and `Icon` path in `osmosnote.desktop` to point to the content of the `app`
1. In Gnome, right click the `.desktop` and choose `Allow Launching`. Note, this is NOT the same as `chmod +x`.
