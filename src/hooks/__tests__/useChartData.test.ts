import { renderHook, waitFor, act } from '@testing-library/react-hooks';
import { useChartData } from './your-hook-file'; // Adjust the path to your hook file

// Mock the internal mockFetchChartData function to control its behavior
// We'll define a default mock implementation and override it per test as needed.
const mockFetchChartData = jest.fn();

// Manually mock the module where mockFetchChartData is defined
// This assumes useChartData and mockFetchChartData are in the same file.
// If they are in separate files, you'd mock the file containing mockFetchChartData.
jest.mock('./your-hook-file', () => { // Adjust the path to your hook file
  const originalModule = jest.requireActual('./your-hook-file'); // Adjust the path
  return {
    ...originalModule,
    mockFetchChartData: mockFetchChartData, // Override the original with our mock
    useChartData: originalModule.useChartData, // Keep the original hook
  };
});

// Define some sample data for consistent testing
const SALES_CHART_DATA = {
  id: 'sales-chart',
  title: 'Quarterly Sales Performance',
  series: [
    { name: 'Product A', data: [120, 150, 130, 180] },
    { name: 'Product B', data: [80, 95, 110, 105] },
  ],
  categories: ['Q1', 'Q2', 'Q3', 'Q4'],
  unit: 'USD',
};

const TRAFFIC_CHART_DATA = {
  id: 'traffic-chart',
  title: 'Website Traffic Overview',
  series: [
    { name: 'Page Views', data: [5000, 5500, 6200, 5800, 6500] },
    { name: 'Unique Visitors', data: [3000, 3200, 3800, 3500, 4000] },
  ],
  categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  unit: 'Visitors',
};

