// src/components/FilterControls/FilterControls.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import FilterControls from './FilterControls';
// Import the CSS module to assert class names correctly
import styles from './FilterControls.module.css';

describe('FilterControls', () => {
  // Mock Math.random to ensure consistent IDs for snapshot tests and specific ID checks.
  // This makes the generated `titleId` predictable.
  const MOCKED_RANDOM_VALUE = 0.123456789;
  const MOCKED_ID_SUFFIX = MOCKED_RANDOM_VALUE.toString(36).substring(2, 11); // e.g., '4e1s2q3r4'
  const MOCKED_TITLE_ID = `filter-controls-title-${MOCKED_ID_SUFFIX}`;

  const mockMathRandom = jest.spyOn(Math, 'random').mockReturnValue(MOCKED_RANDOM_VALUE);

  // Restore the original Math.random after all tests are done
  afterAll(() => {
    mockMathRandom.mockRestore();
  });

  // Test Case 1: Renders children correctly
  test('renders children correctly within the content area', () => {
    render(
      <FilterControls>
        <div data-testid="child-element-1">Child Element 1</div>
        <span>Child Element 2</span>
      </FilterControls>
    );

    expect(screen.getByTestId('child-element-1')).toBeInTheDocument();
    expect(screen.getByText('Child Element 2')).toBeInTheDocument();

    // Ensure children are inside the content div
    const contentDiv = screen.getByRole('group').querySelector(`.${styles.filterControlsContent}`);
    expect(contentDiv).toContainElement(screen.getByTestId('child-element-1'));
    expect(contentDiv).toContainElement(screen.getByText('Child Element 2'));
  });

  // Test Case 2: Renders title correctly and applies accessibility attributes (aria-labelledby)
  test('renders title correctly as an h2 and links it via aria-labelledby', () => {
    const testTitle = 'My Dashboard Filters';
    render(
      <FilterControls title={testTitle}>
        <div>Filter Content</div>
      </FilterControls>
    );

    // Assert the h2 title element
    const titleElement = screen.getByRole('heading', { level: 2, name: testTitle });
    expect(titleElement).toBeInTheDocument();
    expect(titleElement).toHaveTextContent(testTitle);
    expect(titleElement).toHaveClass(styles.filterControlsTitle);
    expect(titleElement).toHaveAttribute('id', MOCKED_TITLE_ID); // Check the generated ID

    // Assert the section element and its accessibility attributes
    const sectionElement = screen.getByRole('group', { name: testTitle }); // Find by accessible name
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass(styles.filterControlsContainer);
    expect(sectionElement).toHaveAttribute('aria-labelledby', MOCKED_TITLE_ID);
    expect(sectionElement).not.toHaveAttribute('aria-label'); // Should not have aria-label when title is present
  });

  // Test Case 3: Applies custom className to the root element
  test('applies custom className to the root section element', () => {
    const customClass = 'my-custom-filter-styles';
    render(<FilterControls className={customClass} />);

    const sectionElement = screen.getByRole('group');
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass(styles.filterControlsContainer); // Base class
    expect(sectionElement).toHaveClass(customClass); // Custom class
  });

  // Test Case 4: Renders correctly without children
  test('renders correctly when no children are provided', () => {
    const testTitle = 'Empty Filters';
    render(<FilterControls title={testTitle} />);

    const titleElement = screen.getByRole('heading', { level: 2, name: testTitle });
    expect(titleElement).toBeInTheDocument();

    const sectionElement = screen.getByRole('group', { name: testTitle });
    expect(sectionElement).toBeInTheDocument();

    // The content div should still be present but empty
    const contentDiv = sectionElement.querySelector(`.${styles.filterControlsContent}`);
    expect(contentDiv).toBeInTheDocument();
    expect(contentDiv).toBeEmptyDOMElement();
  });

  // Test Case 5: Renders correctly without a title and applies aria-label for accessibility
  test('renders correctly without a title and applies a default aria-label', () => {
    render(
      <FilterControls>
        <span>Some filter content</span>
      </FilterControls>
    );

    // Ensure no h2 title is rendered
    expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();

    // Assert the section element and its accessibility attributes
    const sectionElement = screen.getByRole('group', { name: 'Dashboard Filter Controls' }); // Find by accessible name
    expect(sectionElement).toBeInTheDocument();
    expect(sectionElement).toHaveClass(styles.filterControlsContainer);
    expect(sectionElement).toHaveAttribute('aria-label', 'Dashboard Filter Controls');
    expect(sectionElement).not.toHaveAttribute('aria-labelledby'); // Should not have aria-labelledby when no title
  });

  // Test Case 6: Ensures role="group" is always present on the root element
  test('ensures role="group" is always present on the root section element', () => {
    const { rerender } = render(<FilterControls />);
    expect(screen.getByRole('group')).toBeInTheDocument();

    rerender(<FilterControls title="With Title" />);
    expect(screen.getByRole('group')).toBeInTheDocument();

    rerender(<FilterControls className="some-class" />);
    expect(screen.getByRole('group')).toBeInTheDocument();

    rerender(<FilterControls title="With Title" className="some-class"><div>Child</div></FilterControls>);
    expect(screen.getByRole('group')).toBeInTheDocument();
  });

  // Test Case 7: Snapshot tests for structural integrity
  test('matches snapshot with title, children, and custom class', () => {
    const { asFragment } = render(
      <FilterControls title="Snapshot Filters" className="snapshot-custom-class">
        <p>Snapshot Child 1</p>
        <button>Snapshot Button</button>
      </FilterControls>
    );
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot without title or children, and with custom class', () => {
    const { asFragment } = render(<FilterControls className="empty-snapshot-class" />);
    expect(asFragment()).toMatchSnapshot();
  });

  test('matches snapshot with only children', () => {
    const { asFragment } = render(
      <FilterControls>
        <span>Only Child</span>
      </FilterControls>
    );
    expect(asFragment()).toMatchSnapshot();
  });
});