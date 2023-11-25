export interface LeaseManager<T> {
  /**
   * Assign a new {@link Lease} to the given {@link T}.
   *
   * @param r the {@link T} to be assigned a new {@link Lease}.
   * @param leaseDuration
   */
  register(r: T, leaseDuration?: number): void;

  /**
   * Cancel the {@link Lease} associated with the given <code>appName</code>.
   *
   * @param appName unique id of the application.
   * @returns true if the operation was successful, false otherwise.
   */
  cancel(appName: string): boolean;

  /**
   * Renew the {@link Lease} associated with the given <code>appName</code>.
   *
   * @param appName unique id of the application.
   */
  renew(appName: string): boolean;

  /**
   * Evict {@link T}s with expired {@link Lease}s.
   */
  evict(): void;
}