describe('useChartData', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockFetchChartData.mockClear();
    // Provide a default successful mock implementation
    mockFetchChartData.mockImplementation((chartId: string) => {
      if (chartId === 'sales-chart') {
        return Promise.resolve(SALES_CHART_DATA);
      }
      if (chartId === 'traffic-chart') {
        return Promise.resolve(TRAFFIC_CHART_DATA);
      }
      return Promise.reject(new Error(`Chart with ID "${chartId}" not found.`));
    });
  });

  // 1. Test the hook's initial state
  test('should return initial state when no chartId is provided', () => {
    const { result } = renderHook(() => useChartData(null));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.refetch).toBe('function');
  });

  test('should return initial loading state when a valid chartId is provided', () => {
    const { result } = renderHook(() => useChartData('sales-chart'));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  // 2. Test successful data fetching
  test('should fetch and return chart data successfully', async () => {
    const { result } = renderHook(() => useChartData('sales-chart'));

    // Initial state check
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for the data to be fetched
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert final state
    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);
    expect(mockFetchChartData).toHaveBeenCalledWith('sales-chart');
  });

  // 3. Test different input scenarios
  test('should refetch data when chartId changes', async () => {
    const { result, rerender } = renderHook(({ chartId }) => useChartData(chartId), {
      initialProps: { chartId: 'sales-chart' },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);

    // Change chartId
    rerender({ chartId: 'traffic-chart' });

    // Should be loading again
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull(); // Data should be cleared on new fetch

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert new data
    expect(result.current.data).toEqual(TRAFFIC_CHART_DATA);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(2);
    expect(mockFetchChartData).toHaveBeenCalledWith('traffic-chart');
  });

  test('should reset state when chartId changes from valid to null/undefined', async () => {
    const { result, rerender } = renderHook(({ chartId }) => useChartData(chartId), {
      initialProps: { chartId: 'sales-chart' },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(SALES_CHART_DATA);

    rerender({ chartId: null });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1); // No new fetch should occur
  });

  test('should not fetch if chartId is an empty string', async () => {
    const { result } = renderHook(() => useChartData(''));

    // The hook's internal logic for empty string sets an error immediately
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Chart ID cannot be empty.');
    expect(mockFetchChartData).not.toHaveBeenCalled();
  });

  test('should not fetch if chartId is whitespace', async () => {
    const { result } = renderHook(() => useChartData('   '));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Chart ID cannot be empty.');
    expect(mockFetchChartData).not.toHaveBeenCalled();
  });

  // 4. Test error conditions
  test('should handle API fetch errors', async () => {
    const errorMessage = 'Failed to load data: Internal Server Error (500).';
    mockFetchChartData.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useChartData('error-chart'));

    // Initial state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();

    // Wait for error state
    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert error state
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);
    expect(mockFetchChartData).toHaveBeenCalledWith('error-chart');
  });

  test('should handle unknown chartId errors (404)', async () => {
    const errorMessage = 'Chart with ID "unknown-chart" not found.';
    mockFetchChartData.mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useChartData('unknown-chart'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
  });

  test('should handle non-Error rejections gracefully', async () => {
    mockFetchChartData.mockRejectedValueOnce('A string error message'); // Simulate a non-Error rejection

    const { result } = renderHook(() => useChartData('bad-error-chart'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('A string error message');
  });

  // 5. Test cleanup if applicable
  test('should not update state if component unmounts during fetch', async () => {
    // Make the mock fetch take longer than usual to ensure unmount happens mid-fetch
    mockFetchChartData.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve(SALES_CHART_DATA), 1000))
    );

    const { result, unmount } = renderHook(() => useChartData('sales-chart'));

    expect(result.current.loading).toBe(true);

    // Unmount the component while fetching is in progress
    unmount();

    // Wait for the fetch to theoretically complete (but state should not update)
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Wait longer than the mock timeout
    });

    // Assert that state remains as it was at unmount (or initial if unmounted immediately)
    // The hook's `isMounted` ref prevents updates, so the state should not change from its initial unmounted state.
    // However, renderHook's `result.current` reflects the last state *before* unmount.
    // The key is that no errors are thrown due to trying to set state on an unmounted component.
    expect(result.current.loading).toBe(true); // Still true because it was loading when unmounted
    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);
  });

  // 6. Test `refetch` functionality
  test('should refetch data when refetch function is called', async () => {
    const { result } = renderHook(() => useChartData('sales-chart'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);

    // Simulate a change in data for the refetch
    const UPDATED_SALES_DATA = { ...SALES_CHART_DATA, title: 'Updated Quarterly Sales' };
    mockFetchChartData.mockResolvedValueOnce(UPDATED_SALES_DATA);

    act(() => {
      result.current.refetch();
    });

    // Should be loading again
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull(); // Data should be cleared on refetch

    await waitFor(() => expect(result.current.loading).toBe(false));

    // Assert updated data
    expect(result.current.data).toEqual(UPDATED_SALES_DATA);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(2);
    expect(mockFetchChartData).toHaveBeenCalledWith('sales-chart');
  });

  test('should refetch and handle error if refetch fails', async () => {
    const { result } = renderHook(() => useChartData('sales-chart'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);

    const refetchErrorMessage = 'Refetch failed!';
    mockFetchChartData.mockRejectedValueOnce(new Error(refetchErrorMessage));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBeNull(); // Data cleared on refetch attempt

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(refetchErrorMessage);
    expect(mockFetchChartData).toHaveBeenCalledTimes(2);
  });

  // Edge case: refetching when chartId is null/undefined/empty
  test('should not attempt to refetch if chartId is invalid at the time of refetch', async () => {
    const { result, rerender } = renderHook(({ chartId }) => useChartData(chartId), {
      initialProps: { chartId: 'sales-chart' },
    });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);

    // Change chartId to null
    rerender({ chartId: null });
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    // Try to refetch
    act(() => {
      result.current.refetch();
    });

    // State should remain unchanged, no new fetch should occur
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1); // Still 1, no new call
  });

  test('should clear error when a successful refetch occurs after an error', async () => {
    const initialErrorMessage = 'Initial fetch failed!';
    mockFetchChartData.mockRejectedValueOnce(new Error(initialErrorMessage)); // First call fails

    const { result } = renderHook(() => useChartData('sales-chart'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(initialErrorMessage);
    expect(result.current.data).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(1);

    // Now, mock the next call to be successful
    mockFetchChartData.mockResolvedValueOnce(SALES_CHART_DATA);

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull(); // Error should be cleared immediately on refetch
    expect(result.current.data).toBeNull();

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.data).toEqual(SALES_CHART_DATA);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockFetchChartData).toHaveBeenCalledTimes(2);
  });
});