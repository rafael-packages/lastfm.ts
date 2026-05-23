import type { LastFmClient } from "../LastFmClient";

export class BaseModule {
  protected client: LastFmClient;

  constructor(client: LastFmClient) {
    this.client = client;
  }

  protected request<T>(
    method: "GET" | "POST",
    params: Record<string, string | number | boolean | undefined>,
    signed = false,
  ): Promise<T> {
    return this.client.request<T>(method, params, signed);
  }
}
