# Haiku

A language optimized for knowledge synthesis.

Note: the Haiku language is in beta stage. The specs are subject to change.

## Design philosophy

### Readibility

- Scannable
- Hierarchy
- Indentation
- Visual anchors
- Navigation

### Direct manipulation on source code

- Key stroke efficiency
- Semantics based object: section, list, item
- Knowledge refactoring
- No need to think about white space
- No error state

### Easy to parse, highlight, and format

- Every line of Haiku can be parsed independently.
  - Strict O(N) parsing in JavaScript
  - Potential for parallelism (not possible in JavaScript yet).
  - Error tolerance
  - Efficient incremental parsing
- White space is derived from visible characters
  - Heading and list dictates white space
  - Avoid cause-effect circularity
  - Managed indentation

### Dual modal

- Storage mode has no leading space. Optimized a data storage.
- Live mode is identical to storage mode in visible character but with additional white space for indentation.
  - The editor is responsible to conversion.
  - Some leading characters can be styled as transparent for readability.

## Line elements

Note: Haiku is still in beta. The interface may change without advanced notice.

### Heading

The heading level is determined by the number of `#` leading characters.

In live mode, the editor should visually hide all `#` characters except for the last one with transparency.

An editor should support at least 6 levels of heading.

```haiku
Live mode:

# Heading level 1
  # Heading level 2
    # Heading level 3
      # Heading level 4
        # Heading level 5
          # Heading level 6

Storage mode:

# Heading level 1
## Heading level 2
### Heading level 3
#### Heading level 4
##### Heading level 5
###### Heading level 6
```

### List

The list item level is determined by the number of leading `-` characters.

In live mode, editor should hide all `-` characters in an ordered list and all expect for the last `-` character in an unordered list.

An unordered item can have an ordered item as child and vice versa. But an unordered item cannot be sibling with an ordered item.

An editor should support at least 6 levels of list nesting.

```haiku
Ordered list, live mode:

1. Level 1 item 1
   1. Level 2 item 1
      1. Level 3 item 1
      2. Level 3 item 2
   2. Level 2 item 2
2. Level 1 item 2

Ordered list, storage mode:

1. Level 1 item 1
-1. Level 2 item 1
--1. Level 3 item 1
--2. Level 3 item 2
-2. Level 2 item 2
2. Level 1 item 2


Unordered list, live mode:

- Level 1 item 1
  - Level 2 item 1
    - Level 3 item 1
    - Level 3 item 2
  - Level 2 item 2
- Level 1 item 2

Unordered list, storage mode:

- Level 1 item 1
-- Level 2 item 1
--- Level 3 item 1
--- Level 3 item 2
-- Level 2 item 2
- Level 1 item 2
```

### Metadata

### Paragraph

## Inline elements

### Links

## Indentation

### Indentation from heading

### Indentation from list

## Experiemental

### Quote

### Inline emphasis

### Control line
