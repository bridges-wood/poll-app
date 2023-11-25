export const DEFAULT_LEASE_RENEWAL_INTERVAL = 30;
export const DEFAULT_LEASE_DURATION = 90;

export interface LeaseInfo {
  registrationTimestamp?: number;
  lastRenewalTimestamp?: number;
  evictionTimestamp?: number;
  serviceUpTimestamp?: number;
  durationInSecs?: number;
  renewalIntervalInSecs?: number;
}
