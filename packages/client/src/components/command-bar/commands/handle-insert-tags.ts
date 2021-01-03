import type { TagsLookupBody, TagsLookupReply } from "@system-two/server/src/routes/tags-lookup";
import type { CommandHandler } from ".";

export const handleInsertTags: CommandHandler = async ({ input, context }) => {
  const phrase = input.args?.trim();

  return {
    updateDropdownOnInput: async () => {
      if (!phrase) return ""; // TODO render recent tags

      const { error, data } = await context.proxyService.post<TagsLookupReply, TagsLookupBody>("/api/tags-lookup", {
        query: phrase,
      });

      if (error) {
        return /*html*/ `<s2-menu-row data-label="Error looking up tags"></s2-menu-row>`;
      }

      if (!data?.tags.length) {
        return /*html*/ `<s2-menu-row data-label="No tags found"></s2-menu-row>`;
      }

      const optionsHtml = data.tags
        .map(
          (tag) =>
            /*html*/ `<s2-menu-row data-kind="option" data-label=":${tag}:" data-auto-complete="${tag}"></s2-menu-row>`
        )
        .join("");

      return optionsHtml;
    },
    repeatableRunOnCommit: () => {
      context.componentRefs.textEditor.insertAtCursor(`:${phrase}:`);
      context.componentRefs.statusBar.setMessage(`[command-bar] inserted ":${phrase}:"`);
      // // treating input as title to create a new note
      // if (phrase?.length) {
      //   context.windowBridgeService.insertNoteLinkAfterCreated(`/?title=${phrase}`);
      // } else {
      //   context.windowBridgeService.insertNoteLinkAfterCreated(`/`);
      // }
    },
  };
};
