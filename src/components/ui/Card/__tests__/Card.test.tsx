// src/components/Card/Card.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Card from './Card';
import styles from './Card.module.css'; // Import styles to check for generated class names

describe('Card', () => {
  // Test 1: Basic rendering with default props
  it('renders children content correctly with default "div" element', () => {
    render(<Card>Hello World</Card>);
    const cardElement = screen.getByText('Hello World');
    expect(cardElement).toBeInTheDocument();
    expect(cardElement.tagName).toBe('DIV'); // Default element type
    expect(cardElement).toHaveClass(styles.card); // Default class
  });

  // Test 2: `children` prop with various content types
  it('renders various types of children content', () => {
    const TestComponent = () => <span>Test Span</span>;
    render(
      <Card>
        <div>
          <h1>Title</h1>
          <p>Paragraph text</p>
          <TestComponent />
          <span>123</span>
          {null}
          {undefined}
        </div>
      </Card>
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Title' })).toBeInTheDocument();
    expect(screen.getByText('Paragraph text')).toBeInTheDocument();
    expect(screen.getByText('Test Span')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  // Test 3: `className` prop
  it('applies custom className along with the default class', () => {
    const customClass = 'my-custom-card';
    render(<Card className={customClass}>Content</Card>);
    const cardElement = screen.getByText('Content');
    expect(cardElement).toHaveClass(styles.card);
    expect(cardElement).toHaveClass(customClass);
    expect(cardElement.className).toContain(styles.card); // Ensure both are present
    expect(cardElement.className).toContain(customClass);
  });

  // Test 4: `as` prop for semantic elements
  it('renders as a different HTML element when "as" prop is provided', () => {
    render(<Card as="section">Section Content</Card>);
    const cardElement = screen.getByText('Section Content');
    expect(cardElement.tagName).toBe('SECTION');
    expect(cardElement).toHaveClass(styles.card);
  });

  it('renders as an "article" element', () => {
    render(<Card as="article">Article Content</Card>);
    expect(screen.getByText('Article Content').tagName).toBe('ARTICLE');
  });

  it('renders as an "aside" element', () => {
    render(<Card as="aside">Aside Content</Card>);
    expect(screen.getByText('Aside Content').tagName).toBe('ASIDE');
  });

  // Test 5: Accessibility props (`aria-label`, `aria-labelledby`)
  it('applies "aria-label" for accessibility', () => {
    const ariaLabel = 'Important Information Card';
    render(<Card aria-label={ariaLabel}>Info</Card>);
    const cardElement = screen.getByLabelText(ariaLabel);
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveAttribute('aria-label', ariaLabel);
  });

  it('applies "aria-labelledby" for accessibility', () => {
    const labelId = 'card-title';
    render(
      <Card aria-labelledby={labelId}>
        <h2 id={labelId}>Card Title</h2>
        <p>Card content</p>
      </Card>
    );
    const cardElement = screen.getByRole('article', { name: 'Card Title' }); // Assuming default 'div' acts as article for ARIA
    expect(cardElement).toBeInTheDocument();
    expect(cardElement).toHaveAttribute('aria-labelledby', labelId);
  });

  // Test 6: Standard HTML attributes (`...rest`)
  it('passes through standard HTML attributes like "id"', () => {
    const testId = 'my-unique-card';
    render(<Card id={testId}>Card with ID</Card>);
    const cardElement = screen.getByText('Card with ID');
    expect(cardElement).toHaveAttribute('id', testId);
  });

  it('passes through data attributes', () => {
    render(<Card data-testid="card-element" data-status="active">Data Card</Card>);
    const cardElement = screen.getByTestId('card-element');
    expect(cardElement).toHaveAttribute('data-status', 'active');
  });

  it('applies inline style attribute', () => {
    render(<Card style={{ backgroundColor: 'red' }}>Styled Card</Card>);
    const cardElement = screen.getByText('Styled Card');
    expect(cardElement).toHaveStyle('background-color: red');
  });

  // Test 7: User interactions (`onClick`)
  it('calls onClick handler when the card is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Click Me</Card>);
    const cardElement = screen.getByText('Click Me');

    await user.click(cardElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('allows interaction with children elements inside the card', async () => {
    const user = userEvent.setup();
    const handleButtonClick = jest.fn();
    render(
      <Card>
        <button onClick={handleButtonClick}>Internal Button</button>
      </Card>
    );
    const buttonElement = screen.getByRole('button', { name: 'Internal Button' });

    await user.click(buttonElement);
    expect(handleButtonClick).toHaveBeenCalledTimes(1);
  });

  // Test 8: Edge Cases/Combinations
  it('renders correctly when no className is provided (only default class)', () => {
    render(<Card>No extra class</Card>);
    const cardElement = screen.getByText('No extra class');
    expect(cardElement).toHaveClass(styles.card);
    expect(cardElement.className.split(' ').length).toBe(1); // Only the default class
  });

  it('renders an empty card when children is empty', () => {
    render(<Card></Card>);
    const cardElement = screen.getByTestId('card-root'); // Add data-testid to the component for this
    // For this test, we need to add a data-testid to the root element of the Card component
    // <Component data-testid="card-root" ... >
    // Or, we can query by the class name
    const emptyCard = screen.getByRole('generic', { className: styles.card }); // 'generic' is the default role for div
    expect(emptyCard).toBeInTheDocument();
    expect(emptyCard).toBeEmptyDOMElement();
  });

  it('combines all props correctly: as, className, aria-label, onClick, id', async () => {
    const user = userEvent.setup();
    const handleClick = jest.fn();
    const customClass = 'combined-styles';
    const ariaLabel = 'Complex Card Example';
    const testId = 'complex-card';

    render(
      <Card
        as="article"
        className={customClass}
        aria-label={ariaLabel}
        onClick={handleClick}
        id={testId}
      >
        <p>Complex content</p>
      </Card>
    );

    const cardElement = screen.getByRole('article', { name: ariaLabel });

    expect(cardElement).toBeInTheDocument();
    expect(cardElement.tagName).toBe('ARTICLE');
    expect(cardElement).toHaveClass(styles.card);
    expect(cardElement).toHaveClass(customClass);
    expect(cardElement).toHaveAttribute('aria-label', ariaLabel);
    expect(cardElement).toHaveAttribute('id', testId);
    expect(screen.getByText('Complex content')).toBeInTheDocument();

    await user.click(cardElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});