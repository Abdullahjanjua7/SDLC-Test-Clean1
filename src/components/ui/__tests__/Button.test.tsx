import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button, { ButtonProps, ButtonVariant, ButtonSize, ButtonType } from './Button';

// Extend Jest's matchers with jest-axe
expect.extend(toHaveNoViolations);

// Mock CSS modules to prevent issues with dynamic class names in tests
// and ensure consistent class names for assertions.
jest.mock('./Button.module.css', () => ({
  button: 'button-base',
  primary: 'button-primary',
  secondary: 'button-secondary',
  tertiary: 'button-tertiary',
  ghost: 'button-ghost',
  glass: 'button-glass',
  small: 'button-small',
  medium: 'button-medium',
  large: 'button-large',
  disabled: 'button-disabled',
  loading: 'button-loading',
  fullWidth: 'button-fullWidth',
  spinner: 'button-spinner',
  iconLeft: 'button-iconLeft',
  iconRight: 'button-iconRight',
  content: 'button-content',
}));

describe('Button', () => {
  const defaultProps: ButtonProps = {
    children: 'Click Me',
  };

  // Helper function to render the component
  const renderButton = (props?: Partial<ButtonProps>) => {
    return render(<Button {...defaultProps} {...props} />);
  };

  // --- Basic Rendering and Content ---
  it('should render the button with children content', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
    expect(button).toHaveClass('button-base');
    expect(button).toHaveClass('button-primary'); // Default variant
    expect(button).toHaveClass('button-medium'); // Default size
  });

  it('should apply a custom className', () => {
    renderButton({ className: 'my-custom-class' });
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toHaveClass('button-base', 'button-primary', 'button-medium', 'my-custom-class');
  });

  // --- Variant Props ---
  const variants: ButtonVariant[] = ['primary', 'secondary', 'tertiary', 'ghost', 'glass'];
  variants.forEach((variant) => {
    it(`should render with the '${variant}' variant`, () => {
      renderButton({ variant });
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toHaveClass(`button-${variant}`);
      // Ensure default primary class is not present if another variant is specified
      if (variant !== 'primary') {
        expect(button).not.toHaveClass('button-primary');
      }
    });
  });

  // --- Size Props ---
  const sizes: ButtonSize[] = ['small', 'medium', 'large'];
  sizes.forEach((size) => {
    it(`should render with the '${size}' size`, () => {
      renderButton({ size });
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toHaveClass(`button-${size}`);
      // Ensure default medium class is not present if another size is specified
      if (size !== 'medium') {
        expect(button).not.toHaveClass('button-medium');
      }
    });
  });

  // --- Disabled State ---
  it('should render as disabled when the `disabled` prop is true', () => {
    const handleClick = jest.fn();
    renderButton({ disabled: true, onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    expect(button).toBeDisabled();
    expect(button).toHaveClass('button-disabled');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // --- Loading State ---
  it('should render in a loading state when `loading` prop is true', () => {
    const handleClick = jest.fn();
    renderButton({ loading: true, onClick: handleClick });
    const button = screen.getByRole('button'); // Name might not be present due to spinner

    expect(button).toBeDisabled();
    expect(button).toHaveClass('button-loading');
    expect(button).toHaveClass('button-disabled'); // Should also have disabled styles
    expect(button).toHaveAttribute('aria-busy', 'true');

    // Check for spinner and absence of children/icons
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('button-spinner'); // Spinner has aria-hidden="true"
    expect(button).not.toHaveTextContent('Click Me'); // Children should not be visible
    expect(screen.queryByText('Click Me')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not render iconLeft or iconRight when loading', () => {
    renderButton({ loading: true, iconLeft: <span>LeftIcon</span>, iconRight: <span>RightIcon</span> });
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(screen.getByRole('status', { hidden: true })).toHaveClass('button-spinner');
    expect(screen.queryByText('LeftIcon')).not.toBeInTheDocument();
    expect(screen.queryByText('RightIcon')).not.toBeInTheDocument();
    expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
  });

  // --- onClick Handler ---
  it('should call the onClick handler when clicked', () => {
    const handleClick = jest.fn();
    renderButton({ onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should pass the event object to the onClick handler', () => {
    const handleClick = jest.fn((event: React.MouseEvent<HTMLButtonElement>) => {
      expect(event.type).toBe('click');
      expect(event.currentTarget).toBeInstanceOf(HTMLButtonElement);
    });
    renderButton({ onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // --- Type Prop ---
  const types: ButtonType[] = ['button', 'submit', 'reset'];
  types.forEach((type) => {
    it(`should have type='${type}' when specified`, () => {
      renderButton({ type });
      const button = screen.getByRole('button', { name: 'Click Me' });
      expect(button).toHaveAttribute('type', type);
    });
  });

  // --- Full Width Prop ---
  it('should apply fullWidth class when `fullWidth` prop is true', () => {
    renderButton({ fullWidth: true });
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toHaveClass('button-fullWidth');
  });

  // --- Accessibility (aria-label) ---
  it('should apply `aria-label` when provided', () => {
    renderButton({ 'aria-label': 'Close dialog' });
    const button = screen.getByRole('button', { name: 'Close dialog' });
    expect(button).toHaveAttribute('aria-label', 'Close dialog');
    expect(button).toHaveTextContent('Click Me'); // Still shows children
  });

  it('should use aria-label for accessibility if children are not descriptive', () => {
    renderButton({ children: <span aria-hidden="true">X</span>, 'aria-label': 'Close' });
    const button = screen.getByRole('button', { name: 'Close' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Close');
  });

  // --- Icon Props ---
  it('should render iconLeft when provided', () => {
    renderButton({ iconLeft: <span data-testid="left-icon">🚀</span> });
    const button = screen.getByRole('button', { name: 'Click Me' });
    const leftIcon = screen.getByTestId('left-icon');
    expect(leftIcon).toBeInTheDocument();
    expect(leftIcon.parentElement).toHaveClass('button-iconLeft');
    expect(button).toContainElement(leftIcon);
  });

  it('should render iconRight when provided', () => {
    renderButton({ iconRight: <span data-testid="right-icon">➡️</span> });
    const button = screen.getByRole('button', { name: 'Click Me' });
    const rightIcon = screen.getByTestId('right-icon');
    expect(rightIcon).toBeInTheDocument();
    expect(rightIcon.parentElement).toHaveClass('button-iconRight');
    expect(button).toContainElement(rightIcon);
  });

  it('should render both iconLeft and iconRight when provided', () => {
    renderButton({
      iconLeft: <span data-testid="left-icon">🚀</span>,
      iconRight: <span data-testid="right-icon">➡️</span>,
    });
    const button = screen.getByRole('button', { name: 'Click Me' });
    const leftIcon = screen.getByTestId('left-icon');
    const rightIcon = screen.getByTestId('right-icon');

    expect(leftIcon).toBeInTheDocument();
    expect(rightIcon).toBeInTheDocument();
    expect(button).toContainElement(leftIcon);
    expect(button).toContainElement(rightIcon);
  });

  // --- Spreading `...rest` Props ---
  it('should pass through additional HTML button attributes', () => {
    renderButton({ 'data-testid': 'my-button', id: 'unique-id', title: 'A helpful tooltip' });
    const button = screen.getByTestId('my-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('id', 'unique-id');
    expect(button).toHaveAttribute('title', 'A helpful tooltip');
  });

  // --- Accessibility (jest-axe) ---
  it('should not have any accessibility violations', async () => {
    const { container } = renderButton();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations when disabled', async () => {
    const { container } = renderButton({ disabled: true });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations when loading', async () => {
    const { container } = renderButton({ loading: true });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with icons', async () => {
    const { container } = renderButton({
      iconLeft: <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" />,
      iconRight: <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" />,
    });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations with aria-label', async () => {
    const { container } = renderButton({ 'aria-label': 'Submit form' });
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});