import { useState, useEffect, useCallback } from 'react';

/**
 * @typedef {object} UseDashboardDataReturn
 * @property {TData | null} data - The fetched dashboard data, or null if not yet loaded or an error occurred.
 * @property {boolean} loading - True if data is currently being fetched, false otherwise.
 * @property {Error | null} error - An Error object if fetching failed, null otherwise.
 * @property {() => Promise<void>} refetch - A function to manually re-fetch the dashboard data.
 */

/**
 * Custom hook to fetch and manage dashboard-specific data, including loading and error states.
 *
 * @template TData The expected type of the dashboard data. Defaults to `unknown`.
 * @param {string} url The API endpoint URL to fetch dashboard data from.
 * @param {RequestInit} [options] Optional standard `fetch` API options (e.g., headers, method, body).
 *                                 If `options` is an object, it should be memoized using `React.useMemo`
 *                                 to prevent unnecessary re-fetches if its content doesn't change.
 * @returns {UseDashboardDataReturn<TData>} An object containing the data, loading state, error, and a refetch function.
 */
function useDashboardData<TData = unknown>(
    url: string,
    options?: RequestInit
): {
    data: TData | null;
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
} {
    const [data, setData] = useState<TData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [triggerFetch, setTriggerFetch] = useState<number>(0); // Used to manually trigger refetch

    /**
     * Internal function to perform the data fetching.
     * Memoized with useCallback to ensure stability across renders unless its dependencies change.
     * @param {AbortSignal} abortSignal - Signal to abort the fetch request.
     */
    const fetchData = useCallback(async (abortSignal: AbortSignal) => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            const response = await fetch(url, { signal: abortSignal, ...options });

            if (!response.ok) {
                let errorMessage = `HTTP error! Status: ${response.status}`;
                try {
                    // Attempt to parse error message from response body if available
                    const errorBody = await response.json();
                    errorMessage = errorBody.message || errorMessage;
                } catch (jsonError) {
                    // If response is not JSON, use default message
                }
                throw new Error(errorMessage);
            }

            const result: TData = await response.json();
            setData(result);
        } catch (err) {
            if (err instanceof DOMException && err.name === 'AbortError') {
                // Fetch was aborted, typically on component unmount or dependency change.
                // This is not an error to report to the user.
                console.log('Fetch aborted:', url);
            } else if (err instanceof Error) {
                setError(err);
                setData(null); // Clear data on error
            } else {
                // Handle truly unknown error types
                setError(new Error('An unknown error occurred during data fetching.'));
                setData(null); // Clear data on error
            }
        } finally {
            setLoading(false);
        }
    }, [url, options]); // Dependencies for fetchData: url and options.
                       // If `options` is an object, it should be memoized by the consumer
                       // to prevent `fetchData` from changing unnecessarily.

    /**
     * useEffect hook to trigger data fetching on mount and when dependencies change.
     * Handles cleanup by aborting ongoing fetch requests.
     */
    useEffect(() => {
        const abortController = new AbortController();
        fetchData(abortController.signal);

        return () => {
            // Cleanup: abort any ongoing fetch when the component unmounts
            // or when dependencies (url, options, triggerFetch) change.
            abortController.abort();
        };
    }, [url, options, fetchData, triggerFetch]); // Re-run effect when url, options, fetchData, or triggerFetch changes.

    /**
     * Manually triggers a re-fetch of the dashboard data.
     * Memoized with useCallback to ensure stability.
     * @returns {Promise<void>} A promise that resolves when the refetch operation completes.
     */
    const refetch = useCallback(async () => {
        setTriggerFetch(prev => prev + 1); // Increment to trigger useEffect
    }, []);

    return { data, loading, error, refetch };
}