# Storage setup guide

## Basic setup

By default the app expects you to mount a repository to the `/<user>/.osmosnote/repo` path inside the container.
And the default user is `root`.

```sh
docker run -p 6683:6683 -v </absolute/path/to/dir>:/root/.osmosnote/repo osmoscraft/osmosnote
```

## Mount a directory with non-root user

If you want to use a non-root user to create and update the notes:

- You need to mount to a directory where the non-root user has permission to modify. e.g. `/data`
- You need to pass user information into the container, including `/etc/passwd` and `/etc/group`

```sh
docker run -p 6683:6683 \
 -e "OSMOSNOTE_REPO_DIR=/data" \
 -v </absolute/path/to/dir>:/data \
 -v /etc/passwd:/etc/passwd:ro \
 -v /etc/group:/etc/group:ro \
 -u 1000:1000 \
 osmoscraft/osmosnote
```

## Mount a directory with SSH private keys

If you want to connect to Git host using SSH instead of HTTPS protocol:

- You need to mount your the host machine's SSH private keys into the container, which is usually located in `/home/<username>/.ssh`.

```sh
docker run -p 6683:6683 \
 -e "OSMOSNOTE_REPO_DIR=/data" \
 -v /home/<username>/.ssh:/home/<username>/.ssh \
 -v </absolute/path/to/dir>:/data \
 -v /etc/passwd:/etc/passwd:ro \
 -v /etc/group:/etc/group:ro \
 -u 1000:1000 \
 osmoscraft/osmosnote
```

## Next steps

- Learn how to back up your notes from [Hosting setup guide](./hosting-setup-guide.md).
