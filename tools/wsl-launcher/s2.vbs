Set oShell = CreateObject ("Wscript.Shell")
Dim strArgs
strArgs = "wsl bash -c '~/repos/project-platojar/system-two/packages/server/bin/s2-linux'"
oShell.Run strArgs, 1, false