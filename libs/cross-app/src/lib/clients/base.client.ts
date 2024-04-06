export interface CrossAppClient {
  send: (payload: any, options: any) => Promise<any>;
  impersonating(token: string): CrossAppClient;
}
