/**
 * @param {string} url 
 * @param {any} input 
 */
export async function query(url, input) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    const result = (await response.json());
    return result;
  } catch (error) {
    return {
      error,
    };
  }
}