import type { CaretService } from "./caret.service.js";
import { getCursorLinePosition } from "./helpers/curosr/cursor-query.js";
import { getLine } from "./helpers/line/line-query.js";
import type { LineElement, LineType } from "./helpers/source-to-lines.js";
import { removeLineEnding } from "./helpers/string.js";

export interface FormatContext {
  level: number;
  isLevelDirty: boolean;
}

export interface ParseLinesConfig {
  /**
   * When provided, indent will be updated based on the given context.
   * Otherwise, parser will not update indent and only parse syntax
   */
  indentWithContext?: FormatContext;
}

const PARSE_LINES_DEFAULT_CONTEXT: FormatContext = {
  level: 0,
  isLevelDirty: false,
};

interface FormatLineSummary {
  lengthChange: number;
  lineType: LineType;
}

export interface FormatConfig {
  syntaxOnly?: boolean;
}

export class FormatService {
  constructor(private caretService: CaretService) {}

  /**
   * Format all lines with dirty syntax flag. Indent will be kept dirty.
   */
  parseLines(root: HTMLElement | DocumentFragment, config: ParseLinesConfig = {}) {
    // TODO handle cursor restore. Expose config to allow manual cursor restore
    const isSyntaxOnly = config.indentWithContext === undefined;
    const { indentWithContext: context = PARSE_LINES_DEFAULT_CONTEXT } = config;

    const lines = [...root.querySelectorAll("[data-line]")] as LineElement[];

    lines.forEach((line) => {
      if (line.dataset.dirtySyntax !== undefined) {
        this.formatLine(line, context, { syntaxOnly: isSyntaxOnly });
        delete line.dataset.dirtySyntax;
      }
    });
  }

  parseDocument(root: HTMLElement | DocumentFragment) {
    const cursor = this.caretService.caret;
    let cursorLine: HTMLElement;
    let previousCursorOffset: number | null = null;

    if (cursor) {
      cursorLine = getLine(cursor.focus.node)!;
      const { offset } = getCursorLinePosition(cursor.focus);
      previousCursorOffset = offset;
    }

    const lines = [...root.querySelectorAll("[data-line]")] as LineElement[];
    const context: FormatContext = {
      level: 0,
      isLevelDirty: false,
    };

    lines.forEach((line) => {
      const isLineClean = line.dataset.dirtyIndent === undefined && line.dataset.dirtySyntax === undefined;

      // update context without formatting when context and line are both clean
      if (!context.isLevelDirty && isLineClean) {
        this.updateContextFromLine(line, context);
        return;
      }

      // otherwise, format the line
      const { lengthChange, lineType } = this.formatLine(line, context);
      const isIndentReset = this.isIndentSettingLineType(lineType);
      // update line dirty state (this is independent from context)
      delete line.dataset.dirtyIndent;
      delete line.dataset.dirtySyntax;

      // update context dirty state
      if (!context.isLevelDirty && !isLineClean && isIndentReset) {
        // when context is clean, a dirty heading line pollutes context
        context.isLevelDirty = true;
      } else if (context.isLevelDirty && isLineClean && isIndentReset) {
        // when context is dirty, a clean heading line cleans context
        context.isLevelDirty = false;
      }

      // restore cursor
      if ((line as any) === cursorLine) {
        const newOffset = Math.max(0, previousCursorOffset! + lengthChange);
        this.caretService.setCollapsedCursorToLineOffset({ line: cursorLine, offset: newOffset });
      }
    });
  }

