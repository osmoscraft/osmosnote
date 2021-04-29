# Roadmap

## Working on: 1st alpha release

- Documentation
  - Project principles
    - Connected notes
  - Check credits and licenses
  - Future roadmap (e.g. theming, extension, markdown mode, org mode, vim mode)
  - Quick start
    - Docker run mode
  - Docker compose mode
    - Recipes
  - Node.js + dependencies mode
  - Known issues
  - Compare to other software (notion, org-roam, etc)
- Demo content
  - Make self documenting tutorial available in docker run
  - GIF capture of key features
    - Command bar
    - Back linking
    - Instant search
    - Tagging
    - List formatting
    - Heading formatting
- Logistics
  - Share roadmap on GitHub project
  - Share backlog on GitHub project
  - Bug issue templates

## Bug backlog

- Bug: List movement is broken in 202104122000878
- Bug: CJK input doesn't work on blank lines: consider using `<br>` for empty line
- Bug: emoji (and other unicode characters) got split in caret movement. Consider using default arrow key handling.
- Bug: Chinese character causes line height to jump.
- Bug: Ctrl + c can't access clipboard in http mode. (legacy copy command causes focus lost)
- Bug: scrollbar has no hover effect and a wrong cursor style
- Bug: when spellcheck auto-fix, even type `insertReplacementText` won't trigger dirty state

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

- Node package: ship a bin file and support `npx @osmoscraft/osmosnote`.
- Workflow: Use single console logger with color, symbol, and verbosity control
- Workflow: Fully preserver selection state after formatting
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
- Consider support shortcut to insert current time or date
- Use History Service to track every keypress and use debouncer to improve performance
- Customizable home page with blocks of queries
- Note refactoring system: rename title, delete
- Display per line dirty status in gutter
- Add demo repo content to template repo
- Backtick inline code snippet
- Tag suggestion based on content
- Link suggestion based on tags
- After navigation back, scroll position is lost
- Validate metadata on-save
- alt + shift + arrow to increase/decrease selection scope: word, line, section, all
- Unicode: emoji takes two arrow presses to skip over
- Unicode: backspace on emoji splits the unicode
- Unicode: when line is empty, typing with IME breaks line ending

## Compiler

- Core: Use real anchor to represent links for improved a11y. Need to disable focus.
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
- Use mutation observer to handle line update AFTER user enters the data. Only intercept events that could cause the line dom to change. Ref: https://medium.engineering/why-contenteditable-is-terrible-122d8a40e480

## Overarching issues

- Difficult to decide between A link to B or B link to A.

## Project North star

- CJK support (need pixel based column calc or unicode char visual length detection)
- Display local menu next to caret
- Live compiling for loading typescript extensions
- Visualized graph traveling (node <-> link <-> node)
- Eliminate manual linking via proximity detection and NLP pattern detection
