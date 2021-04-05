# Roadmap

## Working on

- Workflow: On start: check config file and config values
- Workflow: On start dependency validator
  - Check dependency and dump diagonostic info in console
    - localstorage api
    - clipboard api
    - custom elements api
    - xargs
    - ripgrep
- Workflow: A landing state (recent + open new).
- Workflow: Display "New" as status when opening a new file.
- Workflow: Prompt for confirmation when deleting a note with references.
- Workflow: Cancel remote action after cursor move
- Workflow: Keyboard shortcut to indent/outdent section or list: ctrl + ,|.
- Workflow: Show app version
- Health: refactor history and change tracking: make runAtom auto update dirty state?
- Core: Use real anchor to represent links for improved a11y. Need to disable focus.

v0.0.12 release candidate:

- Workflow: Duplicate line up/down: alt + shift arrow up/down
- Workflow: Keyboard shortcut to shift selected lines up/down: alt + arrow up/down
- Workflow: Disable spellcheck on all the URLs
- Workflow: Sync without save (when the current file is deleted on the remote, sync & save will cause conflict).
- Workflow: When opening a separate client, syncing on landing page forces landing page to be saved.
- Workflow: Highlight selected line with full width background
- Workflow: Format without save
- Health: Refactored line-ending character and parsing logic

## Bug backlog

- Bug: CJK input doesn't work on blank lines
- Bug: Chinese character causes line height to jump.
- Bug: Ctrl + c can't access clipboard in http mode. (legacy copy command causes focus lost)
- Bug: scrollbar has no hover effect and a wrong cursor style
- Bug: emoji (and other unicode characters) got split in caret movement.

## Code health

- Parser testing
- Test (need real dom: playwright/cypress)
  - How to mock dom measure?
- Refactor command menu directives:
  - Port testing helpers to browser
  - Open url and insert on save should be refactored into two directives:
    - data-url (string) and data-action ("open"|"insert-on-save")
- How does command bar and keyboard shortcut share code?
  - Command bar should own its own keyboard shortcut service.
  - Input service should focus on handling text editing inputs, not command.
- Refactor git utilities. They are a mess
- Redesign and refactor core API to improve scalability

## Workflow

- First-run: Handle git setup (validate client version. validate local repo. validate remote. validate credentials.)
- List auto indent fixing
- UI managed metadata entry
  - Design interaction pattern
- Push git step status to client from server
- Search ranking algorithm is way off. Need to improve accuracy for literal match.
- IDE: a deleted note should be marked as "Deleted" in status
- Consider using orange border to indicate dirty document
- A fraction of delay after entering any command that waits for server.
- URL search needs debouncer. Invalid url blocks UI
- Strong need to curate a list based on tags
- Consider support shortcut to insert current time (northstar?)
- Use History Service to track every keypress and use debouncer to improve performance
- Customizable home page with blocks of queries
- Note refactoring system: rename title, delete
- Display per line dirty status in gutter
- First run: config repo
  - Init repo with demo content
- Support default "Triage" tag (any alternatives?)
- Backtick inline code snippet
- Quick insert of ISO local date could help
- Tag suggestion based on content
- Link suggestion based on tags
- After navigation back, scroll position is lost
- IDE: improve cursor restore after formatting: for list item marker update, cursor may be shifted after formatting
- Multiple workspaces (with crosss workspace search?)
- Validate metadata on-save
- It's very easy to open the same doc twice and saving the older one will overwrite the new one.
- First-run: Consumer packaging: Investigate docker?
- Auto-update binaries?
- alt + shift + arrow to increase/decrease selection scope: word, line, section, all

## Compiler

- Control + left seems to greedy when to prev. line
- Ctrl + delete is too agressive when handling white spaces
- Heading and list item themselves cannot wrap with multi-row indent.
  - Move # into the padding so heading lines can wrap without breaking indentation
- Simplied internal API
  - Efficiently convert DOM layer node and offset into plaintext layer offset
  - Incrementally read more lines while in plaintext layer
  - Efficiently convert plaintext layer offset into DOM layer node and offset
- Embedded virtual blocks
  - Query block
- Read-only query-driven notes
- CJK compatibility mode: avoid visual travel
- codify block quote symbol ">"
- Compiler: Require space after link
  - When line ends with link, insert a new line at the end causes link to open
  - When document ends with link, you can't add a new line without adding a space after the last link
- Core: Experiment: zero width space as line-end in UI while keeping `\n` in source. (Failed due to select indiciator becoming invisible on zero width space).

## Overarching issues

- Difficult to decide between A link to B or B link to A.

## Project North star

- CJK support (need pixel based column calc or unicode char visual length detection)
- Display local menu next to caret
- Live compiling for loading typescript extensions
- Visualized graph traveling (node <-> link <-> node)
- Eliminate manual linking via proximity detection and NLP pattern detection
