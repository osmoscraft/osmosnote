# osmos::note

A web-based text editor for networked note-taking, self-hostable on any Git repository.

- Retrieve knowledge as fast as you can type with zero-latency full-text search.
- Make serendipitous discovery via backlink traversal.
- Durable knowledge preservation with plaintext and Git backend.
- Keyboard-centeric design protects your train of thought from disruptive mouse interactions.
- Web-based frontend easily customizable via JavaScript and CSS (coming soon).

## Get started

Run the demo in a container. Note that you won't be able to persist any data after you exit the container.

```sh
docker run -p 6683:6683 osmoscraft/osmosnote
```

The app will be live at http://localhost:6683

To exit

```sh
docker ps
# Find your <container_id> in the output

docker kill <container_id>
```

## Next steps

1. Follow the tutorial to capture your first note.
2. Learn [Haiku](docs/haiku-language-reference.md), a simple language for knowledge capture.

## Advanced guides

1. Capture knowledge with browser bookmarklet.
2. Connect to GitHub with with SSH
3. [Alternative installations](docs/alternative-installations.md)

## Roadmap

- Theming
- Extensibility

## Compare with other tools
