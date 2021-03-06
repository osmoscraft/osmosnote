# Roadmap

## IDE MVP

- TODO
  - Convert selection to note
    - On empty state
      - Search with selected phrase
      - Also show recently changed notes
    - Once typing
      - Search with typed phrase
    - On select: keep the selection the same, only update link
      - need text editor api for convert text to link
  - Add file save / format commands
  - Ctrl + S should trigger command (instead of run directly)
  - Check version on launch
  - Ctrl + k to insert link
  - Click to open link in current window
  - Ctrl + Click to open link in new window
  - Empty line cursor missing

---

- DONE
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

## Bootstrap system

- PEND
  - Convert selection to new note
- TODO
  - Migrate all org-roam notes
  - Migrate all markdown notes
- DONE
  - Note id system
  - Timestamp in metadata

## Bugs

- Cancel remote action after cursor move
- new node shown as dirty but doesn't prompt before window close
- Status bar could overflow into multiple lines
- URL search needs debouncer. Invalid url blocks UI

## Technical debt MVP

- TODO
  - Move all filename to id conversion to server side
  - Test (need real dom: playwright/cypress)
    - How to mock dom measure?
    - Port testing helpers to browser
  - Refactor command menu directives:
    - Open url and insert on save should be refactored into two directives:
      - data-url (string) and data-action ("open"|"insert-on-save")
  - Refactor history and change tracking: should runAtom auto update dirty state?

## IDE V2

- Display Title AND Tag in seach result, with overflow handling e.g. This is the name of a note that... Tag1, Tag2, Tag3...
- Consider support shortcut to insert current time (northstar?)
- Use History Service to track every keypress and use debouncer to improve performance
- Consider consolidating change tracking service with history service (caret state is an outlier)

## TextEngine V2

- TODO
  - Handle list indentation
  - Handle list auto numbering
  - Move # into the padding so heading lines can wrap without breaking indentation
  - Simplied internal API
    - Efficiently convert DOM layer node and offset into plaintext layer offset
    - Incrementally read more lines while in plaintext layer
    - Efficiently convert plaintext layer offset into DOM layer node and offset

## Open source v1

- TODO
  - First run: config repo
  - Handle delete note (auto refactor?)
  - Init repo with demo content

## Projectg North star

- CJK support (need pixel based column calc or unicode char visual length detection)
- Display local menu next to caret

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

## TextEngine MVP

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
