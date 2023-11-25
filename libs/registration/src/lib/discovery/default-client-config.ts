import _ from 'lodash';
import { ClientConfig } from './client-config';

export default class DefaultClientConfig implements ClientConfig {
  registryFetchIntervalSeconds: number;
  instanceInfoReplicationIntervalSeconds: number;
  initialInstanceInfoReplicationIntervalSeconds: number;
  discoveryServicePollIntervalSeconds: number;
  discoverServerReadTimeoutSeconds: number;
  discoveryServerConnectTimeoutSeconds: number;
  discoverServerTotalConnections: number;
  discoveryServerPort: number;
  shouldRegisterWithEureka: boolean;
  shouldUnregisterOnShutdown: boolean;
  getEurekaServiceUrls(): string[] {
    throw new Error('Method not implemented.');
  }
  shouldFilterOnlyUpInstances: boolean;
  discoveryConnectionIdleTimeoutSeconds: number;
  shouldEnforceFetchRegistryAtInit: boolean;
  shouldOnDemandUpdateStatusChange: boolean;
  shouldFetchRegistry: boolean;
  namespace: string;

  constructor(namespace: string = 'eureka') {
    this.namespace = namespace.endsWith('.') ? namespace : namespace + '.';
    this.registryFetchIntervalSeconds = parseInt(
      _.defaultTo(process.env['REGISTRY_REFRESH_INTERVAL'], '30')
    );
    this.instanceInfoReplicationIntervalSeconds = parseInt(
      _.defaultTo(process.env['REGISTRATION_REPLICATION_INTERVAL'], '30')
    );
    this.initialInstanceInfoReplicationIntervalSeconds = parseInt(
      _.defaultTo(process.env['INITIAL_REGISTRATION_REPLICATION_DELAY'], '30')
    );
    this.discoveryServicePollIntervalSeconds =
      parseInt(
        _.defaultTo(process.env['DISCOVERY_SERVER_URL_POLL_INTERVAL'], '300000')
      ) / 1000;
    this.discoverServerReadTimeoutSeconds = parseInt(
      _.defaultTo(process.env['DISCOVERY_SERVER_READ_TIMEOUT'], '8')
    );
    this.discoverServerReadTimeoutSeconds = parseInt(
      _.defaultTo(process.env['DISCOVERY_SERVER_CONNECTION_TIMEOUT'], '5')
    );
    this.discoveryServerConnectTimeoutSeconds = parseInt(
      _.defaultTo(process.env['DISCOVERY_SERVER_CONNECTION_TIMEOUT'], '5')
    );
    this.discoverServerTotalConnections = parseInt(
      _.defaultTo(process.env['DISCOVERY_SERVER_TOTAL_CONNECTIONS'], '200')
    );
    this.discoveryServerPort = parseInt(
      process.env['DISCOVERY_SERVER_PORT'] || '8761'
    );
    this.shouldRegisterWithEureka =
      process.env['REGISTRATION_ENABLED'] === 'true';
    this.shouldUnregisterOnShutdown =
      process.env['UNREGISTER_ON_SHUTDOWN'] === 'true';
    this.shouldFilterOnlyUpInstances =
      process.env['SHOULD_FILTER_ONLY_UP_INSTANCES'] === 'true';
    this.discoveryConnectionIdleTimeoutSeconds = parseInt(
      _.defaultTo(process.env['DISCOVERY_CONNECTION_IDLE_TIMEOUT'], '45')
    );
    this.shouldEnforceFetchRegistryAtInit =
      process.env['SHOULD_ENFORCE_FETCH_REGISTRY_AT_INIT'] === 'true';
    this.shouldOnDemandUpdateStatusChange =
      process.env['SHOULD_ON_DEMAND_UPDATE_STATUS_CHANGE'] === 'true';
    this.shouldFetchRegistry = process.env['FETCH_REGISTRY_ENABLED'] === 'true';
  }
}
