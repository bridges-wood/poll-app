import { InstanceInfo } from '../appinfo/instance-info';
import Application from './application';

export interface LookupService {
  /**
   * Returns the corresponding {@link Application} for the given <code>appName</code>.
   * @param appName
   * @returns a {@link Application} or null if not found.
   */
  getApplication(appName: string): Application | null;

  /**
   * Returns all {@link Application}s.
   * @returns a list of {@link Application}s.
   */
  getApplications(): Application[];

  /**
   * Gets the next possible server to process the requests from the registry
   * information received from eureka server.
   *
   * @param appName the application name for which the server needs to be fetched.
   * @param secure whether secure connection needs to be considered or not.
   *
   * @returns the next server to process the request.
   */
  getNextServerFromEureka(
    appName: string,
    secure: boolean
  ): InstanceInfo | null;
}
