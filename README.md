# osmos::note

A web-based text editor for networked note-taking, self-hostable on any Git repository.

- Retrieve knowledge as fast as you can type with zero-latency full-text search.
- Make serendipitous discovery via backlink traversal.
- Durable knowledge preservation with plaintext and Git backend.
- Keyboard-centeric design protects your train of thought from disruptive mouse interactions.
- Web-based frontend easily customizable via JavaScript and CSS (coming soon).

## Get started

### Pre-requisite

1. Choose your operating system:
   - Linux: primary support
   - Windows: support via [Windows Subsystem for Linux (WLS)](https://docs.microsoft.com/en-us/windows/wsl/)
   - MacOS: should work. Not tested.
2. Install depedendencies
   - [ripgrep](https://github.com/BurntSushi/ripgrep): used for full-text search.
   - [xargs](https://man7.org/linux/man-pages/man1/xargs.1.html): used for search result parsing. Most linux distro comes with it.
   - [git](https://git-scm.com/): used for storage and version control. Most linux distro comes with it.
3. Create an empty Git repository for storing notes. For easy start, clone from the template.

### Install and run

1. Download the latest binary `osmosnote` from [releases](https://github.com/osmoscraft/osmosnote/releases)
2. Make the binary executable
   ```sh
   chmod +x ./osmosnote
   ```
3. Start the server
   ```sh
   ./osmosnote
   ```
4. Open frontend at https://localhost:2077. In the app, press <kbd>Ctrl</kbd>+<kbd>SPACE</kbd> to open command input.
5. settings > set git repository

### Next steps

- Create and save your first note.
- Tag and search.
- Learn how to perform common tasks.
- Learn Haiku, a plaintext language for knowledge keeping.

# Compare with other tools
