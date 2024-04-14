import { registerApolloClient } from '@apollo/experimental-nextjs-app-support/rsc';
import { client } from '@org/graphql/server';

const { getClient } = registerApolloClient(() => client);

const wrappedClient = getClient();

export default wrappedClient;
