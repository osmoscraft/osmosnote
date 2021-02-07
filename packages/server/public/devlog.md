# Roadmap

## TextEngine MVP

- TODO
  - Incremental formatting
    - parse() that add syntax hightlight and calculate semantic levels
    - format() that updates padding using semantics levels
    - on edit, parse() changed lines, format() all
  - Handle cursor restore after global formatting
    - parse() OK to lose cursor. The caller of parse is responsible to set cursor after parse
    - format() must restore curosr
      - save the line that contains cursor, when updating indent, if cursor within padding, no move, if cursor after padding, shift cursor accordingly
  - Handle ctrl + arrow for word move
  - Handle ctrl + shift + arrow for word select
  - Handle ctrl + a to select all
  - Handle home/end move and selection
  - Handle copy/paste/cut
  - Handle cut entire line when cursor is collapsed
- DONE
  - Render current line with highlight
  - Handle shift + arrow for selection
  - Handle `Delete`/`Backspace` keydown
  - Handle select left/right
  - Handle `Enter` keydown
    - Cursor action: open link
      - open absolute url
      - open note by id
    - Handle insert new line

## Saner dev MVP

- TODO
  - Test (need real dom: playwright/cypress)
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
