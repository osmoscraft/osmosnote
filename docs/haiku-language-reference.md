# Haiku language reference

A simple language for knowledge capture. Inspired by Markdown and Emacs Org Mode.

## Syntax reference

### Heading

An editor should support at least 6 levels of heading.

```haiku
# Heading level 1
## Heading level 2
### Heading level 3
#### Heading level 4
##### Heading level 5
###### Heading level 6
```

### List

```haiku
Ordered list:
1. Level 1 item 1
-1. Level 2 item 1
--1. Level 3 item 1
--2. Level 3 item 2
-2. Level 2 item 2
2. Level 1 item 2

Unordered list:
- Level 1 item 1
-- Level 2 item 1
--- Level 3 item 1
--- Level 3 item 2
-- Level 2 item 2
- Level 1 item 2
```

### Metadata

```haiku
#+key1: value1
#+key2: https://exampledomain.org/path/to/page
#+key3: item1, item2, item3
```

### Links

```haiku
This is [an internal link](YYYYMMDDHHMMSSS).
This is [an external link](https://exampledomain.org/path/to/page).

This is a bare link https://exampledomain.org/path/to/page in the middle of a sentence.
```
