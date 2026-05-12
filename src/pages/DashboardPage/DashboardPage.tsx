import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Lazy load components for better performance (example)
const DashboardCard = lazy(() => import('./components/DashboardCard')); // Assume this component exists
const ActivityFeed = lazy(() => import('./components/ActivityFeed')); // Assume this component exists

// Define types for dashboard data
interface Metric {
  id: string;
  title: string;
  value: string;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
}

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
}

interface DashboardData {
  metrics: Metric[];
  recentActivities: Activity[];
  quickActions: { label: string; path: string }[];
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        // Simulate an error condition
        // if (Math.random() > 0.7) {
        //   throw new Error('Failed to load dashboard data.');
        // }

        const mockData: DashboardData = {
          metrics: [
            { id: '1', title: 'Total Sales', value: '$12,345', change: '+5%', changeType: 'increase' },
            { id: '2', title: 'New Users', value: '2,100', change: '+12%', changeType: 'increase' },
            { id: '3', title: 'Open Tickets', value: '45', change: '-2%', changeType: 'decrease' },
            { id: '4', title: 'Revenue', value: '$8,765', change: '+3%', changeType: 'increase' },
          ],
          recentActivities: [
            { id: 'a1', type: 'Order', description: 'New order #1001 placed by John Doe.', timestamp: '2 minutes ago' },
            { id: 'a2', type: 'User', description: 'Jane Smith registered a new account.', timestamp: '1 hour ago' },
            { id: 'a3', type: 'Product', description: 'Product "Premium Widget" updated.', timestamp: '3 hours ago' },
          ],
          quickActions: [
            { label: 'Create New Report', path: '/reports/new' },
            { label: 'Manage Users', path: '/users' },
            { label: 'View All Orders', path: '/orders' },
          ],
        };
        setDashboardData(mockData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRetry = () => {
    // Re-fetch data on retry
    window.location.reload(); // Simple retry, could be more sophisticated
  };

  if (isLoading) {
    return (
      <HelmetProvider>
          <title>Loading Dashboard - Your App</title>
          <meta name="description" content="Loading your personalized dashboard." />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 rounded-lg shadow-md bg-white">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-lg text-gray-700 font-medium">Loading Dashboard...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we fetch your data.</p>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  if (isError) {
    return (
      <HelmetProvider>
          <title>Error - Dashboard - Your App</title>
          <meta name="description" content="An error occurred while loading the dashboard." />
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8 rounded-lg shadow-md bg-white">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops! Something went wrong.</h2>
            <p className="text-gray-600 mb-4">We couldn't load your dashboard data. Please try again.</p>
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200"
            >
              Retry
            </button>
          </div>
        </div>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
        <title>Dashboard - Your App</title>
        <meta name="description" content="Your personalized dashboard with key metrics, recent activities, and quick actions." />
        <meta name="keywords" content="dashboard, metrics, analytics, activity, reports" />
        <link rel="canonical" href="https://your-app.com/dashboard" />

      <div className="min-h-screen bg-gray-100 p-6 md:p-10 font-sans">
        {/* Page Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight mb-2 sm:mb-0">Dashboard</h1>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/settings')}
              className="px-5 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-200 text-sm"
            >
              Settings
            </button>
            <button
              onClick={() => navigate('/help')}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 text-sm"
            >
              Help
            </button>
          </div>
        </header>

        {/* Main Content Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Section 1: Key Metrics */}
          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Suspense fallback={<div>Loading cards...</div>}>
                {dashboardData?.metrics.map(metric => (
                  <DashboardCard
                    key={metric.id}
                    title={metric.title}
                    value={metric.value}
                    change={metric.change}
                    changeType={metric.changeType}
                  />
                ))}
              </Suspense>
            </div>
          </section>

          {/* Section 2: Recent Activity */}
          <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Recent Activity</h2>
            <Suspense fallback={<div>Loading activity feed...</div>}>
              <ActivityFeed activities={dashboardData?.recentActivities || []} />
            </Suspense>
            <Link
              to="/activity-log"
              className="mt-6 inline-block text-blue-600 hover:text-blue-800 font-medium transition duration-200"
            >
              View All Activity &rarr;
            </Link>
          </section>

          {/* Section 3: Quick Actions */}
          <section className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
            <div className="space-y-4">
              {dashboardData?.quickActions.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition duration-200 group"
                >
                  <span className="text-gray-700 font-medium">{action.label}</span>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </Link>
              ))}
            </div>
          </section>

          {/* Section 4: Placeholder for Charts/Graphs (example) */}
          <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Performance Trends</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">
              <p>Chart/Graph integration goes here (e.g., Sales over time)</p>
            </div>
          </section>
        </main>

        {/* Footer (optional, often part of a global layout) */}
        <footer className="mt-10 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} Your App. All rights reserved.
        </footer>
      </div>
    </HelmetProvider>
  );
};

export default DashboardPage;