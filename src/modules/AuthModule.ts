import { BaseModule } from "./BaseModule";
import * as Types from "../types";

/**
 * Authentication-specific API endpoints (auth.*).
 */
export class AuthModule extends BaseModule {
  /**
   * Generates the API authentication URL to redirect users to Last.fm for permissions.
   */
  public getAuthUrl(callbackUrl?: string): string {
    return this.client.getAuthUrl(callbackUrl);
  }

  /**
   * Get a session key for a user using an authorized request token.
   */
  public async getSession(token: string): Promise<Types.AuthSessionResponse> {
    return this.request<Types.AuthSessionResponse>(
      "GET",
      {
        method: "auth.getSession",
        token,
      },
      true,
    );
  }

  /**
   * Get a web session key using username and an md5 auth token.
   * Utilized for native/mobile application logins.
   */
  public async getMobileSession(
    username: string,
    authToken: string,
  ): Promise<Types.AuthSessionResponse> {
    return this.request<Types.AuthSessionResponse>(
      "POST",
      {
        method: "auth.getMobileSession",
        username,
        authToken,
      },
      true,
    );
  }

  /**
   * Fetch an unauthorized request token.
   */
  public async getToken(): Promise<Types.AuthTokenResponse> {
    return this.request<Types.AuthTokenResponse>(
      "GET",
      {
        method: "auth.getToken",
      },
      true,
    );
  }
}
