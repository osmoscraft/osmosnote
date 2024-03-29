import { writeClipboardText } from "../../utils/clipboard.js";
import { SRC_LINE_END } from "../../utils/special-characters.js";
import type { CaretPosition, CaretService } from "./caret.service.js";
import type { CompileService } from "./compiler/compile.service.js";
import { HEADING_CONTROL_CHAR, HEADING_MAX_LEVEL } from "./compiler/heading.js";
import { LIST_CONTROL_CHAR } from "./compiler/list.js";
import type { SeekInput } from "./helpers/dom.js";
import { LineElement, sourceToLines } from "./helpers/source-to-lines.js";
import { splice } from "./helpers/string.js";
import type { LineQueryService } from "./line-query.service.js";

/**
 * Change the content in the editor
 */
export class EditService {
  constructor(
    private caretService: CaretService,
    private formatService: CompileService,
    private lineQueryService: LineQueryService,
    private compileService: CompileService
  ) {}

  insertText(text: string, root: HTMLElement) {
    this.deleteSelectionExplicit(root);

    const caret = this.caretService.caret;
    if (!caret) return;

    const { offset } = this.caretService.getCaretLinePosition(caret.focus);
    const currentLine = this.lineQueryService.getLine(caret.focus.node);
    if (!currentLine) return;

    const lineText = currentLine.textContent!;

    const distanceToEnd = lineText.length - offset;

    const lineUpdatedText = splice(lineText, offset, 0, text);
    const newLines = sourceToLines(lineUpdatedText);
    const lastUpdatedLine = newLines.lastElementChild as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    this.formatService.parseLines(root);

    this.caretService.setCollapsedCaretToLineOffset({
      line: lastUpdatedLine,
      offset: lastUpdatedLine.textContent!.length - distanceToEnd,
    });
  }

  /**
   * This method will cause a full recompile. Use insertBelow if possible.
   */
  insertNewLine(root: HTMLElement) {
    this.deleteSelectionExplicit(root);

    const caret = this.caretService.caret;
    if (!caret) return;

    const { offset } = this.caretService.getCaretLinePosition(caret.focus);
    const currentLine = this.lineQueryService.getLine(caret.focus.node);
    if (!currentLine) return;

    const textBefore = this.lineQueryService.sliceLine(currentLine, 0, offset);
    const textAfter = this.lineQueryService.sliceLine(currentLine, offset);

    const newLines = sourceToLines(textBefore + SRC_LINE_END + textAfter);
    const newSecondLine = newLines.children[1] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine);
    currentLine.remove();

    this.formatService.compile(root);

