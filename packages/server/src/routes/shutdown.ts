import { createHandler } from "../lib/create-handler";

export interface ShutdownInput {}
export interface ShutdownOutput {}

export const handleShutdown = createHandler<ShutdownInput, ShutdownOutput>(async () => {
  setTimeout(() => {
    console.log(`[shutdown] shutdown success`);
    process.exit(0);
  }, 1000);
  console.log(`[shutdown] shutting down...`);
  return {};
});
