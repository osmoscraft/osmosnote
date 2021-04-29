# Alternative installations

## Node.js based

### Install dependencies

1. Choose your operating system:
   - Linux: primary support
   - Windows: support via [Windows Subsystem for Linux (WLS)](https://docs.microsoft.com/en-us/windows/wsl/)
   - MacOS: should work. Not tested.
2. Install depedendencies
   - [ripgrep](https://github.com/BurntSushi/ripgrep): used for full-text search.
   - [xargs](https://man7.org/linux/man-pages/man1/xargs.1.html): used for search result parsing. Most linux distro comes with it.
   - [git](https://git-scm.com/): 2.28.0 minimum. used for storage and version control. Most linux distro comes with it.
3. Create an empty Git repository for storing notes. For easy start, clone from the template.

### Install node package

TODO: This seciont is out-of-date

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
