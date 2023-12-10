import { User } from '@org/graphql';
import {
  User as FirebaseUser,
  Unsubscribe,
  onIdTokenChanged,
} from 'firebase/auth';
import {
  FC,
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { auth } from '../database/firebase';

export interface IAuthContext {
  user?: FirebaseUser;
  account?: User;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext>({} as IAuthContext);

export const useAuth = () => useContext(AuthContext);

export const AuthContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [{ user, account }, setData] = useState<
    Pick<IAuthContext, 'user' | 'account'>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUser: Unsubscribe;
    const unsubAuth = onIdTokenChanged(auth, async (newUser) => {
      setLoading(true);
      if (newUser) {
        const token = await newUser.getIdToken();
        localStorage.setItem('token', token);

        if (newUser.uid === user?.uid) return setLoading(false);

        unsubUser = streamUser()
      }
    });
  });
};
