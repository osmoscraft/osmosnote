# WSL setup

- Make sure the repo has proper git permissions. If your org has 2FA, make sure you can access the repo from WSL, not from Windows. This might mean you have you clone it from the SSH remote url, instead of HTTPS.

- Known network performance issue

## WSL setup

- In a Windows directory, create a vbs script that launches the server in WSL (See wsl launcher pacakge)
- Create a shortcut to wscript.exe, in the target field, use `C:\Windows\System32\wscript.exe "PATH_TO_THE_VBS_SCRIPT"`.

### WLS network issue

- Device manager > Network adapters > Hyber-V Virtual Ethernet Adapter > Large Send Offload Version 2 > Set it to "Disabled"