    // set caret to next line start
    const lineMetrics = this.lineQueryService.getLineMetrics(newSecondLine);
    this.caretService.setCollapsedCaretToLinePosition({
      line: newSecondLine,
      position: { row: 0, column: lineMetrics.indent },
    });
  }

  /**
   * @param inlineRawText must not contain new line character
   */
  insertBelow(root: HTMLElement, inlineRawText: string) {
    const caret = this.caretService.caret;
    if (!caret) return;

    const currentLine = this.lineQueryService.getLine(caret.focus.node);
    if (!currentLine) return;

    const newLines = sourceToLines(inlineRawText + SRC_LINE_END);
    this.formatService.parseLines(newLines);

    const newSecondLine = newLines.children[0] as HTMLElement;

    currentLine.parentElement?.insertBefore(newLines, currentLine.nextSibling);

    // set caret to next line start
    this.caretService.setCollapsedCaretToLinePosition({
      line: newSecondLine,
      position: { row: 0, column: inlineRawText.length },
    });
  }

  deleteBefore(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;

    if (!caret.isCollapsed) {
      this.deleteSelectionExplicit(root);
      return;
    }

    const { offset } = this.caretService.getCaretLinePosition(caret.focus);
    const currentLine = this.lineQueryService.getLine(caret.focus.node);
    if (!currentLine) return;

    if (offset === 0) {
      // at line start. Move rest of line content to the end of line above
      const previousLine = this.lineQueryService.getPreviousLine(currentLine);
      if (previousLine) {
        const previousLineText = this.lineQueryService.sliceLine(previousLine, 0, -1); // remove line end
        const currentLineRemainingText = currentLine.textContent;
        const newlines = sourceToLines(previousLineText + currentLineRemainingText);
        const updatedPreviousLine = newlines.children[0] as HTMLElement;

        currentLine.remove();
        previousLine.parentElement?.insertBefore(newlines, previousLine);
        previousLine.remove();

        this.formatService.parseLines(root);

        this.caretService.setCollapsedCaretToLineOffset({
          line: updatedPreviousLine,
          offset: previousLineText.length,
        });
      }
    } else {
      const remainingText = splice(currentLine.textContent!, offset - 1, 1);

      const newLines = sourceToLines(remainingText);
      const updatedLine = newLines.children[0] as HTMLElement;

      currentLine.parentElement?.insertBefore(newLines, currentLine);
      currentLine.remove();

      this.formatService.parseLines(root);

      // set caret to the left edge of the deleted char
      this.caretService.setCollapsedCaretToLineOffset({
        line: updatedLine,
        offset: offset - 1,
      });
    }
  }

  deleteAfter(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;

    if (!caret.isCollapsed) {
      this.deleteSelectionExplicit(root);
      return;
    }

    const { offset } = this.caretService.getCaretLinePosition(caret.focus);
    const currentLine = this.lineQueryService.getLine(caret.focus.node);
    if (!currentLine) return;

    const { selectableLength } = this.lineQueryService.getLineMetrics(currentLine);
    if (offset === selectableLength) {
      const nextLine = this.lineQueryService.getNextLine(currentLine);
      if (!nextLine) return;

      const nextLineText = nextLine.textContent!;
      const joinedLineText = currentLine.textContent!.slice(0, -1).concat(nextLineText);

      const newLines = sourceToLines(joinedLineText);
      const updatedLine = newLines.children[0] as HTMLElement;

      currentLine.parentElement?.insertBefore(newLines, currentLine);
      currentLine.remove();
      nextLine.remove();

      this.formatService.parseLines(root);

      this.caretService.setCollapsedCaretToLineOffset({ line: updatedLine, offset: offset });
    } else {
      const lineText = currentLine.textContent!;
      const lineRemainingText = splice(lineText, offset, 1);
      const newLines = sourceToLines(lineRemainingText);
      const updatedLine = newLines.children[0] as HTMLElement;

      currentLine.parentElement?.insertBefore(newLines, currentLine);
      currentLine.remove();

      this.formatService.parseLines(root);

      this.caretService.setCollapsedCaretToLineOffset({ line: updatedLine, offset: offset });
    }
  }

  deleteWordBefore(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;

    if (!caret.isCollapsed) {
      this.deleteSelectionExplicit(root);
      return;
    }

    // Note that most editors seek word boundary more conservatively when deleting compared to just moving
    // Using the lazy mode to ensure line ending is treated as a word
    this.caretService.selectWordStartLazy(root);
    this.deleteSelectionExplicit(root);
  }

  deleteWordAfter(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;

    if (!caret.isCollapsed) {
      this.deleteSelectionExplicit(root);
      return;
    }

    this.caretService.selectWordEndLazy(root);
    this.deleteSelectionExplicit(root);
  }

  /**
   * If there is selection, selection will be deleted.
   * If there is no selction, current line will be deleted.
   */
  deleteSelection(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;
    if (caret.isCollapsed) {
      this.deleteSelectedLines();
    } else {
      this.deleteSelectionExplicit(root);
    }
  }

  deleteSelectedLines() {
    const caret = this.caretService.caret;
    if (!caret) return;

    const selectedLines = this.lineQueryService.getLines(caret.start.node, caret.end.node);
    if (!selectedLines.length) return;

    let newFocusLine = this.lineQueryService.getNextLine(selectedLines[selectedLines.length - 1]);
    if (!newFocusLine) {
      newFocusLine = this.lineQueryService.getPreviousLine(selectedLines[0]);
    }

    if (!newFocusLine) {
      // document will be empty after deletion. Create an empty line so we can set focus to it
      const newLines = sourceToLines("");
      newFocusLine = newLines.children[0] as LineElement;
      this.formatService.parseLines(newLines);

      selectedLines[0].parentElement?.insertBefore(newLines, selectedLines[0]);
    }

    selectedLines.forEach((line) => line.remove());

    this.caretService.setCollapsedCaretToLineOffset({ line: newFocusLine });
  }

  /**
   * Delete selection if there is any. No op otherwise
   */
  deleteSelectionExplicit(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;
    if (caret.isCollapsed) return;

    const selectedLines = this.lineQueryService.getLines(caret.start.node, caret.end.node);
    const { offset: caretStartOffset } = this.caretService.getCaretLinePosition(caret.start);
    const { offset: caretEndOffset } = this.caretService.getCaretLinePosition(caret.end);

    let updatedLine: HTMLElement | undefined = undefined;

    // if start and end are on the same line, update line content
    if (selectedLines.length === 1) {
      // remove content between start and end
      const currentLine = selectedLines[0];

      const lineText = currentLine.textContent!;
      const lineUpdatedText = lineText.slice(0, caretStartOffset) + lineText.slice(caretEndOffset);
      const newLines = sourceToLines(lineUpdatedText);
      updatedLine = newLines.children[0] as HTMLElement;

      currentLine.parentElement?.insertBefore(newLines, currentLine);
      currentLine.remove();
    } else if (selectedLines.length > 1) {
      const startLine = selectedLines[0];
      const startLineText = startLine.textContent!;

      const endLine = selectedLines[selectedLines.length - 1];
      const endLineText = endLine.textContent!;

      const joinedLineText = startLineText.slice(0, caretStartOffset) + endLineText.slice(caretEndOffset);
      const newLines = sourceToLines(joinedLineText);
      updatedLine = newLines.children[0] as HTMLElement;

      startLine.parentElement?.insertBefore(updatedLine, startLine);
      selectedLines.forEach((line) => line.remove());
    }

    if (!updatedLine) {
      console.error("There must be at least one selected lines when caret is not collapsed.");
      return;
    }

    this.formatService.parseLines(root);
    this.caretService.setCollapsedCaretToLineOffset({ line: updatedLine, offset: caretStartOffset });
  }

  async caretCopy() {
    const caret = this.caretService.caret;
    if (!caret) return;

    if (caret.isCollapsed) {
      // copy the entire line
      const currentLine = this.lineQueryService.getLine(caret.focus.node);
      if (!currentLine) return;
      const lineMetrics = this.lineQueryService.getLineMetrics(currentLine);
      const portableText = currentLine.textContent!.slice(lineMetrics.indent);
      await writeClipboardText(portableText);
    } else {
      // copy the selection
      const selectedLines = this.lineQueryService.getLines(caret.start.node, caret.end.node);
      const { offset: caretStartOffset } = this.caretService.getCaretLinePosition(caret.start);
      const { offset: caretEndOffset } = this.caretService.getCaretLinePosition(caret.end);

      const selectedText = this.lineQueryService.getPortableText(selectedLines, caretStartOffset, caretEndOffset);

      await writeClipboardText(selectedText);
    }
  }

  async caretCut(root: HTMLElement) {
    const caret = this.caretService.caret;
    if (!caret) return;

    await this.caretCopy();
    this.deleteSelection(root);
  }

  async caretPaste(text: string | undefined, root: HTMLElement) {
    if (!text) return;

    const caret = this.caretService.caret;
    if (!caret) return;

    const textWithNormalizedLineEnding = text.replace(/\r\n?/g, SRC_LINE_END);

    this.insertText(textWithNormalizedLineEnding, root);
  }

  async shiftLinesUp() {
    const context = this.caretService.getCaretContext();
    if (!context) return;

    const { lineStart, lineEnd } = context;
    const lineAbove = this.lineQueryService.getPreviousLine(lineStart);
    if (lineAbove) {
      lineEnd.insertAdjacentElement("afterend", lineAbove);
    }
  }

  async shiftLinesDown() {
    const context = this.caretService.getCaretContext();
    if (!context) return;

    const { lineStart, lineEnd } = context;
    const lineBelow = this.lineQueryService.getNextLine(lineEnd);
    if (lineBelow) {
      lineStart.insertAdjacentElement("beforebegin", lineBelow);
    }
  }

  async duplicateLinesUp() {
    const caret = this.caretService.caret;
    if (!caret) return;

    const selectedLines = this.lineQueryService.getLines(caret?.start.node, caret?.end.node);
    if (!selectedLines.length) return;

    const duplicatedLines = document.createDocumentFragment();
    selectedLines.forEach((existingLine) => duplicatedLines.appendChild(existingLine.cloneNode(true)));

    const lastLine = selectedLines[selectedLines.length - 1];
    lastLine.parentNode!.insertBefore(duplicatedLines, lastLine.nextSibling);
    this.caretService.catchUpToDom({ saveColumnAsIdeal: false, detectSelectionChange: false });
  }

  async duplicateLinesDown() {
    const caret = this.caretService.caret;
    if (!caret) return;

    const selectedLines = this.lineQueryService.getLines(caret?.start.node, caret?.end.node);
    if (!selectedLines.length) return;

    const duplicatedLines = document.createDocumentFragment();
    selectedLines.forEach((existingLine) => duplicatedLines.appendChild(existingLine.cloneNode(true)));

    const firstLine = selectedLines[0];
    firstLine.parentNode!.insertBefore(duplicatedLines, firstLine);
    this.caretService.catchUpToDom({ saveColumnAsIdeal: false, detectSelectionChange: false });
  }

  // WIP
  async shiftIndent(root: HTMLElement, levelChange: 1 | -1) {
    // currently only support step size = 1. the logic won't work for step size larger than 1
    // handle boundary

    const caret = this.caretService.caret;
    if (!caret) return;

    const lines = this.lineQueryService.getLines(caret.start.node, caret.end.node);
    const context = this.caretService.getCaretContext()!;

    let anchor!: SeekInput;
    let focus!: SeekInput;

    lines.forEach((line) => {
      const existingAnchor = line === context.lineAnchor ? caret.anchor : undefined;
      const existingFocus = line === context.lineFocus ? caret.focus : undefined;

      const result = this.shiftIndentLine(root, line, levelChange, existingAnchor, existingFocus);

      if (!result) {
        if (existingAnchor) {
          anchor = {
            source: line,
            offset: existingAnchor.offset,
          };
        }
        if (existingFocus) {
          focus = {
            source: line,
            offset: existingFocus.offset,
          };
        }
        return;
      }

      const { line: newLine, anchorOffset, focusOffset } = result;

      if (anchorOffset !== undefined) {
        anchor = {
          source: newLine,
          offset: anchorOffset,
        };
      }

      if (focusOffset !== undefined) {
        focus = {
          source: newLine,
          offset: focusOffset,
        };
      }
    });

    this.caretService.setCaretsBySeekInput({
      anchor,
      focus,
    });

    this.compileService.compile(root);
  }

  // WIP
  private shiftIndentLine(
    root: HTMLElement,
    targetLine: LineElement,
    levelChange: 1 | -1,
    caretAnchor?: CaretPosition,
    caretFocus?: CaretPosition
  ):
    | {
        line: LineElement;
        anchorOffset?: number;
        focusOffset?: number;
      }
    | undefined {
    let controlCharIndex!: number;
    let newString!: string;
    const existingString = targetLine.textContent!;

    switch (targetLine.dataset.line) {
      case "heading":
        const headingLevel = parseInt(targetLine.dataset.headingLevel!);
        const newHeadingLevel = headingLevel + levelChange;
        if (newHeadingLevel > HEADING_MAX_LEVEL || newHeadingLevel < 1) return;
        const headingControlString = HEADING_CONTROL_CHAR.repeat(headingLevel);
        controlCharIndex = existingString.indexOf(headingControlString);
        const newHeadingControlString = HEADING_CONTROL_CHAR.repeat(newHeadingLevel);
        newString = existingString.replace(headingControlString, newHeadingControlString);
        break;
      case "list":
        const listLevel = parseInt(targetLine.dataset.listLevel!);
        const newListLevel = listLevel + levelChange;
        if (newListLevel < 1) return;
        const marker = targetLine.dataset.listMarker!;
        const listControlString = LIST_CONTROL_CHAR.repeat(listLevel - 1) + marker;
        controlCharIndex = existingString.indexOf(listControlString);
        const newListControlString = LIST_CONTROL_CHAR.repeat(newListLevel - 1) + marker;
        newString = existingString.replace(listControlString, newListControlString);
        break;
      default:
        // No support for other line types yet
        return;
    }

    const newLineFrag = sourceToLines(newString);
    const newLine = newLineFrag.children[0] as LineElement;
    this.compileService.parseLines(newLineFrag);
    root.insertBefore(newLineFrag, targetLine);
    targetLine.remove();

    let anchorOffset: number | undefined = undefined;
    let focusOffset: number | undefined = undefined;

    if (caretAnchor) {
      const caretLinePosition = this.caretService.getCaretLinePosition(caretAnchor);
      const isChangeBeforeCaret = controlCharIndex - 1 < caretLinePosition.offset;
      anchorOffset = caretLinePosition.offset + (isChangeBeforeCaret ? levelChange : 0);
    }

    if (caretFocus) {
      const caretLinePosition = this.caretService.getCaretLinePosition(caretFocus);
      const isChangeBeforeCaret = controlCharIndex - 1 < caretLinePosition.offset;
      focusOffset = caretLinePosition.offset + (isChangeBeforeCaret ? levelChange : 0);
    }

    return {
      line: newLine,
      anchorOffset,
      focusOffset,
    };
  }

  /** @deprecated */
  async shiftIndentCollapsed(root: HTMLElement, levelChange: 1 | -1) {
    const context = this.caretService.getCaretContext();
    if (!context?.lineCollapsed) return this.shiftIndent(root, levelChange);

    const targetLine = context.lineStart;

    let maxLevel = Infinity;
    let minLevel = 1;
    let currentLevel!: number;
    let controlChar!: string;

    switch (targetLine.dataset.line) {
      case "heading":
        maxLevel = HEADING_MAX_LEVEL;
        currentLevel = parseInt(targetLine.dataset.headingLevel!);
        controlChar = HEADING_CONTROL_CHAR;
        break;
      case "list":
        currentLevel = parseInt(targetLine.dataset.listLevel!);
        controlChar = LIST_CONTROL_CHAR;
        break;
      default:
        // No support for other line types yet
        return;
    }

    if ((levelChange > 0 && currentLevel === maxLevel) || (levelChange < 0 && currentLevel === minLevel)) return;

    const existingString = targetLine.textContent!;
    const controlCharIndex = existingString.indexOf(controlChar);
    const caretLinePosition = this.caretService.getCaretLinePosition(this.caretService.caret!.focus);
    const isChangeBeforeCaret = controlCharIndex < caretLinePosition.offset;

    const charToAdd = levelChange > 0 ? controlChar.repeat(levelChange) : "";
    const lengthToRemove = Math.abs(Math.min(levelChange, 0));
    const newString =
      existingString.slice(0, controlCharIndex) + charToAdd + existingString.slice(controlCharIndex + lengthToRemove);
    const newLineFrag = sourceToLines(newString);
    const newLine = newLineFrag.children[0] as LineElement;
    this.compileService.parseLines(newLineFrag);
    root.insertBefore(newLineFrag, targetLine);
    targetLine.remove();

    this.caretService.setCollapsedCaretToLineOffset({
      line: newLine,
      offset: caretLinePosition.offset + (isChangeBeforeCaret ? levelChange : 0),
    });

    this.compileService.compile(root);
  }
}
