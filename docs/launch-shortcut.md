# Linux

## gnome desktop launcher

Create the file `s2.desktop` in `~/.local/share/applications` with the content below

```desktop
#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Name=osmosnote
Comment=Run osmosnote as docker app
Exec=<path/to/osmosnote-laucher.sh>
Terminal=true 
Type=Application
Categories=Application;
```

## docker launch script
```sh
#!/bin/sh
docker run -p 6683:6683 \
 -e "OSMOSNOTE_REPO_DIR=/data" \
 -v /home/<username>/.ssh:/home/<username>/.ssh \
 -v <path/to/repo>:/data \
 -v /etc/passwd:/etc/passwd:ro \
 -v /etc/group:/etc/group:ro \
 -u 1000:1000 \
 osmoscraft/osmosnote
```

## node.js launch script
```sh
#!/bin/sh
export OSMOSNOTE_REPO_DIR=<path/to/repo>
export OSMOSNOTE_SERVER_PORT=6683
npx @osmoscraft/osmosnote
```
