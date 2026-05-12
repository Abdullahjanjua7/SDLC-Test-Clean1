import { renderHook, waitFor, act } from '@testing-library/react-hooks';
import { useDashboardData } from './useDashboardData'; // Adjust the path as necessary
import { enableFetchMocks } from 'jest-fetch-mock';
import React from 'react'; // Required for React.useMemo in tests

// Enable fetch mocks globally for Jest
enableFetchMocks();

describe('useDashboardData', () => {
    const TEST_URL = '/api/dashboard-data';
    const MOCK_SUCCESS_DATA = { message: 'Hello from dashboard!', value: 123 };
    const MOCK_ERROR_MESSAGE = 'Failed to retrieve dashboard information.';

    // Mock console.log to prevent test output pollution and to spy on abort messages
    let consoleLogSpy: jest.SpyInstance;

    beforeEach(() => {
        // Reset fetch mock before each test to ensure isolation
        fetchMock.resetMocks();
        // Spy on console.log to check for abort messages
        consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterEach(() => {
        // Restore original console.log after each test
        consoleLogSpy.mockRestore();
    });

    // 1. Test the hook's initial state
    test('should return initial state correctly', () => {
        const { result } = renderHook(() => useDashboardData(TEST_URL));

        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBeNull();
        expect(typeof result.current.refetch).toBe('function');
    });

    // 2. Test all hook functions/methods (data fetching)
    // 3. Test different input scenarios (default URL)
    // 6. Use proper mocking for dependencies (fetch)
    test('should fetch data successfully and update state', async () => {
        fetchMock.mockResponseOnce(JSON.stringify(MOCK_SUCCESS_DATA), { status: 200 });

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        // Initial state check before fetch completes
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toBeNull();
        expect(result.current.error).toBeNull();

        // Wait for the data to be fetched and state updated
        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(TEST_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }));
        expect(result.current.data).toEqual(MOCK_SUCCESS_DATA);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    // 4. Test error conditions (HTTP error with non-JSON body)
    test('should handle HTTP error responses with default message', async () => {
        fetchMock.mockResponseOnce('Not Found', { status: 404, statusText: 'Not Found' });

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('HTTP error! Status: 404');
    });

    // 4. Test error conditions (HTTP error with JSON error message)
    test('should handle HTTP error responses with custom JSON error message', async () => {
        const errorBody = { message: MOCK_ERROR_MESSAGE, code: 'DASHBOARD_NOT_FOUND' };
        fetchMock.mockResponseOnce(JSON.stringify(errorBody), {
            status: 404,
            statusText: 'Not Found',
            headers: { 'Content-Type': 'application/json' },
        });

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe(MOCK_ERROR_MESSAGE);
    });

    // 4. Test error conditions (Network error / fetch rejection)
    test('should handle network errors (fetch rejection)', async () => {
        fetchMock.mockRejectOnce(new Error('Failed to connect to server.'));

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect(result.current.error?.message).toBe('Failed to connect to server.');
    });

    // 4. Test error conditions (JSON parsing error for successful response)
    test('should handle JSON parsing errors for successful responses', async () => {
        fetchMock.mockResponseOnce('This is not valid JSON', { status: 200 });

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(result.current.data).toBeNull();
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        // The exact error message might vary slightly between Node versions,
        // but it should indicate a JSON parsing issue.
        expect(result.current.error?.message).toMatch(/JSON/i);
    });

    // 2. Test all hook functions/methods (refetch)
    test('should allow manual refetching of data', async () => {
        const INITIAL_DATA = { id: 1, name: 'Initial Dashboard' };
        const REFETCHED_DATA = { id: 2, name: 'Refetched Dashboard' };

        fetchMock.mockResponseOnce(JSON.stringify(INITIAL_DATA), { status: 200 });

        const { result } = renderHook(() => useDashboardData(TEST_URL));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(INITIAL_DATA);
        expect(fetchMock).toHaveBeenCalledTimes(1);

        // Prepare mock for the refetch call
        fetchMock.mockResponseOnce(JSON.stringify(REFETCHED_DATA), { status: 200 });

        // Trigger refetch
        act(() => {
            result.current.refetch();
        });

        // Expect loading to be true again during refetch, data should still be old
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toEqual(INITIAL_DATA);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(result.current.data).toEqual(REFETCHED_DATA);
        expect(result.current.error).toBeNull();
    });

    // 3. Test different input scenarios (changing URL)
    test('should refetch data when URL dependency changes', async () => {
        const URL_1 = '/api/data-set-1';
        const DATA_1 = { items: ['alpha', 'beta'] };
        const URL_2 = '/api/data-set-2';
        const DATA_2 = { items: ['gamma', 'delta'] };

        fetchMock.mockResponseOnce(JSON.stringify(DATA_1), { status: 200 });

        const { result, rerender } = renderHook(({ url }) => useDashboardData(url), {
            initialProps: { url: URL_1 },
        });

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(DATA_1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(URL_1, expect.any(Object));

        // Change URL and rerender the hook
        fetchMock.mockResponseOnce(JSON.stringify(DATA_2), { status: 200 });
        rerender({ url: URL_2 });

        // Expect loading to be true again, old data still present
        expect(result.current.loading).toBe(true);
        expect(result.current.data).toEqual(DATA_1);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(DATA_2);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenCalledWith(URL_2, expect.any(Object));
    });

    // 3. Test different input scenarios (changing options)
    test('should refetch data when options dependency changes (if memoized by consumer)', async () => {
        const DATA_WITH_HEADER_1 = { config: 'initial' };
        const DATA_WITH_HEADER_2 = { config: 'updated' };

        fetchMock.mockResponseOnce(JSON.stringify(DATA_WITH_HEADER_1), { status: 200 });

        const { result, rerender } = renderHook(
            ({ url, options }) => useDashboardData(url, options),
            {
                initialProps: {
                    url: TEST_URL,
                    // Simulate consumer memoizing options
                    options: React.useMemo(() => ({ headers: { 'X-Version': '1' } }), []),
                },
            }
        );

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(DATA_WITH_HEADER_1);
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            TEST_URL,
            expect.objectContaining({ headers: { 'X-Version': '1' } })
        );

        // Change options and rerender
        fetchMock.mockResponseOnce(JSON.stringify(DATA_WITH_HEADER_2), { status: 200 });
        rerender({
            url: TEST_URL,
            // Simulate consumer memoizing new options
            options: React.useMemo(() => ({ headers: { 'X-Version': '2' } }), []),
        });

        expect(result.current.loading).toBe(true);
        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.data).toEqual(DATA_WITH_HEADER_2);
        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(fetchMock).toHaveBeenCalledWith(
            TEST_URL,
            expect.objectContaining({ headers: { 'X-Version': '2' } })
        );
    });

    // 7. Include edge cases (options not memoized - should refetch)
    test('should refetch data if options object reference changes (even if content is shallowly equal)', async