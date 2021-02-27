# Roadmap

## IDE MVP

- TODO
  - Search and insert
    - Window bridge
  - Handle tag search
  - Fix editor focus restore issue
    - encapsulate logic in editor component. Use "focus" and "blur" as trigger
  - Sync mouse click to cursor location
  - Use fixed digit ISO timestamp
  - Consider support local timezone offset in ISO output
  - Consider support shortcut to insert current time (northstar?)
  - Handle unsaved changes
    - Track change dirty state
    - Indicate unsaved changes in tab and/or status bar

---

- DONE
  - Compress timestamp to 8 digit with a-z0-9 and epoch time with ms precision
    - Why not sequential id?
  - Add createdOn timestamp metadata field
  - Capture new
  - Capture from bookmarklet
  - Search and open
  - Open backlinks
  - Save to disk
    - Serialization

## Bootstrap system

- PEND
  - Convert selection to new note
  - Note id system
  - Timestamp in metadata
- TODO
  - Migrate all org-roam notes
  - Migrate all markdown notes

## Technical debt MVP

- TODO
  - Move all filename to id conversion to server side
  - Test (need real dom: playwright/cypress)
    - How to mock dom measure?
    - Port testing helpers to browser

## IDE V2

- Assisted tag insertion

## TextEngine V2

- TODO
  - Handle list indentation
  - Handle list auto numbering
  - Move # into the padding so heading lines can wrap without breaking indentation

## TextEngine North star

- CJK support (need pixel based column calc or unicode char visual length detection)

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
