import { Injectable, Logger } from '@nestjs/common';
import dns from 'dns/promises';
import ip from 'ip';
import { InstanceConfig } from './instance-config';

interface HostInfo {
  address: string;
  hostName: string;
}

@Injectable()
export class InstanceConfigurationService {
  private static readonly logger: Logger = new Logger(
    InstanceConfigurationService.name
  );
  private static readonly LEASE_EXPIRATION_DURATION_SECONDS = 90;
  private static readonly LEASE_RENEWAL_INTERVAL_SECONDS = 30;
  private static readonly NON_SECURE_PORT = 80;
  private static readonly SECURE_PORT = 443;
  private static readonly INSTANCE_ENABLED_ON_INIT = false;
  private static readonly hostInfo: HostInfo;

  private constructor() {}

  static async createConfig(): Promise<InstanceConfig> {
    return {
      instanceId: process.env['INSTANCE_ID'] || 'unknown',
      appName: process.env['APP_NAME'] || 'unknown',
      appGroupName: process.env['APP_GROUP_NAME'] || 'unknown',
      isInstanceEnabledOnInit:
        process.env['IS_INSTANCE_ENABLED_ON_INIT'] === 'true',
      nonSecurePort: InstanceConfigurationService.getNonSecurePort(),
      securePort: InstanceConfigurationService.getSecurePort(),
      isNonSecurePortEnabled:
        process.env['IS_NON_SECURE_PORT_ENABLED'] === 'true',
      isSecurePortEnabled: process.env['IS_SECURE_PORT_ENABLED'] === 'true',
      leaseRenewalIntervalInSecs:
        InstanceConfigurationService.LEASE_RENEWAL_INTERVAL_SECONDS,
      leaseExpirationDurationInSecs:
        InstanceConfigurationService.LEASE_EXPIRATION_DURATION_SECONDS,
      virtualHostName: await InstanceConfigurationService.getVirtualHostName(),
      secureVirtualHostName:
        await InstanceConfigurationService.getSecureVirtualHostName(),
      hostName: await InstanceConfigurationService.getHostName(),
      ipAddress: await InstanceConfigurationService.getIpAddress(),
    };
  }

  public static getNonSecurePort(): number {
    return parseInt(
      process.env['NON_SECURE_PORT'] ||
        InstanceConfigurationService.NON_SECURE_PORT.toString(),
      10
    );
  }

  public static getSecurePort(): number {
    return parseInt(
      process.env['SECURE_PORT'] ||
        InstanceConfigurationService.SECURE_PORT.toString(),
      10
    );
  }

  public static async getVirtualHostName() {
    return this.getHostName() + ':' + this.getNonSecurePort();
  }

  public static async getSecureVirtualHostName() {
    return this.getHostName() + ':' + this.getSecurePort();
  }

  public static async getIpAddress(refresh?: boolean): Promise<string> {
    if (!InstanceConfigurationService.hostInfo.address || refresh) {
      return (await InstanceConfigurationService.getHostInfo()).address;
    } else {
      return InstanceConfigurationService.hostInfo.address;
    }
  }

  private static async getHostName(refresh?: boolean): Promise<string> {
    if (!InstanceConfigurationService.hostInfo.hostName || refresh) {
      return (await InstanceConfigurationService.getHostInfo()).hostName;
    } else {
      return InstanceConfigurationService.hostInfo.hostName;
    }
  }

  private static async getHostInfo(): Promise<HostInfo> {
    try {
      const address = ip.address();
      const hostNames = await dns.reverse(address);
      return {
        address,
        hostName: hostNames[0],
      };
    } catch (error) {
      InstanceConfigurationService.logger.error('Cannot get host info', error);
      throw error;
    }
  }
}
