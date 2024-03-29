# v1.0.0-alpha.25

- Changed: Scroll position restore aligns to center

# v1.0.0-alpha.24

- Fixed: Line ends with url could not receive new line input
- Chore: Updated dependencies

# v1.0.0-alpha.23

- Added: Minimum required Node version in package.json
- Fixed: YouTube title extraction didn't work

# v1.0.0-alpha.21

- Added: <kbd>Alt</kbd> + <kbd>H</kbd>/<kbd>J</kbd>/<kbd>K</kbd>/<kbd>L</kbd> for 2D shifting
- Added: Search result ranker based on title match
- Added: Restore caret position on page reload
- Changed: Node 16 to 18 upgrade
- Changed: Replaced fs-extra with Node fs API
- Changed: Replaced axios with Node 18 native fetch API
- Fixed: URL was not case sensitive
- Chore: Replaced `npm-run-all` with `concurrenly` due to discontinued maintenance
- Chore: Updated dependencies

# v1.0.0-alpha.19

- Fixed: Bracket characters could not be enetered due to keymap conflict

# v1.0.0-alpha.17

- Fixed: BLock selection was broken by the new keyboard event handler

# v1.0.0-alpha.16

- Fixed: Block movement and indentation were broken by the new keyboard event handler

# v1.0.0-alpha.15

- Added: Support for xmodmap custom keyboard maps
- Fixed: Ctrl + Delete/Backspace movement was too aggressive at line boundary
- Chore: Updated dependencies

# v1.0.0-alpha.14

- Fixed: `-t` tag search shows no result until some tag string is typed in
- Fixed: rg v13.0.0 hangs on search
- Chore: Updated dependencies

# v1.0.0-alpha.13

- Fixed: `main` vs `master` branch name conflict when initializing from remote
- Chore: Updated dependencies

# v1.0.0-alpha.12

- Changed: Block travel now uses <kbd>Ctrl</kbd> + bracket keys instead of <kbd>Ctrl</kbd> + <kbd>Atl</kbd> + <kbd>J</kbd>/<kbd>K</kbd>

# v1.0.0-alpha.11

- Added: Support command bar vertical movement with <kbd>Ctrl</kbd> + <kbd>J</kbd> and <kbd>Ctrl</kbd> + <kbd>K</kbd>
- Added: Support vim-like editor movement
  - Arrow keys: <kbd>Ctrl</kbd> + <kbd>H</kbd>/<kbd>J</kbd>/<kbd>K</kbd>/<kbd>L</kbd>
  - <kbd>Ctrl</kbd> + <kbd>Shift</kbd> for selection
  - <kbd>Ctrl</kbd> + <kbd>Alt</kbd> for greater distance movement: word-wise for horizontal, block-wise for vertical. Combine with <kbd>Shift</kbd> for selection
  - <kbd>Alt</kbd> + <kbd>J</kbd>/<kbd>K</kbd>for moving lines
  - <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>J</kbd>/<kbd>K</kbd>for duplicating lines
- Chore: Updated dependencies
- Chore: Removed unused test package
- Chore: Updated Docker image to node 16

# v1.0.0-alpha.9

- Fixed: Case sensitive URLs were transformed to lowercase

# v1.0.0-alpha.8

- Added: Haiku language reference
- Added: Handle git setup in settings page
- Added: Basic documentation for public release
- Added: CI/CD automation for node.js and docker based publish
- Changed: Use `haiku` instead of `md` as file extension
- Changed: Alt + ,. for indent to avoid conflict with system input method
- Changed: Spellcheck is now disabled by default
- Changed: Favicon update.
- Changed: Switch to esbuild for production bundling
- Changed: Replaced config file with .git and docker-compose.yml.
- Changed: Replaced single executable with docker image and docker compose template

# v0.0.13

- Workflow: server side dependency checker
- Workflow: Check dependency and dump diagonostic info in console

# v0.0.12

- Workflow: Ctrl+S to save, Ctrl+Shift+S to save and sync
- Workflow: Update document title
- Workflow: Stop full page reload after save
- Workflow: Caret to last position when opening a new file
- Workflow: Remove tagging from default template. Add auto prefix insertion to tag insertion command
- Workflow: Cancel remote action after any keypress
- Workflow: Prompt for confirmation when deleting a note with references.
- Workflow: Display "New" as status when opening a new file.
- Workflow: Keyboard shortcut to indent/outdent section or list: ctrl + ,|.
  - Single line indent
  - All selected lines indent
- Workflow: Duplicate line up/down: alt + shift arrow up/down
- Workflow: Keyboard shortcut to shift selected lines up/down: alt + arrow up/down
- Workflow: Disable spellcheck on all the URLs
- Workflow: Sync without save (when the current file is deleted on the remote, sync & save will cause conflict).
- Workflow: When opening a separate client, syncing on landing page forces landing page to be saved.
- Workflow: Highlight selected line with full width background
- Workflow: Format without save
- Health: refactor history and change tracking: make runAtom auto update dirty state?
- Health: Refactored line-ending character and parsing logic
- Bug: Spellchecker cannot modify content (prevented by beforeinput handler).

# v0.0.11

- Bug: Disable browser built-in formatter: italic, underline, bold
- Bug: Clicking didn't sync the ideal column for vertical travel
- Bug: CJK input composed input triggers raw input handler
- IDE: auto list order (need format context to track current level and order)

# v0.0.10

- Compiler: mix link within list
- Compiler: Consider MVP list rendering (use multiple - without space)
- Compiler: Handle list indentation
- Compiler: DOM tags are being parsed. Need escape logic. (refer to prev. parser POC)
- IDE: Graceful handling of invalid ID
- IDE: Open and insert should use selection as default search query too.
- IDE: delete note is not merged with staged change.
- IDE: Auto create list marker on enter
- IDE: delete heading line will leave content below in clean state with wrong indentation
- IDE: Disable spellchecker on metadata
- IDE: Easy delete of notes
- IDE: Display tags in Reference panel
- IDE: Display Title AND Tag in seach result, with overflow handling e.g. This is the name of a note that... Tag1, Tag2, Tag3...
- IDE: Loading settings from local storage
- IDE: User settings service (communicate with local storage)
- IDE: Spell check toggle on/off
- IDE: ESC key to cancel selection
- Bug: Status bar could overflow into multiple lines
- Bug: open close command bar causes unwanted scroll
- Bug: Ctrl + s causes unwanted scroll
- Bug: url parser crash on `https://www.designmattersmedia.com/podcast/2010/Massimo-Vignelli` - No fix. It was a network issue
