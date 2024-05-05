import { createModel } from '@rematch/core';
import { destroyCookie, parseCookies } from 'nookies';
import { RootModel } from '.';

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
}

export const auth = createModel<RootModel>()({
  state: {
    isLoggedIn: (() => {
      const token = parseCookies().token;
      return !!token;
    })(),
    token: parseCookies().token || null,
  } as AuthState,
  reducers: {
    login(state, token: string) {
      return { ...state, isLoggedIn: true, token };
    },
    reset() {
      return { isLoggedIn: false, token: null };
    },
  },
  effects: (dispatch) => ({
    logout() {
      destroyCookie(null, 'token');
      dispatch.auth.reset();
    },
  }),
});
