# Tokens

- meta
  - fence `---`
  - key `\w: `
  - value (rest)
- heading
  - indentation `^ +`
  - prefix `#+ `
  - text (rest)
- list title
  - indentation `^ +`
  - prefix `- `, `\d+ `
  - text (rest)
- code block
  - indentation `^ +`
  - fence ```
- inline
  - link `[...](...)`, `https?://...`

# Syntax

## Meta block

#+title: Hello world!
#+tags: programming, philosophy
#+key: value

## Heading

- Always prefixed with "# ".
- No character other than " " before #
- Always single-line
- Level derived from indentation.
- 2 spaces per indentation level
- Layout effect:
  - Content below will be indended so it's flush with heading text, until the next heading

```
# Heading level one

  # Heading level two

    # Heading level three

      ...
```

## Paragraph

- Flush aligned with hearest heading above
- If there is no heading above, flush aligned with left edge of the document

```
Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

# Heading

  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

  # Heading

    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
```

## List

- List item title has the same layout effect as heading
- Ordered list uses "d+."
- Unordered list uses "-."
- A list is either ordered or unordered, and cannot mix them on the same level
- A child list can be either ordered or unordered, regardless of the parent.
- List counter restarts when the line above is not a list item, or is a list item of different type

```

# Heading

  1. List item title
     List item content
     - Child list item
     - Child list item
  2. List item title
  3. List item third
  ...
  10. List item title
      List item content
  11. List item title
      1. Child list item
      2. Child list item

  1. Another list starts
  - Yet another list starts
  1. Once again, another list starts
```

## Links

- internal link `[title](id)`
- external link `[title](https://)`
- literal link `https://...`
- footnote ref (future) `[title][ref]`
- footnote (future) `[ref]: id` or `[ref]: https://`

## Code

- inline: `
- block: ```

(this example has escaped back tick)

```markdown
This \`code\` is inline

\`\`\`language
This code is block
\`\`\`
```

## Block quote (future)

- Single quote "
- Last line can use -- for source

```
"
This is a brilliant quote,
especially when presented as a block quote.

-- Internet trolls, The Ultimate Collection of Bad Quotes
"
```

## Inline Tags (future)

- ::tag1, tag2, tag3, tag_with-symbol
- Can only be prefixed with space
- Separated by comma followed by a space
- Only allow `a-zA-Z0-9`, `_`, and `-`.
- (future) can extend to allow space and period
- Is case insensitive, though UpperCamel is recommended for readability

Top level tagging

```
::book, learning theory, policy, idea

# Heading
```

Section level tagging

```
# Heading

  ::resource, tooling, out-of-the-box
  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

```

## Italic (future)

- single asterisk

## Bold (future)

- double asterisk

## Bold and italic (future)

- tripple asterisk

## Table (future)

- Ref to org mode

## Special block (future)

- TBD
