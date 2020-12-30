export class ProxyService {
  async get<T>(url: string) {
    const response = await fetch(url);

    const result: T = await response.json();
    return result;
  }

  async post<T>(url: string, body: any) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result: T = await response.json();
    return result;
  }

  async put<T>(url: string, body: any) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result: T = await response.json();
    return result;
  }

  async delete() {
    throw new Error("Not implemented");
  }
}
