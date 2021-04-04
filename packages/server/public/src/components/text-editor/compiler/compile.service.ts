import { sanitizeHtml } from "../../../utils/sanitize-html.js";
import type { CaretService } from "../caret.service.js";
import { blank } from "./blank.js";
import { generic } from "./generic.js";
import { heading } from "./heading.js";
import { list } from "./list.js";
import { meta } from "./meta.js";
import type { LineElement, LineType } from "../helpers/source-to-lines.js";
import type { LineQueryService } from "../line-query.service.js";
import { SRC_LINE_END } from "../../../utils/special-characters.js";

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
    let caretLine: HTMLElement;
    let previousCaretOffset: number | null = null;

    if (!config.noCursorRestore) {
      const caret = this.caretService.caret;
      if (caret) {
        caretLine = this.lineQueryService.getLine(caret.focus.node)!;
        const { offset } = this.caretService.getCaretLinePosition(caret.focus);
        previousCaretOffset = offset;
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
          const formatLineSummary = config.noFormatting ? null : lineCompiler.format(line, context);

          // 3. context update
          lineCompiler.updateContext?.(line, context);

          // 4. restore cursor
          if (!config.noCursorRestore && (line as any) === caretLine) {
            const newOffset = Math.max(0, previousCaretOffset! + (formatLineSummary?.lengthChange ?? 0));
            this.caretService.setCollapsedCaretToLineOffset({ line: caretLine, offset: newOffset });
          }

          return;
        }
      }

      console.error(`[format] fatal error. Unexpected token on line ${index}. Line text: ${line.textContent}`);
    });
  }

  getPortableText(lines: HTMLElement[], startLineOffset = 0, endLineOffset?: number): string {
    const text = lines
      .map((line, index) => {
        const metrics = this.lineQueryService.getLineMetrics(line);
        const startOffset = index === 0 ? Math.max(metrics.indent, startLineOffset) : metrics.indent;
        const endOffset = index === lines.length - 1 ? endLineOffset : metrics.selectableLength;

        return line.textContent!.slice(startOffset, endOffset);
      })
      .join(SRC_LINE_END);

    return text;
  }
}
