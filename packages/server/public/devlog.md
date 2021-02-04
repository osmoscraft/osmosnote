- TODO
  - Handle dirty marking and incremental parsing
  - Handle `Enter` keydown
    - Cursor action: open link
      - open absolute url
      - open note by id
    - Handle insert new line
  - Handle `Delete`/`Backspace` keydown
    - Handle cursor restore after global formatting
  - Render current line with highlight
- DONE
  - Handle select left/right

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
