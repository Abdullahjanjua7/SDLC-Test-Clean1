import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, waitFor, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { faker } from '@faker-js/faker';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { createMemoryHistory, MemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import { ThemeProvider as EmotionThemeProvider } from '@emotion/react';
import { checkA11y, configureAxe } from 'jest-axe';

// --- 1. Rendering components with providers / 4. Custom render functions ---

/**
 * Example Theme structure. Replace with your actual theme.
 */
const testTheme = {
  colors: {
    primary: '#007bff',
    secondary: '#6c757d',
    text: '#212529',
    background: '#ffffff',
  },
  spacing: (factor: number) => `${factor * 8}px`,
};

type TestTheme = typeof testTheme;

/**
 * Example Redux state and slice. Replace with your actual Redux setup.
 */
interface CounterState {
  value: number;
}

const initialCounterState: CounterState = {
  value: 0,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState: initialCounterState,
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload;
    },
  },
});

/**
 * Creates a test Redux store.
 * @param preloadedState Optional initial state for the store.
 * @returns A configured Redux store.
 */
const createTestStore = (preloadedState?: any) => {
  return configureStore({
    reducer: {
      counter: counterSlice.reducer,
      // Add other reducers here
    },
    preloadedState,
  });
};

type AppStore = ReturnType<typeof createTestStore>;
type RootState = ReturnType<AppStore['getState']>;

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  /** The initial route for the MemoryRouter. Defaults to '/'. */
  route?: string;
  /** A pre-configured MemoryHistory object. A new one is created if not provided. */
  history?: MemoryHistory;
  /** Preloaded state for the Redux store. */
  preloadedState?: Partial<RootState>;
  /** A pre-configured Redux store. A new one is created if not provided. */
  store?: AppStore;
  /** A theme object for the ThemeProvider. Defaults to `testTheme`. */
  theme?: TestTheme;
}

/**
 * Custom render function that wraps the UI with common providers (Redux, React Router, Theme).
 * It also returns the history and store objects for direct interaction in tests,
 * and includes a helper for accessibility checks.
 * @param ui The React element to render.
 * @param options Custom render options including route, history, preloadedState, store, and theme.
 * @returns An object containing the result of `render`, plus `history`, `store`, and `checkAccessibility`.
 */
const customRender = (
  ui: ReactElement,
  {
    route = '/',
    history = createMemoryHistory({ initialEntries: [route] }),
    preloadedState,
    store = createTestStore(preloadedState),
    theme = testTheme,
    ...renderOptions
  }: CustomRenderOptions = {}
) => {
  const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
      <Provider store={store}>
        <Router location={history.location} navigator={history}>
          <EmotionThemeProvider theme={theme}>
            {children}
          </EmotionThemeProvider>
        </Router>
      </Provider>
    );
  };

  const result = render(ui, { wrapper: AllTheProviders, ...renderOptions });

  /**
   * Runs an accessibility check on the rendered container using `jest-axe`.
   * Requires `jest-axe` to be configured (e.g., via `configureAxe`).
   */
  const checkAccessibility = async () => {
    await act(async () => {
      await checkA11y(result.container);
    });
  };

  return {
    ...result,
    history,
    store,
    checkAccessibility,
  };
};

// --- 2. Creating mock data