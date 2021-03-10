import { define } from "./lib/define";
import { report } from "./lib/report";
import { run } from "./lib/run";
import { schedule } from "./lib/schedule";

export { expect } from "./lib/assert";
export { describe, it } from "./lib/define";

export interface TextConfig {
  /**
   * @default: false
   */
  quiteReport?: boolean;
}

export async function test(config?: TextConfig) {
  const suiteDefinitions = define();

  const scheduledSuites = schedule(suiteDefinitions);

  const summary = await run(scheduledSuites);

  await report(summary, { quite: config?.quiteReport });
}
