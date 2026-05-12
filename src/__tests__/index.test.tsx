import React from 'react';
import { act } from '@testing-library/react';

// Mock ReactDOM before importing the module under test.
// This ensures that when index.tsx calls ReactDOM.createRoot, it gets our mock.
const mockRender = jest.fn();
const mockUnmount = jest.fn();
const mockCreateRoot = jest.fn(() => ({
  render: mockRender,
  unmount: mockUnmount,
}));

jest.mock('react-dom/client', () => ({
  createRoot: mockCreateRoot,
}));

// Mock the App component to prevent actual rendering and focus on index.tsx's logic.
// This also prevents potential errors if App.tsx has dependencies not set up in the test environment.
jest.mock('./App', () => {
  // eslint-disable-next-line react/display-name
  return jest.fn(() => null); // App component will render nothing for these tests
});

// Mock the CSS import if it causes issues in a Node.js environment.
// Jest typically ignores CSS imports by default, but explicit mocking is safer.
jest.mock('./index.css', () => ({}));

describe('index.tsx', () => {
  let consoleErrorSpy: jest.SpyInstance;
  let rootElement: HTMLElement | null;

  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation.
    jest.clearAllMocks();
    // Reset modules to ensure index.tsx is re-executed for each test.
    // This is crucial because index.tsx is a script that runs on import.
    jest.resetModules();

    // Spy on console.error to check if it's called without polluting the test output.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Clean up any existing root element from previous tests.
    document.body.innerHTML = '';
  });

  afterEach(() => {
    // Restore console.error to its original implementation.
    consoleErrorSpy.mockRestore();
    // Clean up the DOM after each test.
    document.body.innerHTML = '';
  });

  // Test Scenario 1: The root element exists in the DOM.
  it('should render the App component into the root element if it exists', () => {
    // Arrange: Create a root element in the DOM.
    rootElement = document.createElement('div');
    rootElement.id = 'root';
    document.body.appendChild(rootElement);

    // Act: Import the module to trigger its execution.
    // We use require here because it allows us to re-import the module after jest.resetModules().
    // The act() wrapper ensures that all updates related to React rendering are processed.
    act(() => {
      require('./index'); // This will execute the code in index.tsx
    });

    // Assert:
    // 1. ReactDOM.createRoot should have been called exactly once with the root element.
    expect(mockCreateRoot).toHaveBeenCalledTimes(1);
    expect(mockCreateRoot).toHaveBeenCalledWith(rootElement);

    // 2. The render method on the created root should have been called exactly once.
    expect(mockRender).toHaveBeenCalledTimes(1);

    // 3. The render method should have been called with React.StrictMode wrapping the App component.
    // We need to check the type of the element passed to render.
    const renderCallArg = mockRender.mock.calls[0][0];

    // Check if the top-level element is React.StrictMode.
    expect(renderCallArg.type).toBe(React.StrictMode);

    // Check if the child of StrictMode is the App component.
    // We use require('./App').default to get the mocked App component reference.
    expect(renderCallArg.props.children.type).toBe(require('./App').default);

    // 4. console.error should not have been called, as the root element was found.
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  // Test Scenario 2: The root element does not exist in the DOM.
  it('should log an error to console.error if the root element is not found', () => {
    // Arrange: Ensure no root element exists in the DOM.
    document.body.innerHTML = ''; // Already done in beforeEach, but explicit for clarity.

    // Act: Import the module to trigger its execution.
    act(() => {
      require('./index'); // This will execute the code in index.tsx
    });

    // Assert:
    // 1. console.error should have been called exactly once.
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to find the root element with ID "root".');

    // 2. ReactDOM.createRoot should not have been called, as the root element was missing.
    expect(mockCreateRoot).not.toHaveBeenCalled();

    // 3. The render method should not have been called.
    expect(mockRender).not.toHaveBeenCalled();
  });

  // Regarding Accessibility and Snapshot Testing:
  // For this specific `index.tsx` file, which is purely about bootstrapping the React application
  // and rendering the root component, direct accessibility and snapshot tests are not typically
  // applicable. These types of tests are meaningful for actual React components (like `App.tsx`
  // and its children) that render UI elements.
  //
  // The tests above ensure that the `App` component is correctly passed to `ReactDOM.render`,
  // which is the prerequisite for any subsequent accessibility or snapshot tests on `App` itself.
  // Therefore, this file's role in the overall test strategy is to ensure the correct setup
  // for those tests to be performed on the application's components.
});