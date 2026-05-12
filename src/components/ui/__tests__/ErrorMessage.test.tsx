import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import ErrorMessage from './ErrorMessage';
import styles from './ErrorMessage.module.css'; // Import the actual styles for class name assertions

// Mock CSS modules to ensure consistent class names in tests
// This makes `styles.errorMessageContainer` resolve to 'errorMessageContainer'
// instead of a hashed class name, simplifying assertions.
jest.mock('./ErrorMessage.module.css', () => ({
  __esModule: true,
  default: {
    errorMessageContainer: 'errorMessageContainer',
    errorIcon: 'errorIcon',
    errorMessageText: 'errorMessageText',
  },
}));

describe('ErrorMessage', () => {
  afterEach(cleanup);

  // Test Case 1: Renders with a basic message
  test('should render the error message correctly', () => {
    const testMessage = 'This is a test error message.';
    render(<ErrorMessage message={testMessage} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveTextContent(testMessage);

    const messageTextElement = screen.getByText(testMessage);
    expect(messageTextElement).toBeInTheDocument();
    expect(messageTextElement).toHaveClass(styles.errorMessageText);
  });

  // Test Case 2: Renders with an ID prop
  test('should apply the provided id to the root element', () => {
    const testMessage = 'Error with ID.';
    const testId = 'my-error-id';
    render(<ErrorMessage message={testMessage} id={testId} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveAttribute('id', testId);
  });

  // Test Case 3: Renders with a className prop
  test('should apply the provided className to the root element along with internal styles', () => {
    const testMessage = 'Error with custom class.';
    const customClass = 'external-error-class';
    render(<ErrorMessage message={testMessage} className={customClass} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveClass(styles.errorMessageContainer);
    expect(errorMessageElement).toHaveClass(customClass);
  });

  // Test Case 4: Renders with all props (message, id, className)
  test('should apply all provided props correctly', () => {
    const testMessage = 'Comprehensive error message.';
    const testId = 'full-error-id';
    const customClass = 'another-external-class';
    render(<ErrorMessage message={testMessage} id={testId} className={customClass} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveTextContent(testMessage);
    expect(errorMessageElement).toHaveAttribute('id', testId);
    expect(errorMessageElement).toHaveClass(styles.errorMessageContainer);
    expect(errorMessageElement).toHaveClass(customClass);
  });

  // Test Case 5: Does not render when message is an empty string
  test('should not render anything if the message prop is an empty string', () => {
    const { container } = render(<ErrorMessage message="" />);
    expect(container).toBeEmptyDOMElement();
  });

  // Test Case 6: Does not render when message is null
  test('should not render anything if the message prop is null', () => {
    // @ts-ignore: Intentionally passing null to test runtime behavior
    const { container } = render(<ErrorMessage message={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  // Test Case 7: Does not render when message is undefined
  test('should not render anything if the message prop is undefined', () => {
    // @ts-ignore: Intentionally passing undefined to test runtime behavior
    const { container } = render(<ErrorMessage message={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  // Test Case 8: Accessibility attributes
  test('should have correct ARIA attributes for accessibility', () => {
    const testMessage = 'Accessibility test message.';
    render(<ErrorMessage message={testMessage} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveAttribute('role', 'alert');
    expect(errorMessageElement).toHaveAttribute('aria-live', 'assertive');
    expect(errorMessageElement).toHaveAttribute('aria-atomic', 'true');
  });

  // Test Case 9: SVG icon rendering and accessibility
  test('should render the SVG icon with aria-hidden attribute', () => {
    const testMessage = 'Icon test message.';
    render(<ErrorMessage message={testMessage} />);

    const svgIcon = screen.getByRole('img', { hidden: true }); // Query for hidden images
    expect(svgIcon).toBeInTheDocument();
    expect(svgIcon).toHaveClass(styles.errorIcon);
    expect(svgIcon).toHaveAttribute('aria-hidden', 'true');
  });

  // Test Case 10: Root element has the base CSS module class
  test('should always have the base CSS module class on the root element', () => {
    const testMessage = 'Base class test.';
    render(<ErrorMessage message={testMessage} />);

    const errorMessageElement = screen.getByRole('alert');
    expect(errorMessageElement).toBeInTheDocument();
    expect(errorMessageElement).toHaveClass(styles.errorMessageContainer);
  });
});