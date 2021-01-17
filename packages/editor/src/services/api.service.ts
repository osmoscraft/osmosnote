import type { OutputOrError } from "@system-two/server/src/lib/create-handler";

export class ApiService {
  async fetch<OutputType, InputType>(url: string, input: InputType): Promise<OutputOrError<OutputType>> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      const result = (await response.json()) as OutputOrError<OutputType>;
      return result;
    } catch (error) {
      return {
        error,
      };
    }
  }
}
