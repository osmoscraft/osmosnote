# Dependencies

- ripgrep: fast full text search
- xargs: format rg output to be piped back to itself
  - Can be removed if we use javascript process i/o instead of bash pipe
- git

# WSL setup

- Make sure the repo has proper git permissions. If your org has 2FA, make sure you can access the repo from WSL, not from Windows. This might mean you have you clone it from the SSH remote url, instead of HTTPS.

# To test production output

1. `cd` to package root.
2. `npm run build`
3. `npm run pack`

# To release

1. `cd` to package root.
2. `npm version patch|minor|major`
3. `npm run release`
4. Github Action will build and create a draft release

# Manual

## Launch with keyboard shortcut

- PC: recommend ahk

## Native context menu

- Use Shift + F10 in PC to trigger browser built-in context menu

## Clipboard

- Without secure HTTPS origin, clipboard API won't work. You can use either localhost or use a real SSL certificate.

## Tagging

- Tags are case sensitive. However, during the search, tags are case insentivie to encourage spontaneous discovery

## WSL setup

- In a Windows directory, create a vbs script that launches the server in WSL (See wsl launcher pacakge)
- Create a shortcut to wscript.exe, in the target field, use `C:\Windows\System32\wscript.exe "PATH_TO_THE_VBS_SCRIPT"`.

### WLS network issue

- Device manager > Network adapters > Hyber-V Virtual Ethernet Adapter > Large Send Offload Version 2 > Set it to "Disabled"
