# Navigation

- Use keyboard arrow keys to move around.
- Use <kbd>Ctrl</kbd>+<kbd>ArrowLeft</kbd> and <kbd>Ctrl</kbd>+<kbd>ArrowRight</kbd> to move by words.
- Use <kbd>Home</kbd> and <kbd>End</kbd> to move to line start and line end.
- Use <kbd>PageUp</kbd>/</kbd>PageDown</kbd> to jump by blocks.
- When opening a different note, you can use browser Back/Forward to navigate. By default, <kbd>Alt</kbd>+<kbd>ArrowLeft</kbd> goes back. <kbd>Alt</kbd>+<kbd>ArrowRight</kbd> goes forward. It may differ for each browser.
- When you place cursor inside numbers portion of a link, use <kbd>Enter</kbd> to open the link.

# Using command bar

- Use <kbd>Ctrl</kbd>+<kbd>Space</kbd> to open command bar. You can type the character in bracket to select/active an item.

# Editing

## Text manipulation

- Use <kbd>Alt</kbd>+<kbd>ArrowUp</kbd> and <kbd>Alt</kbd>+<kbd>ArrowDown</kbd> to move a line.
- Use <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>ArrowUp</kbd> and <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>ArrowDown</kbd> to duplicate a line.
- Use <kbd>Alt</kbd>+<kbd>,</kbd> and <kbd>Alt</kbd>+<kbd>.</kbd> to decrease/increase indentation.

# Knowledge capture

## Create a new note

### Create by title

1. Use <kbd>Ctrl</kbd>+<kbd>o</kbd> (a shortcut for <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>o</kbd>) to open command input.
2. Type in the name of note.
3. Press <kbd>Enter</kbd> to confirm.

### Create by url capture

1. Use <kbd>Ctrl</kbd>+<kbd>o</kbd> to open command input.
2. Paste the url you want to capture.
3. Press <kbd>Enter</kbd> to confirm.

## Search existing notes

### Full text search

1. Use <kbd>Ctrl</kbd>+<kbd>o</kbd> to open command input.
2. Type in search query.
3. Use <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> to select result.
4. Press <kbd>Enter</kbd> to confirm. If you don't select any result, a new note will be created with your query as the title.

### Tag search

1. Use <kbd>Ctrl</kbd>+<kbd>o</kbd> to open command input.
2. Type in your text query, followed by `-t`, then tags. The combined query looks like: `<text_query> -t <tag1>, <tag2>, <tag3>`.
3. Use <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> to select result.
4. Press <kbd>Enter</kbd> to confirm. If you don't select any result, a new note will be created with your query as the title.

## Link to a note

### Add link to selected text

1. Select text (<kbd>Shift</kbd>+Arrow keys)
2. Use <kbd>Ctrl</kbd>+<kbd>k</kbd> (Shortcut for <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>k</kbd>) to open command input.
3. Type in your query to search notes.
4. Use <kbd>ArrowUp</kbd> and <kbd>ArrowDown</kbd> to select result.
5. Press <kbd>Enter</kbd> to confirm.
6. If you don't select any result and press <kbd>Enter</kbd>, you will to taken to create a new note.
   1. Edit the new note. Press <kbd>Enter</kbd> to save. You may close the newly saved note.
   2. The previous note will automatically link to the newly created note. Remember to save it as well.

### Replace selected text with the title of a note and link to it

1. Select text.
2. Use <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>i</kbd> to open command input.
3. Same steps as above.

## Add tags

1. Move the caret to the metadata line that starts with #+tags:
2. Place the caret as the end of line
3. Use <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>t</kbd> to open command input.
4. Type in tag name.
5. Select a search result or add a new tag.
6. After adding one tag, the command input will re-open so you can quickly add more tags.
7. When you finished add all tags, press <kbd>Escape</kbd> to exit command input.

# Chores

## Version management

### Save file locally

- Use <kbd>Ctrl</kbd>+s (shortcut for <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>fs</kbd>) to save the file you are editing.

### Sync with remote

- Note this won't work until you configured Git hosting.
- Use <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>s</kbd> (shortcut for <kbd>Ctrl</kbd>+<kbd>Space</kbd>, <kbd>fa</kbd>) to save the file and sync all files.

## Undo, redo

- Use <kbd>Ctrl</kbd>+<kbd>z</kbd> to undo.
- Use <kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>z</kbd> to redo.

## Find on page

- Use the browser find on page (<kbd>Ctrl</kbd>+<kbd>F</kbd>) feature.
  -- Use <kbd>Escape</kbd> key to exit find on page mode. Your caret should select the matching words.
