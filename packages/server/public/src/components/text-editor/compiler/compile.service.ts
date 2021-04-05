import { sanitizeHtml } from "../../../utils/sanitize-html.js";
import type { CaretService } from "../caret.service.js";
import type { LineElement } from "../helpers/source-to-lines.js";
import type { LineQueryService } from "../line-query.service.js";
import { blank } from "./blank.js";
import { generic } from "./generic.js";
import { heading } from "./heading.js";
import { list } from "./list.js";
import { meta } from "./meta.js";

export interface FormatContext {
  indentFromHeading: number;
  indentFromList: number;
  /** Indent of the list item at a given level specified by the number of setter characters */
  listIndentFromSetter: number[];
  /** Order number for the last list item at a given level indexed by the number of setter characters */
  listOrderFromSetter: number[];
}

export interface LineCompiler {
  match: (rawText: string) => RegExpMatchArray | null;
  parse: (line: LineElement, match: RegExpMatchArray) => void;
  format: (line: LineElement, context: FormatContext) => FormatResult;
  updateContext?: (line: LineElement, context: FormatContext) => void;
}

interface FormatResult {
  lengthChange: number;
}

const lineCompilers: LineCompiler[] = [heading, blank, meta, list, generic];

export interface CompileConfig {
  skipParsedLines?: boolean;
  noFormatting?: boolean;
  noCursorRestore?: boolean;
}

export class CompileService {
  constructor(private caretService: CaretService, private lineQueryService: LineQueryService) {}

  /**
   * Parse raw text into syntax highlighted dom element. This won't update indent or cursor position
   */
  parseLines(root: HTMLElement | DocumentFragment) {
    this.compile(root, {
      skipParsedLines: true,
      noFormatting: true,
      noCursorRestore: true,
    });
  }

  /**
   * Parse raw text, format, and update cursor position
   */
  compile(root: HTMLElement | DocumentFragment, config: CompileConfig = {}) {
    let caretAnchorLine: HTMLElement;
    let caretFocusLine: HTMLElement;
    let previousCaretAnchorOffset: number | null = null;
    let previousCaretFocusOffset: number | null = null;
    let isCollapsed = false;
    let isInverted = false;
    let formatResult!: FormatResult | null;
    let shouldRestore = false;

    // TODO until we can tracks size change at arbitrary position, the cursor restore only works for indent change for collapsed cursor
    // Consider insert a bookmark element in dom just before compiling to track cusor position.
    // Consider asking each line compiler to export a size change map {from: [start, end], to: [newStart, newEnd]}[]

    if (!config.noCursorRestore) {
      const caret = this.caretService.caret;
      if (caret) {
        shouldRestore = true;
        isCollapsed = caret.isCollapsed;
        isInverted = caret.anchor.node !== caret.start.node;
        caretFocusLine = this.lineQueryService.getLine(caret.focus.node)!;
        caretAnchorLine = this.lineQueryService.getLine(caret.anchor.node)!;
        const { offset: anchorOffset } = this.caretService.getCaretLinePosition(caret.focus);
        previousCaretAnchorOffset = anchorOffset;

        const { offset: focusOffset } = this.caretService.getCaretLinePosition(caret.anchor);
        previousCaretFocusOffset = focusOffset;
      }
    }

    const context: FormatContext = {
      indentFromHeading: 0,
      indentFromList: 0,
      listIndentFromSetter: [],
      listOrderFromSetter: [],
    };

    const lines = config.skipParsedLines
      ? ([...root.querySelectorAll("[data-line]:not([data-parsed])")] as LineElement[])
      : ([...root.querySelectorAll("[data-line]")] as LineElement[]);

    lines.forEach((line, index) => {
      const rawText = sanitizeHtml(line.textContent ?? "");

      for (let lineCompiler of lineCompilers) {
        const match = lineCompiler.match(rawText);
        if (match) {
          // 1. parse
          lineCompiler.parse(line, match);
          line.dataset.parsed = "";

          // 2. format
          const result = config.noFormatting ? null : lineCompiler.format(line, context);
          if (line === caretAnchorLine) {
            formatResult = result;
          }

          // 3. context update
          lineCompiler.updateContext?.(line, context);
          return;
        }
      }

      console.error(`[format] fatal error. Unexpected token on line ${index}. Line text: ${line.textContent}`);
    });

    // 4. restore cursor
    if (shouldRestore) {
      if (isCollapsed) {
        if (formatResult) {
          const newOffset = Math.max(0, previousCaretAnchorOffset! + (formatResult.lengthChange ?? 0));
          this.caretService.setCollapsedCaretToLineOffset({ line: caretFocusLine!, offset: newOffset });
        }
      } else {
        // expand to cover all active lines
        // TODO improve this to retain as much selection as possible
        this.caretService.setCaretsBySeekOutput({
          anchor: isInverted
            ? this.lineQueryService.seekToLineEnd(caretAnchorLine!)
            : this.lineQueryService.seekToLineStart(caretAnchorLine!),
          focus: isInverted
            ? this.lineQueryService.seekToLineStart(caretFocusLine!)
            : this.lineQueryService.seekToLineEnd(caretFocusLine!),
        });
      }
    }
  }

  getPortableText(lines: HTMLElement[], startLineOffset = 0, endLineOffset?: number): string {
    return this.lineQueryService.getPortableText(lines, startLineOffset, endLineOffset);
  }
}
