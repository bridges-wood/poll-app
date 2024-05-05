'use client';

import { store } from '@poll-app/lib/store';
import { FC, PropsWithChildren } from 'react';
import { Provider } from 'react-redux';

const StoreProvider: FC<PropsWithChildren> = ({ children }) => {
  return <Provider store={store}>{children}</Provider>;
};

export default StoreProvider;
