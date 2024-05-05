import { useSelector } from 'react-redux';
import { RootState } from '../store';

const useIsLoggedIn = () => {
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
  return isLoggedIn;
};

export default useIsLoggedIn;
