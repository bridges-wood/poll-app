import { DecodedIdToken } from '@org/typings';
import { jwtDecode } from 'jwt-decode';

export const getTokenExpirationDate = (token: string): Date => {
  const decodedToken = jwtDecode(token) as DecodedIdToken;

  return new Date(decodedToken.exp * 1000);
};
