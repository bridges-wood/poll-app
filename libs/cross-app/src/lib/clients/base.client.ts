export interface CrossAppClient {
  query: (payload: any, options: any) => Promise<any>;
  impersonating(token: string): CrossAppClient;
}
