import type { CommandHandler } from "../command-bar.component.js";
import { renderHeaderRow, renderMessageRow } from "../menu/render-menu.js";

export const handleInsertTags: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim() ?? "";

  const searchParams = new URLSearchParams();
  phrase && searchParams.set("title", phrase);

  return {
    updateDropdownOnInput: async () => {
      let optionsHtml = renderHeaderRow("Insert tags");

      if (!phrase?.length) {
        try {
          const recentTagsOutput = await context.apiService.getRecentTags();
          optionsHtml += recentTagsOutput.tags
            .map(
              (item) =>
                /*html*/ `<s2-menu-row data-kind="option" data-label="${item}" data-auto-complete="${item}"></s2-menu-row>`
            )
            .join("");
        } catch (error) {
          optionsHtml += renderMessageRow("Error loading recent tags");
        }
      } else {
        try {
          const lookupTagsOutput = await context.apiService.lookupTags(phrase);
          optionsHtml += lookupTagsOutput.tags
            .map(
              (item) =>
                /*html*/ `<s2-menu-row data-kind="option" data-label="${item}" data-auto-complete="${item}"></s2-menu-row>`
            )
            .join("");
        } catch (error) {
          optionsHtml += renderMessageRow("Error searching notes");
        }
      }

      return optionsHtml;
    },
    repeatableRunOnCommit: () => {
      context.componentRefs.textEditor.insertAtCaretWithContext((context) => {
        if (context.textBefore.endsWith(":") || context.textBefore.endsWith(",")) {
          // "#+tags:" or "tag,"
          return ` ${phrase}`;
          // "#+tags: ", or "tag, "
        } else if (context.textBefore.endsWith(": ") || context.textBefore.endsWith(", ")) {
          return phrase;
        } else {
          return `, ${phrase}`;
        }
      });
      context.componentRefs.statusBar.setMessage(`[command-bar] inserted "${phrase}"`);
    },
  };
};
