import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Represents the structure of a single series within a chart.
 */
interface ChartSeries {
  name: string;
  data: number[];
}

/**
 * Represents the overall structure of the data for a single chart.
 */
interface ChartData {
  id: string;
  title: string;
  series: ChartSeries[];
  // Add any other properties relevant to your chart data, e.g., categories, labels, etc.
  [key: string]: any; // Allows for flexible additional properties
}

/**
 * The return type of the useChartData hook.
 */
interface UseChartDataResult {
  /** The fetched chart data. Null if not loaded or an error occurred. */
  data: ChartData | null;
  /** True if data is currently being fetched. */
  loading: boolean;
  /** An error object if fetching failed. Null otherwise. */
  error: Error | null;
  /** A function to manually refetch the chart data. */
  refetch: () => void;
}

/**
 * Simulates an asynchronous API call to fetch chart data.
 * In a real application, this would be replaced with actual `fetch` or an API client.
 *
 * @param chartId The ID of the chart to fetch.
 * @returns A promise that resolves with `ChartData` or rejects with an `Error`.
 */
const mockFetchChartData = (chartId: string): Promise<ChartData> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!chartId || chartId.trim() === '') {
        reject(new Error('Chart ID cannot be empty or whitespace.'));
        return;
      }

      // Simulate network error ~10% of the time
      if (Math.random() < 0.1) {
        reject(new Error('Network error: Failed to connect to chart service.'));
        return;
      }

      // Simulate different chart data based on ID
      if (chartId === 'sales-chart') {
        resolve({
          id: 'sales-chart',
          title: 'Quarterly Sales Performance',
          series: [
            { name: 'Product A', data: [120, 150, 130, 180] },
            { name: 'Product B', data: [80, 95, 110, 105] },
          ],
          categories: ['Q1', 'Q2', 'Q3', 'Q4'],
          unit: 'USD',
        });
      } else if (chartId === 'traffic-chart') {
        resolve({
          id: 'traffic-chart',
          title: 'Website Traffic Overview',
          series: [
            { name: 'Page Views', data: [5000, 5500, 6200, 5800, 6500] },
            { name: 'Unique Visitors', data: [3000, 3200, 3800, 3500, 4000] },
          ],
          categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          unit: 'Visitors',
        });
      } else if (chartId === 'error-chart') {
        // Simulate a server-side error for a specific ID
        reject(new Error(`Failed to load data for 'error-chart': Internal Server Error (500).`));
      } else {
        // Simulate a 404 Not Found for unknown IDs
        reject(new Error(`Chart with ID "${chartId}" not found (404).`));
      }
    }, Math.random() * 1500 + 500); // Simulate 0.5s to 2s network latency
  });
};

/**
 * Custom hook for fetching data for individual charts.
 *
 * This hook manages the asynchronous fetching of chart data,
 * including loading states, error handling, and a refetch mechanism.
 * It ensures proper cleanup to prevent state updates on unmounted components.
 *
 * @param chartId The unique identifier for the chart whose data is to be fetched.
 *                If `chartId` is `null`, `undefined`, or an empty string, no fetch will occur,
 *                and the hook will return a cleared state.
 * @returns An object containing:
 *          - `data`: The fetched `ChartData`, or `null` if not loaded or an error occurred.
 *          - `loading`: A boolean indicating if the data is currently being fetched.
 *          - `error`: An `Error` object if fetching failed, or `null` otherwise.
 *          - `refetch`: A function to manually trigger a data refetch for the current `chartId`.
 */
export const useChartData = (chartId: string | null | undefined): UseChartDataResult => {
  const [data, setData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0); // Used to trigger manual refetch

  // Ref to track if the component is mounted to prevent setting state on unmounted components
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []); // Runs once on mount, returns cleanup on unmount

  const fetchData = useCallback(async (id: string) => {
    if (!id || id.trim() === '') {
      if (isMounted.current) {
        setData(null);
        setError(new Error('Chart ID cannot be empty.'));
        setLoading(false);
      }
      return;
    }

    if (isMounted.current) {
      setLoading(true);
      setError(null); // Clear previous errors
      setData(null); // Clear previous data
    }

    try {
      const chartData = await mockFetchChartData(id);
      if (isMounted.current) {
        setData(chartData);
      }
    } catch (err: any) {
      if (isMounted.current) {
        // Ensure the error is an instance of Error
        setError(err instanceof Error ? err : new Error(String(err)));
        setData(null); // Clear data on error
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, []); // `fetchData` is stable and doesn't need to be recreated on re-renders

  useEffect(() => {
    if (chartId) {
      fetchData(chartId);
    } else {
      // If chartId is invalid, reset the hook's state
      if (isMounted.current) {
        setData(null);
        setError(null);
        setLoading(false);
      }
    }
  }, [chartId, fetchData, refetchTrigger]); // Re-run effect if chartId changes or refetch is triggered

  /**
   * Function to manually trigger a refetch of the chart data.
   * This will cause the `useEffect` to re-run the `fetchData` logic.
   */
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1);
  }, []); // `refetch` is stable and doesn't need to be recreated

  return { data, loading, error, refetch };
};