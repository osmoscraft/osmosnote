import type { LookupTagsBody, LookupTagsReply } from "@system-two/server/src/routes/lookup-tags";
import type { SuggestTagsBody, SuggestTagsReply } from "@system-two/server/src/routes/suggest-tags";
import type { CommandHandler } from ".";
import { TAG_SEPARATOR } from "../../../utils/tag";

export const handleInsertTags: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  const _ = TAG_SEPARATOR;

  return {
    updateDropdownOnInput: async () => {
      let html = "";

      if (!phrase) {
        html += /*html*/ `<s2-menu-row data-kind="header" data-label="Recent"></s2-menu-row>`;

        const { error, data } = await context.proxyService.post<SuggestTagsReply, SuggestTagsBody>(
          "/api/suggest-tags",
          {}
        );

        if (error) {
          html += /*html*/ `<s2-menu-row data-label="Error getting tags"></s2-menu-row>`;
        } else if (!data?.tags.length) {
          html += /*html*/ `<s2-menu-row data-label="No recent tags"></s2-menu-row>`;
        } else {
          html += data?.tags
            .map(
              (item) =>
                /*html*/ `<s2-menu-row data-kind="option" data-label="${item.text}" data-auto-complete="${item.text}">${item.text}</s2-menu-row>`
            )
            .join("");
        }

        return html;
      }

      const { error, data } = await context.proxyService.post<LookupTagsReply, LookupTagsBody>("/api/lookup-tags", {
        query: phrase,
      });

      html += /*html*/ `<s2-menu-row data-kind="header" data-label="Search results"></s2-menu-row>`;

      if (error) {
        html += /*html*/ `<s2-menu-row data-label="Error looking up tags"></s2-menu-row>`;
      } else if (!data?.tags.length) {
        html += /*html*/ `<s2-menu-row data-label="No tags found"></s2-menu-row>`;
      } else {
        html += data.tags
          .map(
            (tag) =>
              /*html*/ `<s2-menu-row data-kind="option" data-label="${tag}" data-auto-complete="${tag}"></s2-menu-row>`
          )
          .join("");
      }

      return html;
    },
    repeatableRunOnCommit: () => {
      context.componentRefs.textEditor.insertAtCursor(`${_}${phrase}${_}`);
      context.componentRefs.statusBar.setMessage(`[command-bar] inserted "${_}${phrase}${_}"`);
    },
  };
};
