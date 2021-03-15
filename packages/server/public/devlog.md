# Roadmap

## Bootstrap system

- Design knowledge architecture
- Migrate high-value one-note notes
  - All past readings
  - Project incubator
- DONE
  - Migrate all org-roam notes
  - Migrate all azure devops notes
  - Migrate all markdown life notes
  - Convert selection to new note
  - Note id system
  - Timestamp in metadata

## Code health

- TODO
  - Move all filename to id conversion to server side
  - Test (need real dom: playwright/cypress)
    - How to mock dom measure?
    - Port testing helpers to browser
  - Refactor command menu directives:
    - Open url and insert on save should be refactored into two directives:
      - data-url (string) and data-action ("open"|"insert-on-save")
  - Refactor history and change tracking: should runAtom auto update dirty state?
  - How does comand bar and keyboard shortcut share code?
    - Command bar should own its own keyboard shortcut service.
    - Input service should focus on handling text editing inputs, not command.
  - Refactor git utilities. They are a mess

## IDE V2

- Consider combine save and sync. I forget to sync often.
- Search ranking algorithm is way off. Need to improve accuracy for literal match.
- Spell check toggle on/off
- ESC key to cancel selection
- Display "New" as status when opening a new file.
- A fraction of delay after entering any command that waits for server.
- URL search needs debouncer. Invalid url blocks UI
- Strong need to curate a list based on tags
- Display Title AND Tag in seach result, with overflow handling e.g. This is the name of a note that... Tag1, Tag2, Tag3...
- Consider support shortcut to insert current time (northstar?)
- Use History Service to track every keypress and use debouncer to improve performance
- Consider consolidating change tracking service with history service (caret state is an outlier) (track change and runAtomic are always together)
- Ctrl + k to insert link
- Add file format without save command
- Customizable home page with blocks of queries
- Note refactoring system: rename title, delete
- Display per line dirty status in gutter
- First run: config repo
  - Init repo with demo content
- On start:
  - Check dependency and dump diagonostic info in console
  - Check config file and config values
- Chinese character causes line height to jump.
- When line ends with link, insert a new line at the end causes link to open
- Support default "Triage" tag (any alternatives?)
- After navigation back, scroll position is lost
- Quick insert of ISO local date could help
- It's very easy to open the same doc twice and saving the older one will overwrite the new one.
- Cancel remote action after cursor move
- Status bar could overflow into multiple lines

- DONE
  - Click to open link in current window
  - Ctrl + Click to open link in new window

## TextEngine V2

- DOM tags are being parsed. Need escape logic. (refer to prev. parser POC)
- Consider using web components to encapsulate links (and other text editor elements). Otherwise mouse click is not accessible.
- Control + left seems to greedy when to prev. line
- Ctrl + delete is too agressive when handling white spaces
- Consider MVP list rendering (use multiple - without space)
- Handle list indentation
- Handle list auto numbering
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

## Projectg North star

- CJK support (need pixel based column calc or unicode char visual length detection)
- Display local menu next to caret
- Live compiling for loading typescript extensions

# Principles

- All the characters map 1:1 between DOM and source
  - New line character must be literal too: "\n"
  - Every line MUST end with "\n"
- DOM is the source of truth
  - Avoid models
  - Avoid additional states (except for ones that are not stored in DOM, e.g. ideal column)
- Lazy evaluation
  - When moving, treat current state of the DOM as the starting point.
  - Must be efficient at DOM traversal/query/update
- Multi-views on the same data
  - Plain text view: use for pattern match, offset positioning
  - DOM view: use for manipulation

# Ref

Map mouse click to cursor position: https://stackoverflow.com/questions/45332637/how-to-get-character-position-when-click-on-text-in-javascript/45333785

# Archive

## Alpha test findings

- DONE
  - Delete and Backspace are not tracked in history
  - Git sync should save first
  - Support markdown syntax for external link: because highlighted URL is too jarring.
  - Support headless commands (keyboard shortcut without opening command bar, ala ^s for save).
  - `[link one] [link two](xxxx)` triggers styling on first bracket
  - (Won't fix. It's legally a URL)Comma after a url is included into the URL
  - After creating new note, back button opens draft page again
  - Blank draft should be clean
  - Browser built-in search cannot change focus
  - (Won't fix. ripgrep regex engine does not support equivalence class)"Gödel" cannot be searched with "Godel"
  - Smooth scroll is dizzy. Replace with instant snap.
  - Tag lookup should be case insensitive
  - When creating new note from selection, if input is left blank, the new draft should use selection as title
  - Deleted local file is not displayed in status bar
  - Couldn't render two links on the same line

## IDE V1

- DONE
  - Fix: focus transition between command bar and edit cause scroll reset
  - Empty line cursor missing
  - Add file save command
  - Check version on launch
  - Convert selection to note
    - On empty state
      - Search with selected phrase
      - Also show recently changed notes
    - Once typing
      - Search with typed phrase
    - On select: keep the selection the same, only update link
      - need text editor api for convert text to link
  - Capture by URL
  - Handle unsaved changes
    - Track change dirty state
    - Indicate unsaved changes in tab and/or status bar
  - Use fixed digit ISO timestamp
  - Consider support local timezone offset in ISO output
  - Maintain comma separated list when inserting tags
  - Handle tag sugges recent
  - Handle tag lookup
  - Handle tag search
  - Search and insert
    - Window bridge
  - Sync mouse click to cursor location
  - Fix editor focus restore issue
    - encapsulate logic in editor component. Use "focus" and "blur" as trigger
  - Compress timestamp to 8 digit with a-z0-9 and epoch time with ms precision
    - Why not sequential id?
  - Add createdOn timestamp metadata field
  - Capture new
  - Capture from bookmarklet
  - Search and open
  - Open backlinks
  - Save to disk
    - Serialization
  - Fix: Ctrl + right arrow fail on empty line
  - Fix: editor body vertical overflow push command bar out
  - Fix: command dropdown vertical overflow issues

## TextEngine V1

- Handle Undo/redo
- Apply smart indent when inserting a new line
- Handle copy/paste/cut
- Handle cut entire line when cursor is collapsed
- Handle ctrl + a to select all
- Handle ctrl + delete/backspace
  - Compose cursor select word end/start with cursor delete selection
- Handle cursor edit in selection mode
  - Insertion = delete selection + insertion
  - Deletion = delete selection only
- Handle cursor restore after global formatting
  - parse() OK to lose cursor. The caller of parse is responsible to set cursor after parse
  - format() must restore curosr
    - save the line that contains cursor, when updating indent, if cursor within padding, no move, if cursor after padding, shift cursor accordingly
- Incremental formatting
  - parse() that add syntax hightlight and calculate semantic levels
  - format() that updates padding using semantics levels
  - on edit, parse() changed lines, format() all
- Use keydown to handle non-input events (Open, cursor movement)
- Use beforeinput to handle input events (research into "data" field for IME compatibility)
- Scroll cursor into view
- Handle paragraph movement (default bind to PgUp/PgDown)
- Handle home/end move and selection
- Handle ctrl + arrow for word move
- Handle ctrl + shift + arrow for word select
- Render current line with highlight
- Handle shift + arrow for selection
- Handle `Delete`/`Backspace` keydown
- Handle select left/right
- Handle `Enter` keydown
  - Cursor action: open link
    - open absolute url
    - open note by id
  - Handle insert new line
