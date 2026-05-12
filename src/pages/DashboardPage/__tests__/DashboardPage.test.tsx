import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from './DashboardPage'; // Assuming DashboardPage.tsx is in the same directory

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

// Mock lazy-loaded components
// We'll mock them as simple components that render immediately for testing purposes.
// This allows us to test their presence and props without dealing with actual lazy loading mechanics in unit tests.
jest.mock('./components/DashboardCard', () => ({
  __esModule: true,
  default: jest.fn(({ title, value, change, changeType }) => (
    <div data-testid="dashboard-card" className={`card-${changeType}`}>
      <h3>{title}</h3>
      <p>{value}</p>
      <span>{change}</span>
    </div>
  )),
}));

jest.mock('./components/ActivityFeed', () => ({
  __esModule: true,
  default: jest.fn(({ activities }) => (
    <div data-testid="activity-feed">
      {activities.map((activity: any) => (
        <div key={activity.id} data-testid={`activity-item-${activity.id}`}>
          {activity.description}
        </div>
      ))}
    </div>
  )),
}));

// Mock react-helmet-async to avoid actual DOM manipulation in tests
jest.mock('react-helmet-async', () => ({
  HelmetProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Helmet: () => null, // Or a simple div if needed for debugging
}));

describe('DashboardPage', () => {
  const user = userEvent.setup({ delay: null }); // Disable default delay for faster tests

  // Mock window.location.reload for the retry button
  const originalReload = window.location.reload;
  beforeAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { reload: jest.fn() },
    });
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalReload,
    });
  });

  beforeEach(() => {
    jest.useFakeTimers(); // Use fake timers to control setTimeout
    mockNavigate.mockClear(); // Clear mock calls before each test
    (window.location.reload as jest.Mock).mockClear(); // Clear reload mock calls
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); // Ensure all timers are cleared
    jest.useRealTimers(); // Restore real timers
  });

  it('should display a loading state initially', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Loading Dashboard...')).toBeInTheDocument();
    expect(screen.getByText('Please wait while we fetch your data.')).toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner often has role="status"
  });

  it('should display dashboard content after successful data fetch', async () => {
    render(<DashboardPage />);

    // Advance timers to simulate the API call completing
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    // Wait for the lazy components to resolve and the content to appear
    await waitFor(() => {
      expect(screen.queryByText('Loading Dashboard...')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Overview/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Recent Activity/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Quick Actions/i, level: 2 })).toBeInTheDocument();
    });

    // Check for specific data from mockData
    expect(screen.getByText('Total Sales')).toBeInTheDocument();
    expect(screen.getByText('$12,345')).toBeInTheDocument();
    expect(screen.getByText('New Users')).toBeInTheDocument();
    expect(screen.getByText('2,100')).toBeInTheDocument();

    expect(screen.getByText('New order #1001 placed by John Doe.')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith registered a new account.')).toBeInTheDocument();

    expect(screen.getByText('Create New Report')).toBeInTheDocument();
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('View All Orders')).toBeInTheDocument();

    // Check if lazy-loaded components are rendered
    expect(screen.getAllByTestId('dashboard-card')).toHaveLength(4);
    expect(screen.getByTestId('activity-feed')).toBeInTheDocument();
    expect(screen.getAllByTestId(/activity-item-/)).toHaveLength(3);
  });

  it('should display an error state if data fetching fails', async () => {
    // Temporarily mock the global setTimeout to simulate an error
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((callback: Function, ms?: number) => {
      if (ms === 1500) {
        // Simulate an error after the delay
        return originalSetTimeout(() => {
          // Manually trigger the error state by throwing
          // In a real scenario, you might mock the fetch API directly
          // For this component, we'll simulate the catch block being hit.
          // The component's useEffect has a commented-out error condition,
          // but for testing, we'll just ensure the error state is reachable.
          // A more robust way would be to mock the fetch call itself.
          // For now, we'll rely on the component's internal error handling.
          // To force an error, we can temporarily override setDashboardData and setIsError.
          // However, the current component structure makes it hard to inject an error
          // without modifying the source or using more advanced mocking.
          // Let's simulate by making the promise reject.
          // This requires modifying the component's useEffect slightly or mocking Promise.
          // A simpler approach for this specific test is to mock the state setters.
          // But that's not ideal.
          // Let's assume the component's internal logic for error handling works
          // and we just need to trigger the error state.
          // The easiest way to trigger the error state without modifying the component
          // is to mock the `fetchDashboardData` function itself if it were exported,
          // or to mock the `useState` hooks.
          // Given the current setup, the most direct way is to mock the `Promise`
          // that `setTimeout` returns, or to mock `Math.random` if the error condition
          // was active. Since it's commented out, we'll simulate the error by
          // directly setting the state in a test utility if possible, or by
          // making the `setTimeout` promise reject.

          // Let's try to mock the promise returned by setTimeout.
          // This is tricky because setTimeout doesn't return a promise directly.
          // The component uses `await new Promise(...)`. We can mock `Promise` constructor.
          const mockPromise = new Promise((_, reject) => {
            originalSetTimeout(() => reject(new Error('Failed to load dashboard data.')), ms);
          });
          return mockPromise;
        }, ms);
      }
      return originalSetTimeout(callback, ms);
    }) as any;

    render(<DashboardPage />);

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Oops! Something went wrong./i, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(/We couldn't load your dashboard data\. Please try again\./i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    // Restore original setTimeout
    global.setTimeout = originalSetTimeout;
  });

  it('should call window.location.reload when retry button is clicked', async () => {
    // Simulate error state first
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((callback: Function, ms?: number) => {
      if (ms === 1500) {
        const mockPromise = new Promise((_, reject) => {
          originalSetTimeout(() => reject(new Error('Failed to load dashboard data.')), ms);
        });
        return mockPromise;
      }
      return originalSetTimeout(callback, ms);
    }) as any;

    render(<DashboardPage />);

    await act(async () => {
      jest.advanceTimersByTime(1500);
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Retry/i }));

    expect(window.location.reload).toHaveBeenCalledTimes(1);

    // Restore original setTimeout
    global.setTimeout = originalSetTimeout;
  });

  it('should navigate to /settings when Settings button is clicked', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Settings/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Settings/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/settings');
  });

  it('should navigate to /help when Help button is clicked', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Help/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Help/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/help');
  });

  it('should navigate to /activity-log when "View All Activity" link is clicked', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /View All Activity/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('link', { name: /View All Activity/i }));
    expect(screen.getByRole('link', { name: /View All Activity/i })).toHaveAttribute('href', '/activity-log');
    // Note: Since we mocked Link as an <a> tag, we don't test `navigate` for Links directly,
    // but rather that the `href` attribute is correct.
  });

  it('should navigate to correct paths for quick actions', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('link', { name: /Create New Report/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Manage Users/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /View All Orders/i })).toBeInTheDocument();
    });

    expect(screen.getByRole('link', { name: /Create New Report/i })).toHaveAttribute('href', '/reports/new');
    expect(screen.getByRole('link', { name: /Manage Users/i })).toHaveAttribute('href', '/users');
    expect(screen.getByRole('link', { name: /View All Orders/i })).toHaveAttribute('href', '/orders');
  });

  it('should render the placeholder for charts/graphs', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Performance Trends/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByText(/Chart\/Graph integration goes here \(e\.g\., Sales over time\)/i)).toBeInTheDocument();
    });
  });

  it('should have appropriate accessibility roles and headings', async () => {
    render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Overview/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Recent Activity/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Quick Actions/i, level: 2 })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Performance Trends/i, level: 2 })).toBeInTheDocument();

      // Check for main content area
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Check for sections (though not explicitly defined with role="region", semantic HTML implies it)
      // We can check for the presence of the section headings within their respective areas.
      const overviewSection = screen.getByRole('heading', { name: /Overview/i, level: 2 }).closest('section');
      expect(overviewSection).toBeInTheDocument();
      expect(overviewSection).toHaveTextContent('Total Sales');
    });
  });

  it('should match snapshot for successful state', async () => {
    const { asFragment } = render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Dashboard/i, level: 1 })).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot for loading state', () => {
    const { asFragment } = render(<DashboardPage />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match snapshot for error state', async () => {
    const originalSetTimeout = global.setTimeout;
    global.setTimeout = ((callback: Function, ms?: number) => {
      if (ms === 1500) {
        const mockPromise = new Promise((_, reject) => {
          originalSetTimeout(() => reject(new Error('Failed to load dashboard data.')), ms);
        });
        return mockPromise;
      }
      return originalSetTimeout(callback, ms);
    }) as any;

    const { asFragment } = render(<DashboardPage />);
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Oops! Something went wrong./i, level: 2 })).toBeInTheDocument();
    });
    expect(asFragment()).toMatchSnapshot();

    global.setTimeout = originalSetTimeout;
  });
});