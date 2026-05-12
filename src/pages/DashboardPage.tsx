import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Define types for dashboard data
interface WidgetData {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: 'up' | 'down' | 'neutral';
}

interface DashboardData {
  widgets: WidgetData[];
  lastUpdated: string;
}

const DashboardPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        // Simulate success or error randomly for demonstration
        if (Math.random() < 0.15) { // 15% chance of error
          throw new Error('Failed to load dashboard data.');
        }

        const mockData: DashboardData = {
          widgets: [
            { id: 'sales', title: 'Total Sales', value: '$12,345', description: 'Last 30 days', trend: 'up' },
            { id: 'users', title: 'Active Users', value: '2,456', description: 'Currently online', trend: 'up' },
            { id: 'orders', title: 'New Orders', value: '128', description: 'Today', trend: 'neutral' },
            { id: 'revenue', title: 'Monthly Revenue', value: '$8,765', description: 'This month', trend: 'up' },
            { id: 'conversion', title: 'Conversion Rate', value: '3.2%', description: 'Last 7 days', trend: 'down' },
            { id: 'support', title: 'Support Tickets', value: '15', description: 'Open tickets', trend: 'neutral' },
          ],
          lastUpdated: new Date().toLocaleString(),
        };
        setDashboardData(mockData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleNavigateToSettings = () => {
    navigate('/settings'); // Example navigation to a settings page
  };

  const getTrendIcon = (trend: WidgetData['trend']) => {
    switch (trend) {
      case 'up':
        return <span style={{ color: '#10B981', marginLeft: '0.5rem' }}>▲</span>; // Green up arrow
      case 'down':
        return <span style={{ color: '#EF4444', marginLeft: '0.5rem' }}>▼</span>; // Red down arrow
      case 'neutral':
      default:
        return <span style={{ color: '#6B7280', marginLeft: '0.5rem' }}>—</span>; // Gray dash
    }
  };

  return (
    <HelmetProvider>
        <title>Dashboard - Your App</title>
        <meta name="description" content="Main dashboard for an overview of your application's key metrics and widgets." />
        <meta name="keywords" content="dashboard, metrics, analytics, overview, app" />
        <link rel="canonical" href={window.location.href} />

      <div style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC', // Lightest gray background
        padding: '2rem',
        fontFamily: 'Inter, sans-serif', // Modern sans-serif font
        color: '#1F2937', // Dark gray text
        display: 'flex',
        flexDirection: 'column',
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #E2E8F0', // Light border
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#111827', // Even darker gray for heading
          }}>
            Dashboard Overview
          </h1>
          <button
            onClick={handleNavigateToSettings}
            style={{
              backgroundColor: '#4F46E5', // Indigo button
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#4338CA'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#4F46E5'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Go to Settings
          </button>
        </header>

        {isLoading && (
          <div style={{
            flexGrow: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '1rem',
            fontSize: '1.25rem',
            color: '#6B7280',
          }}>
            <div style={{
              border: '4px solid rgba(0, 0, 0, 0.1)',
              borderTop: '4px solid #4F46E5',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              animation: 'spin 1s linear infinite',
            }} />
            Loading dashboard data...
            {/* Keyframe for spin animation - typically in a global CSS file */}
            <style>
              {`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}
            </style>
          </div>
        )}

        {isError && (
          <div style={{
            flexGrow: 1,
            backgroundColor: '#FEF2F2', // Light red background
            color: '#EF4444', // Red text
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #FCA5A5',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: '500',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1.5rem',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: '3rem', height: '3rem', color: '#EF4444' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p>Oops! Something went wrong while loading your dashboard.</p>
            <button
              onClick={() => window.location.reload()} // Simple retry by reloading page
              style={{
                backgroundColor: '#EF4444',
                color: 'white',
                padding: '0.6rem 1.2rem',
                borderRadius: '0.375rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '500',
                transition: 'background-color 0.3s ease, transform 0.2s ease',
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#DC2626'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = '#EF4444'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && !isError && dashboardData && (
          <section style={{ flexGrow: 1 }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', // Responsive grid
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              {dashboardData.widgets.map(widget => (
                <div
                  key={widget.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // Modern shadow
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 20px -5px rgba(0, 0, 0, 0.15), 0 6px 8px -3px rgba(0, 0, 0, 0.08)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'; }}
                >
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontWeight: '600',
                    marginBottom: '0.75rem',
                    color: '#374151',
                  }}>
                    {widget.title}
                  </h3>
                  <div style={{
                    fontSize: '2.25rem',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    {widget.value} {getTrendIcon(widget.trend)}
                  </div>
                  {widget.description && (
                    <p style={{
                      fontSize: '0.9rem',
                      color: '#6B7280',
                    }}>
                      {widget.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <footer style={{
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#6B7280',
              paddingTop: '1rem',
              borderTop: '1px solid #E2E8F0',
            }}>
              Last updated: {dashboardData.lastUpdated}
            </footer>
          </section>
        )}

        {!isLoading && !isError && !dashboardData && (
          <div style={{
            flexGrow: 1,
            backgroundColor: '#FFFBEB', // Light yellow background
            color: '#D97706', // Orange text
            padding: '2rem',
            borderRadius: '0.75rem',
            border: '1px solid #FCD34D',
            textAlign: 'center',
            fontSize: '1.125rem',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            No dashboard data available. Please check back later.
          </div>
        )}
      </div>
    </HelmetProvider>
  );
};

export default DashboardPage;