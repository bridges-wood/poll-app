import { registerUrql } from '@urql/next/rsc';
import { ClientFactory } from './client-factory';

const factory = new ClientFactory({ isClientSide: false });

const { getClient } = registerUrql(factory.getClient.bind(factory));

export default getClient;
