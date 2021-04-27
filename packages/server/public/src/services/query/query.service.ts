import type { OutputSuccessOrError } from "@osmoscraft/osmosnote";

export class QueryService {
  /**
   * @param {string} url
   * @param {any} input
   */
  async query<OutputType, InputType>(url: string, input: InputType): Promise<OutputSuccessOrError<OutputType>> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return {
        error,
      };
    }
  }
}