  updateContextFromLine(line: LineElement, context: FormatContext) {
    const rawText = line.textContent ?? "";

    // heading
    let match = rawText.match(/^(\s*)(#+) (.*)\n?/);
    if (match) {
      const [raw, spaces, hashes, text] = match;

      context.level = hashes.length;

      return {
        isContextSet: true,
      };
    }

    return {};
  }

  formatLine(line: LineElement, context: FormatContext, config: FormatConfig = {}): FormatLineSummary {
    const rawText = line.textContent ?? "";

    // heading
    let match = rawText.match(/^(\s*)(#+) (.*)\n?/);
    if (match) {
      const [raw, spaces, hashes, text] = match;

      context.level = hashes.length;
      line.dataset.level = hashes.length.toString();
      line.dataset.line = "heading";

      const indent = config.syntaxOnly ? spaces : ` `.repeat(hashes.length - 1);
      const hiddenHashes = `#`.repeat(hashes.length - 1);

      line.innerHTML = `<span data-indent>${indent}</span><span data-wrap><span class="t--ghost">${hiddenHashes}</span><span class="t--bold"># ${text}</span>\n</span>`;

      return {
        lengthChange: indent.length + hiddenHashes.length + 2 + text.length + 1 - raw.length,
        lineType: "heading",
      };
    }

    // meta
    match = rawText.match(/^#\+(.+?): (.*)\n?/);
    if (match) {
      const [raw, metaKey, metaValue] = match;

      line.dataset.line = "meta";

      switch (metaKey) {
        case "url":
          line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-url="${metaValue}">${metaValue}</span>\n</span>`;
          break;
        case "title":
          line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="title">${metaValue}</span>\n</span>`;
          break;
        case "tags":
          line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="tags">${metaValue}</span>\n</span>`;
          break;
        case "created":
          line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value="created">${metaValue}</span>\n</span>`;
          break;
        default:
          line.innerHTML = `<span data-wrap><span class="t--secondary">#+${metaKey}: </span><span data-meta-value>${metaValue}</span>\n</span>`;
          console.error(`Unsupported meta key ${metaKey}`);
      }

      return {
        lengthChange: 2 + metaKey.length + 2 + metaValue.length + 1 - raw.length,
        lineType: "meta",
      };
    }

    // blank line
    match = rawText.match(/^(\s+)$/);
    if (match) {
      const [raw, spaces] = match;

      line.dataset.line = "blank";

      const inlineSpaces = removeLineEnding(spaces);

      const indent = config.syntaxOnly ? inlineSpaces : ` `.repeat(context.level * 2);
      line.innerHTML = `<span data-indent>${indent}</span><span>\n</span>`;

      return {
        lengthChange: indent.length + 1 - raw.length,
        lineType: "",
      };
    }

    // paragraph
    let paragraphHtml = "";
    let remainingText = removeLineEnding(rawText);
    let indent: string;
    let actualIndent = remainingText.match(/^(\s+)/)?.[0] ?? "";
    let paragraphLength = 0;

    if (config.syntaxOnly) {
      indent = actualIndent;
      remainingText = remainingText.slice(indent.length);
    } else {
      indent = ` `.repeat(context.level * 2);
      remainingText = remainingText.trimStart();
    }

    paragraphLength = remainingText.length;

    while (remainingText) {
      let match = remainingText.match(/^(.*?)\[(.+?)\]\((.+?)\)/); // links
      if (match) {
        const [raw, plainText, linkTitle, linkTarget] = match;
        paragraphHtml += plainText;
        paragraphHtml += `<span data-link class="t--ghost">[<span class="link__title">${linkTitle}</span>](<span data-note-id="${linkTarget}" class="link__target">${linkTarget}</span>)</span>`;

        remainingText = remainingText.slice(raw.length);
        continue;
      }

      match = remainingText.match(/^(.*?)(https?:\/\/[^\s/$.?#].[^\s]*)/); // raw URL
      if (match) {
        const [raw, plainText, url] = match;
        paragraphHtml += plainText;
        paragraphHtml += `<span data-url="${url}">${url}</span>`;

        remainingText = remainingText.slice(raw.length);
        continue;
      }

      paragraphHtml += remainingText;
      remainingText = "";
    }

    line.innerHTML = `<span data-indent>${indent}</span><span data-wrap>${paragraphHtml}\n</span>`;

    return {
      lengthChange: indent.length + paragraphLength + 1 - rawText.length,
      lineType: "",
    };
  }

  isIndentSettingLineType(lineType?: string): boolean {
    return (lineType as LineType) === "heading";
  }
}
