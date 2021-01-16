export class ProxyService {
  async get<ReplyType>(url: string) {
    const response = await fetch(url);

    const result: ReplyType = await response.json();
    return result;
  }

  async post<ReplyType, BodyType>(url: string, body: BodyType) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const result: ReplyType = await response.json();
    return result;
  }

  async put<ReplyType, BodyType>(url: string, body: BodyType) {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const result: ReplyType = await response.json();
    return result;
  }

  async delete() {
    throw new Error("Not implemented");
  }
}
