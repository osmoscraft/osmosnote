## v0.0.11

- Bug: Disable browser built-in formatter: italic, underline, bold
- Bug: Clicking didn't sync the ideal column for vertical travel
- Bug: CJK input composed input triggers raw input handler
- IDE: auto list order (need format context to track current level and order)

## v0.0.10

- Compiler: mix link within list
- Compiler: Consider MVP list rendering (use multiple - without space)
- Compiler: Handle list indentation
- Compiler: DOM tags are being parsed. Need escape logic. (refer to prev. parser POC)
- IDE: Graceful handling of invalid ID
- IDE: Open and insert should use selection as default search query too.
- IDE: delete note is not merged with staged change.
- IDE: Auto create list marker on enter
- IDE: delete heading line will leave content below in clean state with wrong indentation
- IDE: Disable spellchecker on metadata
- IDE: Easy delete of notes
- IDE: Display tags in Reference panel
- IDE: Display Title AND Tag in seach result, with overflow handling e.g. This is the name of a note that... Tag1, Tag2, Tag3...
- IDE: Loading settings from local storage
- IDE: User settings service (communicate with local storage)
- IDE: Spell check toggle on/off
- IDE: ESC key to cancel selection
- Bug: Status bar could overflow into multiple lines
- Bug: open close command bar causes unwanted scroll
- Bug: Ctrl + s causes unwanted scroll
- Bug: url parser crash on `https://www.designmattersmedia.com/podcast/2010/Massimo-Vignelli` - No fix. It was a network issue
