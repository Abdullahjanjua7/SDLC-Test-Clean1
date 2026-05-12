import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @template T The type of data expected to be fetched.
 * @typedef {object} UseRealtimeDataOptions
 * @property {number | null | undefined} [intervalMs] The polling interval in milliseconds. If 0, null, or undefined, data is fetched only once.
 * @property {T} [initialData] Optional initial data to return before the first fetch.
 * @property {boolean} [enabled=true] If set to false, the hook will not fetch data or poll.
 * @property {React.DependencyList} [deps=[]] An array of dependencies that, when changed, will cause the data to be refetched immediately and the polling interval to be reset.
 */

/**
 * @template T The type of data expected to be fetched.
 * @typedef {object} UseRealtimeDataReturn
 * @property {T | undefined} data The fetched data. Undefined if no data has been fetched yet or an error occurred.
 * @property {boolean} loading True if data is currently being fetched.
 * @property {Error | undefined} error Any error that occurred during data fetching. Undefined if no error.
 * @property {() => Promise<void>} refetch A function to manually trigger a data refetch.
 */

/**
 * Custom hook for handling real-time data updates, typically via polling.
 * It fetches data initially and then at a specified interval.
 *
 * The `fetcher` function should be stable (e.g., wrapped in `useCallback`) if its dependencies
 * don't change frequently, to prevent unnecessary re-runs of the effect.
 *
 * @template T The type of data expected to be fetched.
 * @param {() => Promise<T>} fetcher An asynchronous function that returns the data.
 * @param {UseRealtimeDataOptions<T>} [options] Configuration options for the hook.
 * @returns {UseRealtimeDataReturn<T>} An object containing the data, loading state, error, and a refetch function.
 */
function useRealtimeData<T>(
  fetcher: () => Promise<T>,
  options?: {
    intervalMs?: number | null;
    initialData?: T;
    enabled?: boolean;
    deps?: React.DependencyList;
  }
): {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => Promise<void>;
} {
  const { intervalMs, initialData, enabled = true, deps = [] } = options || {};

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  // Ref to track if the component is mounted to prevent state updates on unmounted components
  const mountedRef = useRef(true);
  // Ref to store the interval ID for cleanup
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Asynchronous function to fetch data and update state.
   * This callback is memoized and will only re-create if the `fetcher` function changes.
   */
  const fetchData = useCallback(async () => {
    if (!mountedRef.current) return; // Prevent fetching if component is unmounted

    setLoading(true);
    setError(undefined); // Clear any previous errors

    try {
      const result = await fetcher();
      if (mountedRef.current) {
        setData(result);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(undefined); // Clear data on error
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetcher]); // Re-create fetchData if the provided fetcher function changes

  /**
   * Function to manually trigger a data refetch.
   * This will clear any existing polling interval, fetch data immediately,
   * and then restart the polling if it was enabled.
   */
  const refetch = useCallback(async () => {
    // Clear any existing interval to prevent immediate re-triggering from old interval
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    await fetchData(); // Perform an immediate fetch
    // If polling is enabled, restart it after manual refetch
    if (enabled && intervalMs && intervalMs > 0 && mountedRef.current) {
      intervalIdRef.current = setInterval(fetchData, intervalMs);
    }
  }, [fetchData, enabled, intervalMs]); // Dependencies for refetch

  /**
   * Effect hook to manage the data fetching and polling lifecycle.
   * It runs on mount, and whenever `enabled`, `intervalMs`, `fetchData`, or `deps` change.
   */
  useEffect(() => {
    mountedRef.current = true; // Mark component as mounted

    // If the hook is disabled, clear any existing interval and do not fetch
    if (!enabled) {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      // We keep the last fetched data and error state when disabled.
      return;
    }

    // Clear any existing interval before setting a new one to prevent duplicates
    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }

    // Perform an initial data fetch
    fetchData();

    // Set up polling if a valid intervalMs is provided
    if (intervalMs && intervalMs > 0) {
      intervalIdRef.current = setInterval(fetchData, intervalMs);
    }

    // Cleanup function: runs on unmount or before the effect re-runs
    return () => {
      mountedRef.current = false; // Mark component as unmounted
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current); // Clear the polling interval
        intervalIdRef.current = null;
      }
    };
  }, [enabled, intervalMs, fetchData, ...deps]); // Dependencies for the effect

  return { data, loading, error, refetch };
}