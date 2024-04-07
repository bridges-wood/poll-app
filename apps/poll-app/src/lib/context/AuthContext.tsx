import { useRefreshTokenMutation } from '@org/graphql';
import _ from 'lodash';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
} from 'react';

export interface IAuthContext {
  logout: () => void;
}

const AuthContext = createContext({} as IAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [refreshToken] = useRefreshTokenMutation();

  useEffect(() => {
    const handle = setInterval(
      async () => {
        const token = parseCookies().token;
        if (!_.isEmpty(token)) {
          try {
            const { data } = await refreshToken();
            if (!_.isNil(data?.refreshToken)) {
              setCookie(null, 'token', data.refreshToken.token, {
                path: '/',
                secure: process.env.NODE_ENV === 'production',
              });
            } else {
              logout();
            }
          } catch (error) {
            // TODO error handling
            logout();
          }
        }
      },
      10 * 60 * 1000,
    );

    return () => clearInterval(handle);
  }, []);

  const logout = () => {
    destroyCookie(null, 'token');
    // TODO clear the cache
  };

  return (
    <AuthContext.Provider value={{ logout }}>{children}</AuthContext.Provider>
  );
};
