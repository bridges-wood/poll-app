import { InstanceInfo, InstanceStatus } from '../appinfo/instance-info';

export default class Application {
  private name: string;
  private _isDirty = false;
  private readonly _instances: Set<InstanceInfo>;
  private readonly _shuffledInstances: InstanceInfo[];
  private readonly _instancesMap: Map<string, InstanceInfo>;

  constructor(name?: string) {
    this.name = name;
    this._instances = new Set<InstanceInfo>();
    this._instancesMap = new Map<string, InstanceInfo>();
    this._shuffledInstances = [];
  }

  /**
   * Add the given instance to the application.
   *
   * @param i The instance info object to add to the application.
   */
  public addInstance(i: InstanceInfo) {
    this._instancesMap.set(i.id, i);
    this._instances.forEach((instance) => {
      if (instance.id === i.id) {
        this._instances.delete(instance);
      }
    });
    this._instances.add(i);
    this._isDirty = true;
  }

  /**
   * Remove the given instance from the application.
   * @param i The instance info object to remove from the application.
   * @param markAsDirty Marks the application as dirty if true.
   */
  public removeInstance(i: InstanceInfo, markAsDirty = true) {
    this._instancesMap.delete(i.id);
    this._instances.forEach((instance) => {
      if (instance.id === i.id) {
        this._instances.delete(instance);
      }
    });
    if (markAsDirty) {
      this._isDirty = true;
    }
  }

  /**
   * Gets the list of instances associated with this application.
   *
   * Note that instances are always returned with random order after shuffling
   * to avoid traffic to the same instances during startup.
   *
   * @returns the list of shuffled instances.
   */
  public getInstances(): InstanceInfo[] {
    return this._shuffledInstances;
  }

  /**
   * Gets the list of non-shuffled instances associated with this application.
   */
  public getInstancesAsIs(): InstanceInfo[] {
    return [...this._instances];
  }

  /**
   * Get the instance info for the given instance id.
   *
   * @param id The id for which the instance info is requested.
   * @returns The instance info for the given instance id, or undefined if not found.
   */
  public getInstanceById(id: string): InstanceInfo | undefined {
    return this._instancesMap.get(id);
  }

  /**
   * Get the name of the application.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Set the name of the application.
   *
   * @param name The name of the application.
   */
  public setName(name: string) {
    this.name = name;
  }

  /**
   * Get the number of instances associated with this application.
   */
  public size(): number {
    return this._instances.size;
  }

  /**
   * Shuffles the list of instances in the application and stores it for future use.
   *
   * @param filterUpInstances indicates whether to filter out instances that are not UP.
   */
  public shuffleAndStoreInstances(filterUpInstances: boolean): void {
    this._shuffledInstances.length = 0;
    this._instances.forEach((instance) => {
      if (!filterUpInstances || instance.status === InstanceStatus.UP) {
        this._shuffledInstances.push(instance);
      }
    });
    this._shuffledInstances.sort((_a, _b) => {
      return Math.random() > 0.5 ? 1 : -1;
    });
  }
}
