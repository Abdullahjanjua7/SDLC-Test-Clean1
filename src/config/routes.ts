import React from 'react';

// --- Interfaces ---

/**
 * Defines the structure for a single application route.
 * This interface provides type safety and clarity for route configurations.
 */
export interface RouteConfig {
  /**
   * The URL path for the route. Can include parameters (e.g., "/users/:id").
   * This property is mandatory for all routes.
   */
  path: string;
  /**
   * The React component to render when this route matches.
   * This can be a directly imported component or a lazily loaded component
   * using `React.lazy(() => import('./path/to/Component'))`.
   * This property is optional if `redirect` or `children` are present.
   */
  component?: React.ComponentType<any> | React.LazyExoticComponent<React.ComponentType<any>>;
  /**
   * If `true`, the route will only match if the path is an exact match.
   * Defaults to `false`.
   */
  exact?: boolean;
  /**
   * A human-readable name for the route, often used in navigation menus,
   * breadcrumbs, or page titles.
   */
  name?: string;
  /**
   * An optional icon identifier (e.g., a string name from an icon library)
   * useful for displaying alongside the route name in navigation.
   */
  icon?: string;
  /**
   * If `true`, this route requires user authentication to be accessed.
   * An authentication guard should check this property.
   */
  auth?: boolean;
  /**
   * An array of specific roles (e.g., 'admin', 'editor', 'user') required
   * to access this route. Only applicable if `auth` is `true`.
   * A role-based access control (RBAC) guard should check this.
   */
  roles?: string[];
  /**
   * If provided, this route will automatically redirect to the specified path
   * instead of rendering a component. Useful for default routes or
   * authentication redirects.
   */
  redirect?: string;
  /**
   * An array of child `RouteConfig` objects, used for defining nested routes.
   * The parent route's path will be prefixed to the child routes' paths.
   */
  children?: RouteConfig[];
  /**
   * Any additional props to pass directly to the route component when rendered.
   */
  props?: Record<string, any>;
  /**
   * If `true`, this route should not be displayed in main navigation menus.
   * Useful for utility routes like 404 pages or detail pages.
   */
  hidden?: boolean;
}

/**
 * Type definition for the entire application's routes configuration,
 * which is an array of `RouteConfig` objects.
 */
export type RoutesConfig = RouteConfig[];

// --- Component Imports (Simulated for demonstration purposes) ---
// In a real application, these paths would point to your actual component files.
// Using React.lazy for code splitting is a best practice for performance.
// Ensure your components are default exports for React.lazy to work correctly.

const HomePage = React.lazy(() => import('../pages/Home'));
const AboutPage = React.lazy(() => import('../pages/About'));
const DashboardPage = React.lazy(() => import('../pages/Dashboard'));
const ProfilePage = React.lazy(() => import('../pages/Profile'));
const LoginPage = React.lazy(() => import('../pages/Auth/Login'));
const RegisterPage = React.lazy(() => import('../pages/Auth/Register'));
const NotFoundPage = React.lazy(() => import('../pages/NotFound'));
const SettingsPage = React.lazy(() => import('../pages/Settings'));
const UserListPage = React.lazy(() => import('../pages/Users/UserList'));
const UserDetailPage = React.lazy(() => import('../pages/Users/UserDetail'));
const AdminDashboardPage = React.lazy(() => import('../pages/Admin/AdminDashboard'));

// --- Application Route Definitions ---

/**
 * Defines the main application routes. This array is the central configuration
 * for your application's navigation and component rendering based on URL paths.
 *
 * Best practices:
 * - Define more specific routes before more general ones.
 * - Place the 404 (catch-all) route last.
 * - Use `exact: true` for routes that should only match the exact path.
 * - Leverage `React.lazy` for components to enable code splitting and improve load times.
 * - Use `auth` and `roles` for implementing authentication and authorization guards.
 * - Use `hidden: true` for routes that shouldn't appear in navigation menus.
 */
export const routes: RoutesConfig = [
  {
    path: '/',
    component: HomePage,
    exact: true,
    name: 'Home',
    icon: 'home', // Example icon name
  },
  {
    path: '/about',
    component: AboutPage,
    exact: true,
    name: 'About Us',
    icon: 'info',
  },
  {
    path: '/auth',
    name: 'Authentication',
    icon: 'lock',
    hidden: true, // Authentication routes are typically not in the main navigation
    children: [
      {
        path: '/auth/login',
        component: LoginPage,
        exact: true,
        name: 'Login',
      },
      {
        path: '/auth/register',
        component: RegisterPage,
        exact: true,
        name: 'Register',
      },
      {
        path: '/auth', // Default redirect for /auth
        redirect: '/auth/login',
        exact: true,
      },
    ],
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    exact: true,
    name: 'Dashboard',
    icon: 'dashboard',
    auth: true, // This route requires authentication
  },
  {
    path: '/profile',
    component: ProfilePage,
    exact: true,
    name: 'Profile',
    icon: 'user',
    auth: true,
  },
  {
    path: '/settings',
    component: SettingsPage,
    exact: true,
    name: 'Settings',
    icon: 'settings',
    auth: true,
    roles: ['admin', 'user'], // Accessible by both admin and regular users
  },
  {
    path: '/users',
    name: 'User Management',
    icon: 'group',
    auth: true,
    roles: ['admin'], // Only accessible by users with 'admin' role
    children: [
      {
        path: '/users',
        component: UserListPage,
        exact: true,
        name: 'User List',
      },
      {
        path: '/users/:id',
        component: UserDetailPage,
        exact: true,
        name: 'User Detail',
        hidden: true, // This route is typically accessed from the list, not directly in nav
      },
    ],
  },
  {
    path: '/admin',
    component: AdminDashboardPage,
    exact: true,
    name: 'Admin Panel',
    icon: 'security',
    auth: true,
    roles: ['admin'], // Strictly for administrators
  },
  // The 404 (Not Found) route should always be the last entry.
  // It uses a wildcard path '*' to catch any unmatched routes.
  {
    path: '*',
    component: NotFoundPage,
    name: 'Page Not Found',
    hidden: true, // Not a navigation item
  },
];