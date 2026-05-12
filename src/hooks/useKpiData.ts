import React, { useState, useEffect, useCallback } from 'react';

/**
 * Represents the structure of a Key Performance Indicator (KPI) data point.
 */
interface KpiData {
  /** The unique identifier for the KPI. */
  id: string;
  /** The human-readable name of the KPI. */
  name: string;
  /** The primary value of the KPI. */
  value: number;
  /** The unit of measurement for the KPI value (e.g., '%', '$', 'users'). */
  unit: string;
  /** The timestamp when this data point was recorded or last updated (ISO string). */
  timestamp: string;
  /** Optional: Indicates the trend of the KPI (e.g., 'up', 'down', 'stable'). */
  trend?: 'up' | 'down' | 'stable';
  /** Optional: Additional detailed information related to the KPI. */
  details?: Record<string, any>;
}

/**
 * Options for configuring the `useKpiData` hook.
 */
interface UseKpiDataOptions {
  /**
   * Whether to automatically fetch data when the hook mounts or its dependencies (kpiId, startDate, endDate) change.
   * @default true
   */
  autoFetch?: boolean;
  /**
   * Initial data to use before the first fetch completes. This can be useful for
   * server-side rendering or providing a default state.
   */
  initialData?: KpiData | null;
}

/**
 * The return type of the `useKpiData` hook.
 */
interface UseKpiDataReturn {
  /**
   * The fetched KPI data. It will be `null` if data has not yet been loaded,
   * an error occurred, or `initialData` was not provided.
   */
  data: KpiData | null;
  /**
   * A boolean indicating whether data is currently being fetched.
   */
  loading: boolean;
  /**
   * An `Error` object if an error occurred during fetching, otherwise `null`.
   */
  error: Error | null;
  /**
   * A function that can be called to manually refetch the KPI data.
   * Returns a Promise that resolves when the refetch operation is complete.
   */
  refetch: () => Promise<void>;
}

/**
 * Simulates an asynchronous API call to fetch KPI data.
 * This function is for demonstration purposes and would be replaced by actual API logic.
 *
 * @param kpiId The ID of the KPI to fetch.
 * @param startDate Optional start date for the data range.
 * @param endDate Optional end date for the data range.
 * @returns A Promise that resolves with `KpiData` or rejects with an `Error`.
 */
const fetchKpiDataApi = async (
  kpiId: string,
  startDate?: string | Date,
  endDate?: string | Date
): Promise<KpiData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate network error or server error (10% chance)
      if (Math.random() < 0.1) {
        return reject(new Error(`Failed to fetch data for KPI '${kpiId}'. Network error or server issue.`));
      }

      // Simulate data not found for a specific ID
      if (kpiId === 'kpi-404') {
        return reject(new Error(`KPI with ID '${kpiId}' not found.`));
      }

      // Generate mock data
      const value = parseFloat((Math.random() * 1000).toFixed(2));
      const trendOptions: Array<'up' | 'down' | 'stable'> = ['up', 'down', 'stable'];
      const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];

      resolve({
        id: kpiId,
        name: `KPI ${kpiId.toUpperCase().replace(/-/g, ' ')}`,
        value: value,
        unit: kpiId.includes('sales') ? '$' : (kpiId.includes('users') ? 'users' : '%'),
        timestamp: new Date().toISOString(),
        trend: trend,
        details: {
          startDate: startDate ? new Date(startDate).toISOString() : 'N/A',
          endDate: endDate ? new Date(endDate).toISOString() : 'N/A',
          source: 'Simulated API',
          queryTime: new Date().toISOString(),
        },
      });
    }, Math.random() * 1000 + 500); // Simulate 0.5s to 1.5s network delay
  });
};

/**
 * A custom React hook for fetching KPI-specific data.
 *
 * This hook manages the state for KPI data, loading status, and any errors
 * that occur during the data fetching process. It supports automatic fetching
 * on mount/dependency change and manual refetching.
 *
 * @param kpiId The unique identifier for the Key Performance Indicator.
 * @param startDate Optional. The start date for the data range (e.g., '2023-01-01' or a Date object).
 * @param endDate Optional. The end date for the data range (e.g., '2023-12-31' or a Date object).
 * @param options Optional configuration object for the hook.
 * @returns An object containing `data`, `loading`, `error`, and a `refetch` function.
 */
export function useKpiData(
  kpiId: string,
  startDate?: string | Date,
  endDate?: string | Date,
  options?: UseKpiDataOptions
): UseKpiDataReturn {
  const { autoFetch = true, initialData = null } = options || {};

  const [data, setData] = useState<KpiData | null>(initialData);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Memoized function to perform the actual data fetching.
   * It handles setting loading, error, and data states.
   */
  const fetchData = useCallback(async () => {
    if (!kpiId) {
      setError(new Error('KPI ID is required to fetch data.'));
      setData(null);
      setLoading(false); // Ensure loading is false if no kpiId
      return;
    }

    setLoading(true);
    setError(null); // Clear any previous errors
    try {
      const result = await fetchKpiDataApi(kpiId, startDate, endDate);
      setData(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err);
      } else {
        // Fallback for non-Error thrown values
        setError(new Error('An unknown error occurred during data fetching.'));
      }
      setData(null); // Clear data on error
    } finally {
      setLoading(false);
    }
  }, [kpiId, startDate, endDate]); // Dependencies for fetchData: re-create if these change

  /**
   * Effect hook to trigger data fetching.
   * Runs on mount and when `fetchData` or `autoFetch` changes.
   */
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch]);

  /**
   * Memoized function to manually refetch the KPI data.
   * This allows consumers of the hook to trigger a refresh.
   */
  const refetch = useCallback(async () => {
    await fetchData(); // Directly call the memoized fetchData function
  }, [fetchData]); // Dependency on fetchData

  return { data, loading, error, refetch };
}