import { User, useRefreshTokenMutation } from '@org/graphql';
import { DecodedIdToken } from '@org/typings';
import { jwtDecode } from 'jwt-decode';
import _ from 'lodash';
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useLocalStorage } from 'usehooks-ts';

export interface IAuthContext {
  accountId?: User['id'];
  logout: () => void;
}

const AuthContext = createContext({} as IAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [{ accountId }, setData] = useState<Pick<IAuthContext, 'accountId'>>(
    {},
  );
  const [token, setToken, clearToken] = useLocalStorage<string>('token', '');
  const [refreshToken] = useRefreshTokenMutation();

  // useEffect(() => {
  //   if (!_.isEmpty(token)) {
  //     const decoded: DecodedIdToken = jwtDecode(token);
  //     if (decoded.exp < Date.now() / 1000) {
  //       return logout();
  //     }
  //     setData({ accountId: decoded.sub });
  //   }
  // }, [token]);

  useEffect(() => {
    const handle = setInterval(
      async () => {
        if (!_.isEmpty(accountId)) {
          try {
            const { data } = await refreshToken();
            if (!_.isNil(data?.refreshToken)) {
              setToken(data.refreshToken.token);
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
  }, [accountId]);

  const logout = () => {
    clearToken();
    setData({});
  };

  return (
    <AuthContext.Provider value={{ accountId, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
