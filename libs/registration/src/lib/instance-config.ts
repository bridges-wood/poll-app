export interface InstanceConfig {
  instanceId: string;
  appName: string;
  appGroupName: string;
  isInstanceEnabledOnInit: boolean;
  nonSecurePort: number;
  securePort: number;
  isNonSecurePortEnabled: boolean;
  isSecurePortEnabled: boolean;
  leaseRenewalIntervalInSecs: number;
  leaseExpirationDurationInSecs: number;
  virtualHostName: string;
  secureVirtualHostName: string;
  hostName: string;
  ipAddress: string;
  statusPageUrl?: string;
  homePageUrl?: string;
  healthCheckUrl?: string;
  secureHealthCheckUrl?: string;
  metadata?: { [key: string]: unknown };
}
