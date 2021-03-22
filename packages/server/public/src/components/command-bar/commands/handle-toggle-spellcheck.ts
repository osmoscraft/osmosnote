import type { CommandHandler } from "../command-bar.component.js";

export const handleToggleSpellcheck: CommandHandler = async ({ context }) => ({
  runOnMatch: async () => {
    const result = context.componentRefs.textEditor.toggleSpellcheck();
    context.notificationService.displayMessage(`Spellcheck is ${result ? "ON" : "OFF"}`);
  },
});
