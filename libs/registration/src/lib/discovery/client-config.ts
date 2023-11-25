export interface ClientConfig {
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
  getEurekaServiceUrls(): string[];
  shouldFilterOnlyUpInstances: boolean;
  discoveryConnectionIdleTimeoutSeconds: number;
  shouldEnforceFetchRegistryAtInit: boolean;
  shouldOnDemandUpdateStatusChange: boolean;
  shouldFetchRegistry: boolean;
}
