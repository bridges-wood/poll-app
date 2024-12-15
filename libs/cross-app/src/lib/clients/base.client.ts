/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CrossAppClient {
  query: (...args: any[]) => Promise<any>;
  impersonating(token: string): CrossAppClient;
}
