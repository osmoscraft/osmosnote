# Alternative installations

## Node.js based

### Install dependencies

1. Choose your operating system:
   - Linux: primary support
   - Windows: support via [Windows Subsystem for Linux (WLS)](https://docs.microsoft.com/en-us/windows/wsl/)
   - MacOS: should work. Not tested.
2. Install depedendencies
   - [ripgrep](https://github.com/BurntSushi/ripgrep): used for full-text search.
     ```sh
     sudo sh -c "$(curl -fsSL https://raw.github.com/osmoscraft/osmosnote/master/packages/scripts/install.sh)"
     ```
     (Don't trust any shell script from the Internet. [Audit the source](https://github.com/osmoscraft/osmosnote/blob/master/packages/scripts/install.sh) before you run.)
   - [xargs](https://man7.org/linux/man-pages/man1/xargs.1.html): used for search result parsing. Most linux distro comes with it.
   - [git](https://git-scm.com/): 2.28.0 minimum. used for storage and version control. Most linux distro comes with it.
3. Create an empty Git repository for storing notes. For easy start, clone from the template.

### Run

```sh
npx @osmoscraft/osmosnote
```


