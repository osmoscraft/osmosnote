# Roadmap

## TextEngine MVP

- TODO
  - Handle cursor restore after global formatting
    - parse() OK to lose cursor. The caller of parse is responsible to set cursor after parse
    - format() must restore curosr
      - save the line that contains cursor, when updating indent, if cursor within padding, no move, if cursor after padding, shift cursor accordingly
  - Handle ctrl + a to select all
  - Handle ctrl + delete/backspace
  - Handle copy/paste/cut
  - Handle cut entire line when cursor is collapsed
- DONE
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

## IDE MVP

- TODO
  - Save to disk
  - Insert note
  - Capture new
  - Capture from bookmarklet

## Saner dev MVP

- TODO
  - Test (need real dom: playwright/cypress)
    - How to mock dom measure?
    - Port testing helpers to browser

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
