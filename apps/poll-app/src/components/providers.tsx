import { ApolloWrapper } from '@org/graphql';
import { FC, PropsWithChildren } from 'react';

const Providers: FC<PropsWithChildren> = ({ children }) => (
  <ApolloWrapper>{children}</ApolloWrapper>
);

export default Providers;
