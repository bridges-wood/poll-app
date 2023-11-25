import { InstanceInfo } from '../appinfo/instance-info';
import { DEFAULT_LEASE_DURATION } from './lease-info';

export enum LeaseAction {
  REGISTER,
  CANCEL,
  RENEW,
}

export class Lease<T extends InstanceInfo> {
  private holder: T;
  private evictionTimestamp: number;
  private registrationTimestamp: number;
  private serviceUpTimestamp: number;
  private lastUpdateTimestamp: number;
  private duration: number;

  constructor(r: T, durationInSecs: number = DEFAULT_LEASE_DURATION) {
    this.holder = r;
    this.registrationTimestamp = Date.now();
    this.lastUpdateTimestamp = this.registrationTimestamp;
    this.duration = durationInSecs * 1000;
  }

  /**
   * Renew the lease, use renewal duration if it was specified by the associated {@link T}
   * during registration, otherwise use default duration {@link DEFAULT_LEASE_DURATION}.
   */
  public renew() {
    this.lastUpdateTimestamp = Date.now() + this.duration;
  }

  /**
   * Cancel the lease by updating the eviction timestamp.
   */
  public cancel() {
    if (this.evictionTimestamp <= 0) {
      this.evictionTimestamp = Date.now();
    }
  }

  /**
   * Mark the service as up. This will only take effect the first time called after the lease
   * is created.
   */
  public serviceUp() {
    if (this.serviceUpTimestamp === 0) {
      this.serviceUpTimestamp = Date.now();
    }
  }

  /**
   * Sets the service up timestamp
   */
  public setServiceUpTimestamp(serviceUpTimestamp: number) {
    this.serviceUpTimestamp = serviceUpTimestamp;
  }

  /**
   * Checks if the lease of a given {@link T} is expired or not.
   * @param additionalLeaseMs additional lease time in milliseconds
   */
  public isExpired(additionalLeaseMs?: number): boolean {
    const now = Date.now();
    return (
      this.evictionTimestamp > 0 ||
      now > this.lastUpdateTimestamp + additionalLeaseMs
    );
  }

  /**
   * Gets the milliseconds since epoch when the lease was registered.
   */
  public getRegistrationTimestamp(): number {
    return this.registrationTimestamp;
  }

  /**
   * Gets the milliseconds since epoch when the lease was last renewed.
   */
  public getLastUpdateTimestamp(): number {
    return this.lastUpdateTimestamp;
  }

  /**
   * Gets the milliseconds since epoch when the lease was evicted.
   */
  public getEvictionTimestamp(): number {
    return this.evictionTimestamp;
  }

  /**
   * Gets the milliseconds since epoch when the service was marked as up.
   */
  public getServiceUpTimestamp(): number {
    return this.serviceUpTimestamp;
  }

  /**
   * Returns the holder of the lease.
   */
  public getHolder(): T {
    return this.holder;
  }
}
