import { renderHook, act, waitFor } from '@testing-library/react-hooks';
import { useRealtimeUpdates } from './useRealtimeUpdates'; // Adjust the path as necessary

describe('useRealtimeUpdates', () => {
  let mockFetcher: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockFetcher = jest.fn();
    jest.spyOn(global, 'setInterval');
    jest.spyOn(global, 'clearInterval');
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.clearAllTimers();
    jest.restoreAllMocks();
  });

  // 1. Test the hook's initial state
  test('should return initial state and fetch data on mount if enabled', async () => {
    mockFetcher.mockResolvedValue('initial fetched data');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    // Initial state before first fetch completes
    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await waitForNextUpdate();

    // State after first fetch completes
    expect(result.current.data).toBe('initial fetched data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  test('should use initialData if provided, then fetch', async () => {
    mockFetcher.mockResolvedValue('fetched data');
    const initialData = 'initial data from options';

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { initialData })
    );

    // Initial state with initialData
    expect(result.current.data).toBe(initialData);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined();
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    await waitForNextUpdate();

    // State after fetch completes
    expect(result.current.data).toBe('fetched data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  test('should not fetch on mount if enabled is false', () => {
    mockFetcher.mockResolvedValue('fetched data');
    const initialData = 'initial data';

    const { result } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { initialData, enabled: false })
    );

    expect(result.current.data).toBe(initialData);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
    expect(mockFetcher).not.toHaveBeenCalled();
    expect(setInterval).not.toHaveBeenCalled();
  });

  // 2. Test all hook functions/methods & 3. Test different input scenarios

  test('should refetch data manually', async () => {
    mockFetcher.mockResolvedValueOnce('data 1').mockResolvedValueOnce('data 2');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    await waitForNextUpdate(); // Initial fetch
    expect(result.current.data).toBe('data 1');
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate(); // Manual refetch
    expect(result.current.data).toBe('data 2');
    expect(result.current.loading).toBe(false);
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  test('refetch should respect the enabled flag', async () => {
    mockFetcher.mockResolvedValue('data');

    const { result } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { enabled: false })
    );

    expect(result.current.loading).toBe(false);
    expect(mockFetcher).not.toHaveBeenCalled();

    act(() => {
      result.current.refetch();
    });

    // Since enabled is false, refetch should not trigger a fetch
    expect(result.current.loading).toBe(false);
    expect(mockFetcher).not.toHaveBeenCalled();
  });

  test('should start polling if intervalMs > 0 and enabled', async () => {
    mockFetcher.mockResolvedValueOnce('data 1').mockResolvedValueOnce('data 2').mockResolvedValueOnce('data 3');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100 })
    );

    // Initial fetch
    await waitForNextUpdate();
    expect(result.current.data).toBe('data 1');
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 100);

    // First poll
    act(() => {
      jest.advanceTimersByTime(100);
    });
    await waitForNextUpdate();
    expect(result.current.data).toBe('data 2');
    expect(mockFetcher).toHaveBeenCalledTimes(2);

    // Second poll
    act(() => {
      jest.advanceTimersByTime(100);
    });
    await waitForNextUpdate();
    expect(result.current.data).toBe('data 3');
    expect(mockFetcher).toHaveBeenCalledTimes(3);
  });

  test('should stop polling when stopPolling is called', async () => {
    mockFetcher.mockResolvedValue('data');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100 })
    );

    await waitForNextUpdate(); // Initial fetch
    expect(setInterval).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stopPolling();
    });

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1); // No new interval started

    // Advance timers, fetcher should not be called again
    act(() => {
      jest.advanceTimersByTime(100);
    });
    expect(mockFetcher).toHaveBeenCalledTimes(1); // Still only initial fetch
  });

  test('should start polling when startPolling is called', async () => {
    mockFetcher.mockResolvedValueOnce('data 1').mockResolvedValueOnce('data 2');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100, enabled: false })
    );

    // No initial fetch or polling
    expect(mockFetcher).not.toHaveBeenCalled();
    expect(setInterval).not.toHaveBeenCalled();

    // Enable and start polling manually
    act(() => {
      result.current.startPolling();
    });

    // Polling should not start if enabled is false
    expect(setInterval).not.toHaveBeenCalled();

    // Rerender with enabled: true
    const { rerender } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100, enabled: true })
    );

    await waitForNextUpdate(); // Initial fetch
    expect(mockFetcher).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.stopPolling();
    });
    expect(clearInterval).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.startPolling();
    });
    expect(setInterval).toHaveBeenCalledTimes(2); // New interval started

    act(() => {
      jest.advanceTimersByTime(100);
    });
    await waitForNextUpdate();
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  test('startPolling should clear existing interval before starting a new one', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100 })
    );

    await waitForNextUpdate(); // Initial fetch
    expect(setInterval).toHaveBeenCalledTimes(1);
    const firstIntervalId = (setInterval as jest.Mock).mock.results[0].value;

    act(() => {
      result.current.startPolling(); // Call startPolling again
    });

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(clearInterval).toHaveBeenCalledWith(firstIntervalId);
    expect(setInterval).toHaveBeenCalledTimes(2); // A new interval should be set
    expect((setInterval as jest.Mock).mock.results[1].value).not.toBe(firstIntervalId);
  });

  test('should update data manually using updateData', async () => {
    mockFetcher.mockResolvedValue('initial data');
    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    await waitForNextUpdate();
    expect(result.current.data).toBe('initial data');
    expect(result.current.loading).toBe(false);

    act(() => {
      result.current.updateData('new data from external source');
    });

    expect(result.current.data).toBe('new data from external source');
    expect(result.current.loading).toBe(false); // updateData should not change loading state
  });

  test('updateData should clear any existing error', async () => {
    const error = new Error('fetch failed');
    mockFetcher.mockRejectedValueOnce(error).mockResolvedValue('success');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    await waitForNextUpdate(); // Initial fetch fails
    expect(result.current.error).toEqual(error);

    act(() => {
      result.current.updateData('successful external update');
    });

    expect(result.current.data).toBe('successful external update');
    expect(result.current.error).toBeUndefined();
  });

  // 4. Test error conditions
  test('should handle fetcher errors', async () => {
    const error = new Error('Failed to fetch data');
    mockFetcher.mockRejectedValue(error);

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    expect(result.current.loading).toBe(true);
    await waitForNextUpdate();

    expect(result.current.data).toBeUndefined();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(error);
  });

  test('should clear error on successful refetch', async () => {
    const error = new Error('Failed to fetch data');
    mockFetcher.mockRejectedValueOnce(error).mockResolvedValueOnce('successful data');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    await waitForNextUpdate(); // Initial fetch fails
    expect(result.current.error).toEqual(error);
    expect(result.current.data).toBeUndefined();

    act(() => {
      result.current.refetch();
    });

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeUndefined(); // Error cleared on new fetch attempt
    await waitForNextUpdate(); // Refetch succeeds

    expect(result.current.data).toBe('successful data');
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeUndefined();
  });

  // 5. Test cleanup if applicable
  test('should stop polling on unmount', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result, waitForNextUpdate, unmount } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100 })
    );

    await waitForNextUpdate(); // Initial fetch
    expect(setInterval).toHaveBeenCalledTimes(1);

    unmount();

    expect(clearInterval).toHaveBeenCalledTimes(1);
  });

  test('should stop polling when intervalMs becomes 0', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ intervalMs }) => useRealtimeUpdates(mockFetcher, { intervalMs }),
      { initialProps: { intervalMs: 100 } }
    );

    await waitForNextUpdate(); // Initial fetch
    expect(setInterval).toHaveBeenCalledTimes(1);

    rerender({ intervalMs: 0 });

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1); // No new interval started
  });

  test('should stop polling when enabled becomes false', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ enabled }) => useRealtimeUpdates(mockFetcher, { intervalMs: 100, enabled }),
      { initialProps: { enabled: true } }
    );

    await waitForNextUpdate(); // Initial fetch
    expect(setInterval).toHaveBeenCalledTimes(1);

    rerender({ enabled: false });

    expect(clearInterval).toHaveBeenCalledTimes(1);
    expect(setInterval).toHaveBeenCalledTimes(1); // No new interval started
  });

  // 6. Use proper mocking for dependencies (already covered with jest.fn and fake timers)

  // 7. Include edge cases
  test('should use the latest fetcher function', async () => {
    let currentFetcher = jest.fn().mockResolvedValue('data 1');
    const { result, waitForNextUpdate, rerender } = renderHook(
      ({ fetcher }) => useRealtimeUpdates(fetcher),
      { initialProps: { fetcher: currentFetcher } }
    );

    await waitForNextUpdate(); // Initial fetch with data 1
    expect(result.current.data).toBe('data 1');
    expect(currentFetcher).toHaveBeenCalledTimes(1);

    // Update fetcher
    const newFetcher = jest.fn().mockResolvedValue('data 2');
    rerender({ fetcher: newFetcher });

    // Trigger refetch
    act(() => {
      result.current.refetch();
    });

    await waitForNextUpdate(); // Refetch with data 2
    expect(result.current.data).toBe('data 2');
    expect(currentFetcher).toHaveBeenCalledTimes(1); // Old fetcher not called again
    expect(newFetcher).toHaveBeenCalledTimes(1); // New fetcher called
  });

  test('should not start polling if intervalMs is 0, even if startPolling is called', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 0 })
    );

    expect(setInterval).not.toHaveBeenCalled();

    act(() => {
      result.current.startPolling();
    });

    expect(setInterval).not.toHaveBeenCalled();
  });

  test('should not start polling if enabled is false, even if startPolling is called', async () => {
    mockFetcher.mockResolvedValue('data');
    const { result } = renderHook(() =>
      useRealtimeUpdates(mockFetcher, { intervalMs: 100, enabled: false })
    );

    expect(setInterval).not.toHaveBeenCalled();

    act(() => {
      result.current.startPolling();
    });

    expect(setInterval).not.toHaveBeenCalled();
  });

  test('should handle rapid refetch calls correctly', async () => {
    mockFetcher.mockResolvedValueOnce('data A').mockResolvedValueOnce('data B').mockResolvedValueOnce('data C');

    const { result, waitForNextUpdate } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    await waitForNextUpdate(); // Initial fetch
    expect(result.current.data).toBe('data A');
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.refetch();
      result.current.refetch(); // Call refetch multiple times quickly
    });

    // The first refetch will set loading to true, subsequent ones will be ignored until loading is false
    // Or rather, the `fetchData` function is memoized by `useCallback` and will only execute if `enabled` changes.
    // However, the `fetchData` function itself checks `enabled` and then proceeds.
    // The `setLoading(true)` and `setLoading(false)` will still be called for each `await fetchData()`.
    // Let's refine this: `fetchData` is called, it sets loading true, then awaits. If another `refetch` is called
    // while the first `fetchData` is still awaiting, the second `fetchData` will also set loading true, then await.
    // The `finally` block will set loading false. The last one to resolve will determine the final state.
    // This test should verify that the *last* initiated fetch's result is what's stored.

    // Let's simulate a delay in fetcher to test this properly.
    let resolveFetch1: (value: string) => void;
    let resolveFetch2: (value: string) => void;
    let resolveFetch3: (value: string) => void;

    mockFetcher
      .mockImplementationOnce(() => new Promise(resolve => (resolveFetch1 = resolve)))
      .mockImplementationOnce(() => new Promise(resolve => (resolveFetch2 = resolve)))
      .mockImplementationOnce(() => new Promise(resolve => (resolveFetch3 = resolve)));

    const { result: result2, waitForNextUpdate: waitForNextUpdate2 } = renderHook(() =>
      useRealtimeUpdates(mockFetcher)
    );

    // Initial fetch starts
    expect(result2.current.loading).toBe(true);
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    // Trigger two more refetches before the first one resolves
    act(() => {
      result2.current.refetch(); // This is the 2nd call to mockFetcher
      result2.current.refetch(); // This is the 3rd call to mockFetcher
    });

    expect(mockFetcher).toHaveBeenCalledTimes(3); // All three fetches initiated

    // Resolve fetches in order
    act(() => {
      resolveFetch1('data A');
    });
    await waitForNextUpdate2(); // Data A is briefly set
    expect(result2.current.data).toBe('data A');
    expect(result2.current.loading).toBe(true); // Still loading because fetch2 and fetch3 are pending

    act(() => {
      resolveFetch2('data B');
    });
    await waitForNextUpdate2(); // Data B is briefly set
    expect(result2.current.data).toBe('data B');
    expect(result2.current.loading).toBe(true); // Still loading because fetch3 is pending

    act(() => {
      resolveFetch3('data C');
    });
    await waitForNextUpdate2(); // Data C is set
    expect(result2.current.data).toBe('data C');
    expect(result2.current.loading).toBe(false); // All fetches complete
  });
});