import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Navbar from './Navbar';
import styles from './Navbar.module.css'; // Import styles to check class names if needed

// Extend Jest with jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock react-router-dom's Link component if it were used inside the Navbar's slots
// This is a common pattern when testing components that accept ReactNode props
// which might include router links.
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe('Navbar', () => {
  const user = userEvent.setup();

  afterEach(() => {
    cleanup();
  });

  // Test 1: Basic Rendering and Default Props
  it('renders without crashing and applies default aria-label', () => {
    render(<Navbar />);
    const navElement = screen.getByRole('navigation', { name: 'Global navigation' });
    expect(navElement).toBeInTheDocument();
    expect(navElement).toHaveClass(styles.navbar); // Check if CSS module class is applied
  });

  it('applies a custom aria-label when provided', () => {
    const customLabel = 'Main site navigation';
    render(<Navbar ariaLabel={customLabel} />);
    const navElement = screen.getByRole('navigation', { name: customLabel });
    expect(navElement).toBeInTheDocument();
  });

  // Test 2: Prop Combinations - Content Slots
  it('renders brandContent correctly', () => {
    const brandText = 'My Brand';
    render(<Navbar brandContent={<span>{brandText}</span>} />);
    expect(screen.getByText(brandText)).toBeInTheDocument();
    expect(screen.getByText(brandText).parentElement).toHaveClass(styles.brandSection);
  });

  it('renders children (main content) correctly', () => {
    const mainContentText = 'Home About Contact';
    render(<Navbar>{mainContentText}</Navbar>);
    expect(screen.getByText(mainContentText)).toBeInTheDocument();
    expect(screen.getByText(mainContentText).parentElement).toHaveClass(styles.mainContent);
  });

  it('renders actionContent correctly', () => {
    const actionButtonText = 'Login';
    render(<Navbar actionContent={<button>{actionButtonText}</button>} />);
    expect(screen.getByRole('button', { name: actionButtonText })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: actionButtonText }).parentElement).toHaveClass(styles.actionSection);
  });

  it('renders all content slots simultaneously', () => {
    const brand = <a href="/">Logo</a>;
    const main = <nav><ul><li><a href="/products">Products</a></li></ul></nav>;
    const actions = <button>Sign Out</button>;

    render(
      <Navbar brandContent={brand} actionContent={actions}>
        {main}
      </Navbar>
    );

    expect(screen.getByRole('link', { name: 'Logo' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' })).toBeInTheDocument();

    // Verify placement in correct sections
    expect(screen.getByRole('link', { name: 'Logo' }).closest(`.${styles.brandSection}`)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' }).closest(`.${styles.mainContent}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign Out' }).closest(`.${styles.actionSection}`)).toBeInTheDocument();
  });

  it('renders complex content within slots, including mocked Link', () => {
    const mockOnBrandClick = jest.fn();
    const mockOnActionClick = jest.fn();
    const mockOnSearchChange = jest.fn();

    render(
      <Navbar
        brandContent={<a href="/" onClick={mockOnBrandClick}>Brand Logo</a>}
        actionContent={
          <>
            <button onClick={mockOnActionClick}>Profile</button>
            <button>Settings</button>
          </>
        }
      >
        <input type="search" placeholder="Search..." onChange={mockOnSearchChange} />
        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/reports">Reports</Link>
        </nav>
      </Navbar>
    );

    // Brand content
    const brandLink = screen.getByRole('link', { name: 'Brand Logo' });
    expect(brandLink).toBeInTheDocument();
    expect(brandLink).toHaveAttribute('href', '/');

    // Main content
    const searchInput = screen.getByPlaceholderText('Search...');
    expect(searchInput).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Reports' })).toBeInTheDocument();

    // Action content
    const profileButton = screen.getByRole('button', { name: 'Profile' });
    expect(profileButton).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Settings' })).toBeInTheDocument();
  });

  // Test 3: User Interactions (on elements passed into slots)
  it('handles click on a button in actionContent', async () => {
    const handleClick = jest.fn();
    render(<Navbar actionContent={<button onClick={handleClick}>Click Me</button>} />);

    const button = screen.getByRole('button', { name: 'Click Me' });
    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles click on a link in brandContent', async () => {
    const handleClick = jest.fn((e) => e.preventDefault()); // Prevent actual navigation
    render(<Navbar brandContent={<a href="/home" onClick={handleClick}>Home</a>} />);

    const link = screen.getByRole('link', { name: 'Home' });
    await user.click(link);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles input change in a search bar in children', async () => {
    const handleChange = jest.fn();
    render(<Navbar><input type="text" placeholder="Search" onChange={handleChange} /></Navbar>);

    const input = screen.getByPlaceholderText('Search');
    await user.type(input, 'test query');
    expect(handleChange).toHaveBeenCalledTimes(10); // 10 characters typed
    expect(input).toHaveValue('test query');
  });

  // Test 4: Accessibility
  it('passes axe accessibility audit with default props', async () => {
    const { container } = render(<Navbar />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it('passes axe accessibility audit with all content slots filled', async () => {
    const { container } = render(
      <Navbar
        brandContent={<a href="/">Brand Logo</a>}
        actionContent={
          <>
            <button aria-label="User Profile">
              <img src="avatar.png" alt="User Avatar" />
            </button>
            <button>Logout</button>
          </>
        }
        ariaLabel="Primary navigation"
      >
        <nav>
          <ul>
            <li><a href="/dashboard">Dashboard</a></li>
            <li><a href="/settings">Settings</a></li>
          </ul>
        </nav>
        <input type="search" aria-label="Search site" placeholder="Search..." />
      </Navbar>
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it('ensures content passed into slots is accessible (e.g., links have discernible text)', async () => {
    // This test specifically checks for common accessibility issues within the passed content
    // by intentionally creating a violation and asserting it fails, then fixing it.

    // Scenario 1: Link without discernible text (should fail axe)
    const { container: container1 } = render(
      <Navbar brandContent={<a href="/bad-link"><img src="icon.png" alt="" /></a>} />
    );
    // We expect a violation here because the img has an empty alt, making the link non-discernible
    expect(await axe(container1)).not.toHaveNoViolations();
    cleanup();

    // Scenario 2: Link with discernible text (should pass axe)
    const { container: container2 } = render(
      <Navbar brandContent={<a href="/good-link"><img src="icon.png" alt="Home" /></a>} />
    );
    expect(await axe(container2)).toHaveNoViolations();
    cleanup();

    // Scenario 3: Button with only icon (should fail axe)
    const { container: container3 } = render(
      <Navbar actionContent={<button><span role="img" aria-label="Close">❌</span></button>} />
    );
    // A button needs accessible text or an aria-label directly on the button
    expect(await axe(container3)).not.toHaveNoViolations();
    cleanup();

    // Scenario 4: Button with accessible label (should pass axe)
    const { container: container4 } = render(
      <Navbar actionContent={<button aria-label="Close"><span role="img">❌</span></button>} />
    );
    expect(await axe(container4)).toHaveNoViolations();
  });
});