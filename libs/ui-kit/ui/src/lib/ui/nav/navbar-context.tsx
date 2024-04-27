import { createContext } from '../../utils/context';
import { UseNavbarReturn } from './use-navbar';

export const [NavbarProvider, useNavbarContext] =
  createContext<UseNavbarReturn>({
    name: 'NavbarContext',
    strict: true,
    errorMessage:
      'useNavbarContext: `context` is undefined. Seems you forgot to wrap component within the Provider',
  });
