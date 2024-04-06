export interface DecodedIdToken {
  /**
   * Issuer identifier for the issuer of the response. The iss value is a case-sensitive URL using the https scheme that contains scheme, host, and optionally, port number and path components and no query or fragment components.
   */
  iss: string;
  /**
   * Subject identifier. A locally unique and never reassigned identifier within the issuer for the end-user, which is intended to be consumed by the client.
   */
  sub: string;
  /**
   * Audience(s) that this ID token is intended for. It MUST contain the OAuth 2.0 client_id of the application as an audience value.
   */
  aud: string | string[];
  /**
   * Expiration time on or after which the ID token MUST NOT be accepted for processing.
   */
  exp: number;
  /**
   * Time at which the JWT was issued.
   */
  iat: number;
  /**
   * Authentication Methods References.
   */
  amr: string[];
}
