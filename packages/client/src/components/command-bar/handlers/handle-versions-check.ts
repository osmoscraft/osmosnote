import type { VersionsBody, VersionsReply } from "@system-two/server/src/routes/versions";
import type { CommandHandler } from ".";

export const handleVersionsCheck: CommandHandler = async ({ context }) => {
  // Create new file
  const createNoteBody: VersionsBody = {
    action: "check",
  };

  const response = await fetch(`/api/versions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(createNoteBody),
  });

  const result: VersionsReply = await response.json();

  context.componentRefs.statusBar.showText(result.message);

  return {};
};
