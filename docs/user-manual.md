# Navigation

- Use keyboard arrow keys to move around.
- Use Ctrl + ArrowLeft and Ctrl + ArrowRight to move by words.
- Use Home and End to move to line start and line end.
- Use PageUp/PageDown to jump by blocks.
- When opening a different note, you can use browser Back/Forward to navigate. By default, Alt + ArrowLeft goes back. Alt + ArrowRight goes forward. It may differ for each browser.
- When you place cursor inside numbers portion of a link, use Enter to open the link. Try it.

# Using command bar

- Use Ctrl + Space to open command bar. You can type the character in bracket to select/active an item. See if you can save this file with Ctrl + Space, "f", "s"

# Editing

## Text manipulation

- Use Alt + ArrowUp and Alt + ArrowDown to move a line. See if you can swap this line with the one below with Alt + ArrowDown.
- Use Alt + Shift + ArrowUp and Alt + Shift + ArrowDown to duplicate a line. See if you can duplicate this line downward with Alt + Shift + ArrowDown.
- Use Alt + , and Alt + . to decrease/increase indentation. See if you can indent this item with Alt + .

# Knowledge capture

## Create a new note

### Create by title

1. Use Ctrl + o (a shortcut for Ctrl + Space, "o") to open command input.
2. Type in the name of note.
3. Press Enter to confirm.

### Create by url capture

1. Use Ctrl + o to open command input.
2. Paste the url you want to capture.
3. Press Enter to confirm.

## Search existing notes

### Full text search

1. Use Ctrl + o to open command input.
2. Type in search query.
3. Use ArrowUp and ArrowDown to select result.
4. Press Enter to confirm. If you don't select any result, a new note will be created with your query as the title.

### Tag search

1. Use Ctrl + o to open command input.
2. Type in your query, followed by -t, then tags `<query> -t <tag1>, <tag2>, <tag3>`.
3. Use ArrowUp and ArrowDown to select result.
4. Press Enter to confirm. If you don't select any result, a new note will be created with your query as the title.

## Link to a note

### Add link to selected text

1. Select text (Shift + Arrow keys)
2. Use Ctrl + k (Shortcut for Ctrl + Space, "k") to open command input.
3. Type in your query to search notes.
4. Use ArrowUp and ArrowDown to select result.
5. Press Enter to confirm.
6. If you don't select any result and press Enter, you will to taken to create a new note.
   -1. Edit the new note. Press Enter to save. You may close the newly saved note.
   -2. The previous note will automatically link to the newly created note. Remember to save it as well.

### Replace selected text with the title of a note and link to it

1. Select text.
2. Use Ctrl + Space, "i" to open command input.
3. Same steps as above.

## Add tags

1. Move the caret to the metadata line that starts with #+tags:
2. Place the caret as the end of line
3. Use Ctrl + Space, "t" to open command input.
4. Type in tag name.
5. Select a search result or add a new tag.
6. After adding one tag, the command input will re-open so you can quickly add more tags.
7. When you finished add all tags, press Escape to exit command input.

# Chores

## Version management

### Save file locally

- Use Ctrl + s (shortcut for Ctrl + Space, "f", "s") to save the file you are editing.

### Sync with remote

- Note this won't work until you configured Git hosting.
- Use Ctrl + Shift + s (shortcut for Ctrl + Space, "f", "a") to save the file and sync all files.

## Undo, redo

- Use Ctrl + z to undo.
- Use Ctrl + Shift + z to redo.

## Find on page

- Use the browser find on page (Ctrl + F) feature.
  -- Use Escape key to exit find on page mode. Your caret should select the matching words.
