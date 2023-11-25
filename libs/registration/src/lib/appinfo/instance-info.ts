import { Lease } from '../lease/lease';
import { LeaseInfo } from '../lease/lease-info';

export enum InstanceStatus {
  UP = 'UP', // Ready to receive traffic
  DOWN = 'DOWN', // Do not send traffic- healthcheck callback failed
  STARTING = 'STARTING', // Just about starting- initializations to be done - do not send traffic
  OUT_OF_SERVICE = 'OUT_OF_SERVICE', // Intentionally shutdown for traffic
  UNKNOWN = 'UNKNOWN', // Status is unknown
}

export enum ActionType {
  ADDED = 'ADDED',
  MODIFIED = 'MODIFIED',
  DELETED = 'DELETED',
}

export class InstanceInfo {
  appName: string;
  id: string;
  ipAddr: string;
  healthCheckUrl: string;
  lease: Lease<InstanceInfo>;
  leaseInfo: LeaseInfo;
  private _status: InstanceStatus;
  private _overriddenStatus: InstanceStatus;
  private _lastDirtyTimestamp: number;
  private _lastUpdatedTimestamp: number;
  actionType: ActionType;
  isGraphQl: boolean;
  private _isDirty: boolean = false;
  metadata?: { [key: string]: unknown };

  constructor(instanceInfo: InstanceInfo) {
    this.appName = instanceInfo.appName;
    this.id = instanceInfo.id;
    this.ipAddr = instanceInfo.ipAddr;
    this.healthCheckUrl = instanceInfo.healthCheckUrl;
    this.lease = instanceInfo.lease;
    this.leaseInfo = instanceInfo.leaseInfo;
    this._status = instanceInfo.status;
    this._overriddenStatus = instanceInfo.overriddenStatus;
    this.actionType = instanceInfo.actionType;
    this.isGraphQl = instanceInfo.isGraphQl;
    this._lastUpdatedTimestamp = Date.now();
    this._lastDirtyTimestamp = this._lastUpdatedTimestamp;
  }

  get status(): InstanceStatus {
    return this._status;
  }

  /**
   * Set the status for this instance.
   *
   * @param status status for this instance.
   * @returns the previous status for this instance if the status is changed, null otherwise.
   */
  public setStatus(status: InstanceStatus): InstanceStatus | null {
    if (this._status !== status) {
      const prev = this._status;
      this._status = status;
      this.setIsDirty();
      return prev;
    }

    return null;
  }

  /**
   * Sets the overridden status for this instance. Normally set by an external
   * process to disable the instance from taking traffic.
   * @param status overridden status for this instance.
   */
  public setStatusWithoutDirty(status: InstanceStatus) {
    if (this._status !== status) {
      this._status = status;
    }
  }

  get overriddenStatus(): InstanceStatus {
    return this._overriddenStatus;
  }

  /**
   * Sets the overridden status for this instance. Normally set by an external
   * process to disable instance from taking traffic.
   *
   * @param status overridden status for this instance.
   */
  public setOverriddenStatus(status: InstanceStatus) {
    if (this._overriddenStatus !== status) {
      this._overriddenStatus = status;
    }
  }

  setLastDirtyTimestamp(timestamp: number = Date.now()) {
    this._lastDirtyTimestamp = timestamp;
  }

  get lastDirtyTimestamp(): number {
    return this._lastDirtyTimestamp;
  }

  setLastUpdatedTimestamp() {
    this._lastUpdatedTimestamp = Date.now();
  }

  get lastUpdatedTimestamp(): number {
    return this._lastUpdatedTimestamp;
  }

  get isDirty(): boolean {
    return this._isDirty;
  }

  setIsDirty() {
    this._isDirty = true;
    this._lastDirtyTimestamp = Date.now();
  }

  setIsDirtyWithTime(): number {
    this.setIsDirty();
    return this._lastDirtyTimestamp;
  }

  /**
   * Unset the dirty flag iff the unsetDirtyTimestamp is later than the dirtyTimestamp.
   * No-op otherwise.
   *
   * @param unsetDirtyTimestamp the expected lastDirtyTimestamp to unset.
   */
  unsetIsDirty(unsetDirtyTimestamp: number) {
    if (this.lastDirtyTimestamp <= unsetDirtyTimestamp) {
      this._isDirty = false;
    } else {
      /* empty */
    }
  }
}
