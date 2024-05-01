import nookies from 'nookies';

export const useIsLoggedIn = () => {
  // Check token exists in cookies
  const token = nookies.get(null).token;
  return token;
};
