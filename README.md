# osmos::note

A web-based text editor for networked note-taking, self-hostable on any Git repository.

- Retrieve knowledge as fast as you can type with zero-latency full-text search.
- Make serendipitous discovery via backlink traversal.
- Durable knowledge preservation with plaintext and Git backend.
- Efficient navigation and command powered by keyboard-centeric interaction design.
- Easy theming and customziation with JavaScript and CSS (coming soon).

## Get started

### Install Docker

### Run the app

```sh
docker run -p 6683:6683 osmoscraft/osmosnote
```

You can open the app in your browser, at http://localhost:6683

### Clean up

```sh
docker ps
# Find your <container_id> in the output

docker kill <container_id>
```

### Next steps

When running from the container, you won't be able to persist any content once the container exits. Follow the [Storage setup guide](docs/storage-setup-guide.md) to persist your notes.

## Guides and references

1. [Storage setup guide](docs/storage-setup-guide.md)
2. [Git hosting setup guide](docs/hosting-setup-guide.md).
3. [Editor reference](docs/editor-reference.md).
4. [Haiku language reference](docs/haiku-language-reference.md).

## Supported browser

- Chrome, Firefox are primary support targets.
- Safari should work in theory. There is no guarantee.
