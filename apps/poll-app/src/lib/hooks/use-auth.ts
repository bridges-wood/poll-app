import { RootState } from '@poll-app/lib/store';
import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { token, isLoggedIn } = useSelector((state: RootState) => state.auth);

  return { token, isLoggedIn };
};
