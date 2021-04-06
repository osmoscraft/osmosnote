' Reference: https://www.vbsedit.com/html/6f28899c-d653-4555-8a59-49640b0e32ea.asp
' To run in hidden mode, change last line to:
' oShell.Run strArgs, 0, false
Set oShell = CreateObject ("Wscript.Shell")
Dim strArgs
strArgs = "wsl bash -c '~/repos/project-platojar/system-two/packages/server/bin/s2'"
oShell.Run strArgs, 1, false