import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, IButtonProps } from './Button';

// Mock CSS Modules to return class names as strings for easier testing
jest.mock('./Button.module.css', () => ({
  button: 'button-base',
  primary: 'button-primary',
  secondary: 'button-secondary',
  ghost: 'button-ghost',
  danger: 'button-danger',
  small: 'button-small',
  medium: 'button-medium',
  large: 'button-large',
  disabled: 'button-disabled',
  loading: 'button-loading',
  spinner: 'button-spinner',
  iconLeft: 'button-icon-left',
  iconRight: 'button-icon-right',
}));

describe('Button Component', () => {
  const defaultProps: IButtonProps = {
    children: 'Click Me',
  };

  // Helper function to render the component
  const renderButton = (props?: Partial<IButtonProps>) => {
    return render(<Button {...defaultProps} {...props} />);
  };

  // Test 1: Basic Rendering and Default Props
  it('should render with default props and children', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Click Me' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Click Me');
    expect(button).toHaveClass('button-base');
    expect(button).toHaveClass('button-primary'); // Default variant
    expect(button).toHaveClass('button-medium'); // Default size
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'false');
    expect(button).not.toHaveClass('button-disabled');
    expect(button).not.toHaveClass('button-loading');
  });

  // Test 2: Children rendering
  it('should render complex children', () => {
    renderButton({ children: <span>Hello <strong>World</strong></span> });
    const button = screen.getByRole('button', { name: 'Hello World' }); // RTL automatically flattens text content for name
    expect(button).toBeInTheDocument();
    expect(button).toContainHTML('<span>Hello <strong>World</strong></span>');
  });

  // Test 3: Variant Prop
  it('should apply the correct variant class', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
    variants.forEach((variant) => {
      renderButton({ variant, children: `Button ${variant}` });
      const button = screen.getByRole('button', { name: `Button ${variant}` });
      expect(button).toHaveClass(`button-${variant}`);
      expect(button).not.toHaveClass(
        variants.filter((v) => v !== variant).map((v) => `button-${v}`).join(' ')
      );
    });
  });

  // Test 4: Size Prop
  it('should apply the correct size class', () => {
    const sizes = ['small', 'medium', 'large'] as const;
    sizes.forEach((size) => {
      renderButton({ size, children: `Button ${size}` });
      const button = screen.getByRole('button', { name: `Button ${size}` });
      expect(button).toHaveClass(`button-${size}`);
      expect(button).not.toHaveClass(
        sizes.filter((s) => s !== size).map((s) => `button-${s}`).join(' ')
      );
    });
  });

  // Test 5: Disabled State
  it('should be disabled when the disabled prop is true', () => {
    const handleClick = jest.fn();
    renderButton({ disabled: true, onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('button-disabled');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test 6: Loading State
  it('should show loading spinner and hide children/icons when isLoading is true', () => {
    const handleClick = jest.fn();
    renderButton({
      isLoading: true,
      onClick: handleClick,
      iconLeft: <span data-testid="icon-left">L</span>,
      iconRight: <span data-testid="icon-right">R</span>,
    });
    const button = screen.getByRole('button'); // No name because children are hidden

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('button-loading');
    expect(button).toHaveClass('button-disabled'); // isLoading also implies disabled

    // Spinner should be visible
    const spinner = screen.getByRole('img', { hidden: true }); // aria-hidden="true" makes it hidden from accessibility tree
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('button-spinner');
    expect(spinner).toHaveAttribute('aria-hidden', 'true');

    // Children and icons should be hidden
    expect(screen.queryByText('Click Me')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-left')).not.toBeInTheDocument();
    expect(screen.queryByTestId('icon-right')).not.toBeInTheDocument();

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should be disabled when isLoading is true, even if disabled prop is false', () => {
    const handleClick = jest.fn();
    renderButton({ isLoading: true, disabled: false, onClick: handleClick });
    const button = screen.getByRole('button');

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(button).toHaveClass('button-loading');
    expect(button).toHaveClass('button-disabled');

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test 7: Icons
  it('should render with iconLeft', () => {
    renderButton({ iconLeft: <span data-testid="icon-left">🚀</span> });
    const button = screen.getByRole('button', { name: '🚀 Click Me' }); // RTL combines text content
    expect(button).toBeInTheDocument();
    const iconLeft = screen.getByTestId('icon-left');
    expect(iconLeft).toBeInTheDocument();
    expect(iconLeft).toHaveClass('button-icon-left');
    expect(iconLeft).toHaveAttribute('aria-hidden', 'true');
    expect(button).toContainElement(iconLeft);
  });

  it('should render with iconRight', () => {
    renderButton({ iconRight: <span data-testid="icon-right">➡️</span> });
    const button = screen.getByRole('button', { name: 'Click Me ➡️' });
    expect(button).toBeInTheDocument();
    const iconRight = screen.getByTestId('icon-right');
    expect(iconRight).toBeInTheDocument();
    expect(iconRight).toHaveClass('button-icon-right');
    expect(iconRight).toHaveAttribute('aria-hidden', 'true');
    expect(button).toContainElement(iconRight);
  });

  it('should render with both icons', () => {
    renderButton({
      iconLeft: <span data-testid="icon-left">🚀</span>,
      iconRight: <span data-testid="icon-right">➡️</span>,
    });
    const button = screen.getByRole('button', { name: '🚀 Click Me ➡️' });
    expect(button).toBeInTheDocument();
    expect(screen.getByTestId('icon-left')).toBeInTheDocument();
    expect(screen.getByTestId('icon-right')).toBeInTheDocument();
  });

  // Test 8: User Interactions - onClick
  it('should call onClick handler when clicked', () => {
    const handleClick = jest.fn();
    renderButton({ onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should not call onClick handler when disabled', () => {
    const handleClick = jest.fn();
    renderButton({ disabled: true, onClick: handleClick });
    const button = screen.getByRole('button', { name: 'Click Me' });

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('should not call onClick handler when isLoading', () => {
    const handleClick = jest.fn();
    renderButton({ isLoading: true, onClick: handleClick });
    const button = screen.getByRole('button'); // No name when loading

    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Test 9: Custom Class Name
  it('should apply custom className', () => {
    renderButton({ className: 'my-custom-class' });
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toHaveClass('my-custom-class');
    expect(button).toHaveClass('button-base'); // Ensure default classes are still there
  });

  // Test 10: Native Button Attributes
  it('should pass through native button attributes', () => {
    renderButton({ type: 'submit', name: 'myButton', 'data-testid': 'test-button' });
    const button = screen.getByTestId('test-button');

    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('name', 'myButton');
  });

  // Test 11: Accessibility - aria-label
  it('should apply aria-label from prop', () => {
    renderButton({ 'aria-label': 'Submit Form' });
    const button = screen.getByRole('button', { name: 'Submit Form' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Submit Form');
    expect(button).not.toHaveTextContent('Click Me'); // aria-label takes precedence for name
  });

  it('should use children as aria-label if children is a string and aria-label prop is not provided', () => {
    renderButton({ children: 'Save Changes' });
    const button = screen.getByRole('button', { name: 'Save Changes' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('aria-label', 'Save Changes');
  });

  it('should not have an aria-label if children is not a string and aria-label prop is not provided', () => {
    renderButton({ children: <span data-testid="icon-only">⚙️</span> });
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toHaveAttribute('aria-label');
    // In this case, the button's accessible name would be derived from its content, which is the icon.
    // For purely iconic buttons, an explicit aria-label is recommended.
  });

  // Test 12: Accessibility - aria-disabled
  it('should have aria-disabled="true" when disabled', () => {
    renderButton({ disabled: true });
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have aria-disabled="true" when isLoading', () => {
    renderButton({ isLoading: true });
    const button = screen.getByRole('button'); // No name when loading
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('should have aria-disabled="false" when not disabled or loading', () => {
    renderButton();
    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toHaveAttribute('aria-disabled', 'false');
  });

  // Test 13: Accessibility - aria-hidden for icons and spinner
  it('should have aria-hidden="true" for iconLeft', () => {
    renderButton({ iconLeft: <svg data-testid="left-svg" /> });
    expect(screen.getByTestId('left-svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have aria-hidden="true" for iconRight', () => {
    renderButton({ iconRight: <svg data-testid="right-svg" /> });
    expect(screen.getByTestId('right-svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should have aria-hidden="true" for spinner', () => {
    renderButton({ isLoading: true });
    const spinner = screen.getByRole('img', { hidden: true }); // spinner is aria-hidden
    expect(spinner).toHaveAttribute('aria-hidden', 'true');
  });

  // Test 14: Combined Props
  it('should render a large secondary button with a left icon and custom class', () => {
    renderButton({
      variant: 'secondary',
      size: 'large',
      iconLeft: <span data-testid="left-icon">⚙️</span>,
      className: 'custom-style',
      children: 'Settings',
    });
    const button = screen.getByRole('button', { name: '⚙️ Settings' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button-base');
    expect(button).toHaveClass('button-secondary');
    expect(button).toHaveClass('button-large');
    expect(button).toHaveClass('custom-style');
    expect(screen.getByTestId('left-icon')).toBeInTheDocument();
    expect(screen.getByTestId('left-icon')).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render a disabled ghost button with a right icon', () => {
    renderButton({
      variant: 'ghost',
      disabled: true,
      iconRight: <span data-testid="right-icon">🚫</span>,
      children: 'Cancel',
    });
    const button = screen.getByRole('button', { name: 'Cancel 🚫' });

    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('button-ghost');
    expect(button).toHaveClass('button-disabled');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('right-icon')).toBeInTheDocument();
    expect(screen.getByTestId('right-icon')).toHaveAttribute('aria-hidden', 'true');
  });
});