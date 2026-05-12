import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import styles from './Select.module.css';

// --- TypeScript Interfaces ---

/**
 * Represents a single option within the Select component.
 */
export interface SelectOption {
  value: string | number;
  label: string;
}

/**
 * Props for the Select component.
 */
export interface SelectProps {
  /**
   * A unique identifier for the select component, crucial for accessibility.
   */
  id: string;
  /**
   * The accessible label for the select component.
   */
  label: string;
  /**
   * An array of options to display in the dropdown.
   */
  options: SelectOption[];
  /**
   * The currently selected value. Can be null if no option is selected.
   */
  value: string | number | null;
  /**
   * Callback function triggered when a new option is selected.
   * @param value The value of the newly selected option.
   */
  onChange: (value: string | number) => void;
  /**
   * Placeholder text to display when no option is selected.
   */
  placeholder?: string;
  /**
   * If true, the select component will be disabled.
   */
  disabled?: boolean;
  /**
   * Optional CSS class name for the root container of the select component.
   */
  className?: string;
}

/**
 * A highly accessible and visually appealing custom dropdown Select component.
 *
 * Features:
 * - Strict TypeScript typing.
 * - CSS Modules for scoped styling.
 * - Full ARIA support and keyboard navigation (Arrow Up/Down, Enter, Escape, Tab).
 * - Glassmorphism, rounded corners, and soft shadows for a premium aesthetic.
 * - Click-outside-to-close functionality.
 */
export const Select: React.FC<SelectProps> = ({
  id,
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Determine the currently selected option object
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  );

  // --- Accessibility & Interaction Handlers ---

  const toggleDropdown = useCallback(() => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
      setHighlightedIndex(selectedOption ? options.indexOf(selectedOption) : -1);
    }
  }, [disabled, options, selectedOption]);

  const handleOptionClick = useCallback(
    (option: SelectOption) => {
      if (!disabled) {
        onChange(option.value);
        setIsOpen(false);
        triggerRef.current?.focus(); // Return focus to the trigger after selection
      }
    },
    [disabled, onChange]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(selectedOption ? options.indexOf(selectedOption) : 0);
          } else {
            setHighlightedIndex((prevIndex) => {
              const nextIndex = (prevIndex + 1) % options.length;
              // Scroll into view
              dropdownRef.current?.children[nextIndex]?.scrollIntoView({ block: 'nearest' });
              return nextIndex;
            });
          }
          break;
        case 'ArrowUp':
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
            setHighlightedIndex(selectedOption ? options.indexOf(selectedOption) : options.length - 1);
          } else {
            setHighlightedIndex((prevIndex) => {
              const nextIndex = (prevIndex - 1 + options.length) % options.length;
              // Scroll into view
              dropdownRef.current?.children[nextIndex]?.scrollIntoView({ block: 'nearest' });
              return nextIndex;
            });
          }
          break;
        case 'Enter':
        case ' ': // Space key
          event.preventDefault();
          if (isOpen && highlightedIndex !== -1) {
            handleOptionClick(options[highlightedIndex]);
          } else {
            toggleDropdown();
          }
          break;
        case 'Escape':
          event.preventDefault();
          if (isOpen) {
            setIsOpen(false);
            triggerRef.current?.focus(); // Return focus to the trigger
          }
          break;
        case 'Tab':
          if (isOpen) {
            setIsOpen(false); // Close dropdown on tab out
          }
          break;
        default:
          // Allow typing to potentially filter options if that feature were added
          break;
      }
    },
    [disabled, isOpen, options, highlightedIndex, selectedOption, toggleDropdown, handleOptionClick]
  );

  // --- Effects ---

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // When dropdown opens, ensure the selected/highlighted item is visible
  useEffect(() => {
    if (isOpen && highlightedIndex !== -1 && dropdownRef.current) {
      dropdownRef.current.children[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [isOpen, highlightedIndex]);

  // Reset highlighted index when options change or dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // --- Render ---

  const activeDescendantId = isOpen && highlightedIndex !== -1 ? `${id}-option-${highlightedIndex}` : undefined;

  return (
    <div
      ref={containerRef}
      className={`${styles.selectContainer} ${className || ''} ${disabled ? styles.disabled : ''}`}
      onKeyDown={handleKeyDown}
      role="combobox"
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      aria-labelledby={`${id}-label`}
      aria-controls={`${id}-listbox`}
    >
      <label id={`${id}-label`} htmlFor={id} className={styles.selectLabel}>
        {label}
      </label>
      <button
        id={id}
        ref={triggerRef}
        type="button"
        className={styles.selectTrigger}
        onClick={toggleDropdown}
        aria-label={label}
        aria-activedescendant={activeDescendantId}
        disabled={disabled}
      >
        <span className={selectedOption ? styles.selectedValue : styles.selectPlaceholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className={`${styles.arrowIcon} ${isOpen ? styles.arrowUp : styles.arrowDown}`} aria-hidden="true"></span>
      </button>

      {isOpen && (
        <ul
          ref={dropdownRef}
          id={`${id}-listbox`}
          role="listbox"
          className={styles.dropdown}
          aria-labelledby={`${id}-label`}
          tabIndex={-1} // Make listbox focusable for keyboard navigation, but not part of tab flow
        >
          {options.length === 0 ? (
            <li className={styles.noOptions}>No options available</li>
          ) : (
            options.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                className={`${styles.option} ${option.value === value ? styles.optionSelected : ''} ${
                  index === highlightedIndex ? styles.optionHighlighted : ''
                }`}
                aria-selected={option.value === value}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={() => setHighlightedIndex(index)} // Allow mouse to highlight
              >
                {option.label}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};