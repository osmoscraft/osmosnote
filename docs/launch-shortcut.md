# Gnome desktop
```desktop
#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Name=osmosnote
Comment=Run osmosnote as docker app
Exec=<path/to/osmosnote-docker.sh>
Terminal=true 
Type=Application
Categories=Application;
```

```sh
#!/bin/sh
docker run -p 2077:6683 \
 -e "OSMOSNOTE_REPO_DIR=/data" \
 -v /home/<username>/.ssh:/home/<username>/.ssh \
 -v <path/to/repo>:/data \
 -v /etc/passwd:/etc/passwd:ro \
 -v /etc/group:/etc/group:ro \
 -u 1000:1000 \
 osmoscraft/osmosnote
```