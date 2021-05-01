# Gnome desktop
```desktop
#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Name=osmosnote
Comment=Run osmosnote as docker app
Exec=bash -c 'docker run -p 2077:6683 osmoscraft/osmosnote;$SHELL'
Terminal=true 
Type=Application
Categories=Application;
```