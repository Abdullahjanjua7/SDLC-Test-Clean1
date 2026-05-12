import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * @template T The type of the data being updated in real-time.
 * @param {() => Promise<T>} fetcher A function that returns a Promise resolving to the latest data.
 *   This function will be called periodically for polling or manually via `refetch`.
 * @param {object} [options] Configuration options for the real-time updates.
 * @param {number} [options.intervalMs=0] The polling interval in milliseconds. If 0 or not provided,
 *   polling is disabled by default, but data can still be fetched manually or updated externally.
 * @param {T} [options.initialData] Initial data to set before the first fetch.
 * @param {boolean} [options.enabled=true] If set to `false`, the hook will not perform initial fetches
 *   or polling until it becomes `true`. Manual `refetch` or `updateData` can still be used.
 * @returns {object} An object containing the real-time data, loading state, error, and control functions.
 * @returns {T | undefined} return.data The current real-time data.
 * @returns {boolean} return.loading True if data is currently being fetched or updated.
 * @returns {Error | undefined} return.error Any error that occurred during data fetching.
 * @returns {() => Promise<void>} return.refetch A function to manually trigger an immediate data fetch.
 * @returns {() => void} return.startPolling A function to explicitly start polling if it's currently stopped
 *   and `intervalMs` is greater than 0.
 * @returns {() => void} return.stopPolling A function to explicitly stop any active polling.
 * @returns {(newData: T) => void} return.updateData A function to manually update the data state.
 *   Useful for external real-time sources like WebSockets to push new data into the hook.
 */
export function useRealtimeUpdates<T>(
  fetcher: () => Promise<T>,
  options?: {
    intervalMs?: number;
    initialData?: T;
    enabled?: boolean;
  }
) {
  const { intervalMs = 0, initialData, enabled = true } = options || {};

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | undefined>(undefined);

  const intervalRef = useRef<number | null>(null); // Stores the ID of the setInterval timer
  const fetcherRef = useRef(fetcher); // Use ref to ensure the latest fetcher is always used

  // Update fetcherRef whenever the fetcher function changes
  useEffect(() => {
    fetcherRef.current = fetcher;
  }, [fetcher]);

  /**
   * Internal function to perform a data fetch.
   * It uses the `fetcherRef.current` to always call the latest `fetcher` function.
   */
  const fetchData = useCallback(async () => {
    if (!enabled) {
      // If the hook is disabled, do not perform fetches.
      return;
    }
    setLoading(true);
    setError(undefined); // Clear previous errors on new fetch attempt
    try {
      const result = await fetcherRef.current();
      setData(result);
    } catch (err: unknown) {
      // Ensure the error is an Error object
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [enabled]); // Only re-create if `enabled` changes

  /**
   * Stops any active polling interval.
   */
  const stopPolling = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Starts polling if `intervalMs` is greater than 0 and the hook is `enabled`.
   * Clears any existing interval before starting a new one.
   */
  const startPolling = useCallback(() => {
    if (intervalMs > 0 && enabled) {
      stopPolling(); // Ensure no duplicate intervals
      intervalRef.current = setInterval(() => {
        fetchData();
      }, intervalMs);
    }
  }, [intervalMs, enabled, fetchData, stopPolling]);

  /**
   * Manually triggers an immediate data fetch.
   * @returns {Promise<void>} A promise that resolves when the fetch is complete.
   */
  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  /**
   * Manually updates the data state of the hook.
   * This is useful for integrating with external real-time sources (e.g., WebSockets)
   * that push data directly, bypassing the `fetcher` function.
   * @param {T} newData The new data to set.
   */
  const updateData = useCallback((newData: T) => {
    setData(newData);
    setError(undefined); // Clear any error if data is successfully updated externally
  }, []);

  // Main effect to manage initial fetch and polling lifecycle
  useEffect(() => {
    // If the hook is disabled, stop polling and do not perform initial fetch.
    if (!enabled) {
      stopPolling();
      return;
    }

    // Perform an initial data fetch when the hook becomes enabled or dependencies change.
    fetchData();

    // Manage polling based on `intervalMs`
    if (intervalMs > 0) {
      startPolling();
    } else {
      // If intervalMs is 0 or less, ensure polling is stopped.
      stopPolling();
    }

    // Cleanup function: clear the interval when the component unmounts
    // or when `enabled`, `intervalMs`, `fetchData`, or `stopPolling` dependencies change.
    return () => {
      stopPolling();
    };
  }, [enabled, intervalMs, fetchData, startPolling, stopPolling]);

  return {
    data,
    loading,
    error,
    refetch,
    startPolling,
    stopPolling,
    updateData,
  };
}