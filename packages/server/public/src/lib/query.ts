import type { OutputOrError } from "@system-two/server/src/lib/create-handler";

/**
 * @param {string} url
 * @param {any} input
 */
export async function query<OutputType, InputType>(url: string, input: InputType): Promise<OutputOrError<OutputType>> {
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
