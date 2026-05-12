/**
 * @file Global TypeScript type declarations.
 * This file contains common utility types and interfaces that are used across the application.
 */

// 1. Basic Utility Types

/**
 * Represents a type that can be `T` or `null`.
 * @template T The base type.
 */
type Nullable<T> = T | null;

/**
 * Represents a type that can be `T` or `undefined`.
 * @template T The base type.
 */
type Optional<T> = T | undefined;

/**
 * Represents a type that can be `T`, `null`, or `undefined`.
 * @template T The base type.
 */
type Maybe<T> = T | null | undefined;

/**
 * Represents a dictionary (object) with string keys and values of type `T`.
 * @template T The type of the values in the dictionary.
 */
type Dictionary<T> = Record<string, T>;

/**
 * Represents a dictionary (object) with number keys and values of type `T`.
 * @template T The type of the values in the dictionary.
 */
type NumericDictionary<T> = Record<number, T>;

/**
 * Extracts the value types from an object type `T`.
 * @template T The object type.
 */
type ValueOf<T> = T[keyof T];

/**
 * Represents an array that is guaranteed to have at least one element.
 * @template T The type of elements in the array.
 */
type NonEmptyArray<T> = [T, ...T[]];

/**
 * A utility type to create a "branded" or "nominal" type.
 * This helps distinguish between types that are structurally identical but semantically different.
 * @template T The base type.
 * @template BrandName A unique string literal to brand the type.
 * @example
 * type UserID = Brand<string, 'UserID'>;
 * type ProductID = Brand<string, 'ProductID'>;
 *
 * const userId: UserID = 'user-123' as UserID;
 * const productId: ProductID = 'product-456' as ProductID;
 *
 * function getUser(id: UserID) { // ... }
 * getUser(productId); // Type error!
 */
type Brand<T, BrandName extends string> = T & { readonly __brand: BrandName };

/**
 * Represents a unique identifier, branded as 'ID' for nominal typing.
 * This can be used for any entity's primary key.
 */
type ID = Brand<string, 'ID'>;

// 2. Common Application Types

/**
 * Defines the possible sorting orders.
 */
type SortOrder = 'asc' | 'desc';

/**
 * Represents a common structure for an item with an ID and a name.
 * Useful for dropdowns, selections, etc.
 */
interface IdNamePair {
  /** The unique identifier of the item. */
  id: ID;
  /** The display name of the item. */
  name: string;
}

/**
 * Represents a generic API response structure.
 * @template T The type of the data payload in the response.
 */
interface ApiResponse<T> {
  /** The actual data payload. */
  data: T;
  /** Optional metadata related to the response (e.g., pagination). */
  meta?: Record<string, any>;
  /** Optional messages from the API. */
  message?: string;
  /** Indicates if the request was successful. */
  success: boolean;
}

/**
 * Represents a generic API error structure.
 */
interface ApiError {
  /** A unique error code. */
  code: string;
  /** A human-readable error message. */
  message: string;
  /** Optional details about the error, often an object mapping fields to error messages. */
  details?: Record<string, string | string[]>;
  /** The HTTP status code associated with the error. */
  statusCode?: number;
}

/**
 * Represents common pagination metadata for API responses.
 */
interface PaginationMeta {
  /** The total number of items available. */
  total: number;
  /** The number of items per page. */
  limit: number;
  /** The current page number (1-indexed). */
  page: number;
  /** The total number of pages. */
  totalPages: number;
}

// 3. Environment Variables Augmentation (Example for Node.js and Browser)

/**
 * Augments the NodeJS namespace for `process.env` if running in a Node.js context.
 * This allows for type-checking of `process.env` variables.
 * @example
 * console.log(process.env.API_URL); // Type-checked
 */
declare namespace NodeJS {
  interface ProcessEnv {
    /** The URL of the backend API. */
    readonly API_URL: string;
    /** The environment mode (e.g., 'development', 'production', 'test'). */
    readonly NODE_ENV: 'development' | 'production' | 'test';
    /** A flag indicating if the application is running in development mode. */
    readonly IS_DEV: 'true' | 'false';
    // Add other Node.js specific environment variables here
    // readonly DATABASE_URL: string;
  }
}

/**
 * Augments the `ImportMetaEnv` interface for browser environments (e.g., Vite, Create React App with `VITE_` prefix).
 * This allows for type-checking of `import.meta.env` variables.
 * @example
 * console.log(import.meta.env.VITE_API_URL); // Type-checked
 */
interface ImportMetaEnv {
  /** The URL of the backend API. */
  readonly VITE_API_URL: string;
  /** The environment mode (e.g., 'development', 'production', 'test'). */
  readonly VITE_NODE_ENV: 'development' | 'production' | 'test';
  /** A flag indicating if the application is running in development mode. */
  readonly VITE_IS_DEV: 'true' | 'false';
  // Add other browser-specific environment variables here, typically prefixed with VITE_
  // readonly VITE_FEATURE_FLAG_A: 'true' | 'false';
}

/**
 * Ensures `import.meta.env` is typed correctly.
 */
interface ImportMeta {
  readonly env: ImportMetaEnv;
}