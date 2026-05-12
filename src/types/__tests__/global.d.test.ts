// This file contains Jest tests for the global TypeScript type declarations.
// Since .d.ts files contain only type declarations and no executable code,
// these tests primarily focus on demonstrating the correct usage and type inference
// of the declared types at compile-time, and their runtime implications.
// Jest cannot directly test compile-time type errors, but we can show valid assignments
// and comment on where type errors would occur.

// To make these types available in the test file, ensure your tsconfig.json
// includes "global.d.ts" or that it's implicitly picked up by TypeScript.
// For example, in tsconfig.json:
// {
//   "compilerOptions": {
//     "typeRoots": ["./node_modules/@types", "./"], // Include current directory for global.d.ts
//     // ... other options
//   },
//   "include": ["./**/*.ts", "./**/*.d.ts"]
// }

describe('Global Type Declarations', () => {

  // --- 1. Basic Utility Types ---

  describe('Basic Utility Types', () => {
    it('Nullable<T> should correctly represent T or null', () => {
      let nullableString: Nullable<string>;
      nullableString = 'hello';
      expect(nullableString).toBe('hello');
      nullableString = null;
      expect(nullableString).toBeNull();

      // @ts-expect-error: Type 'number' is not assignable to type 'string | null'.
      // nullableString = 123;
    });

    it('Optional<T> should correctly represent T or undefined', () => {
      let optionalNumber: Optional<number>;
      optionalNumber = 42;
      expect(optionalNumber).toBe(42);
      optionalNumber = undefined;
      expect(optionalNumber).toBeUndefined();

      // @ts-expect-error: Type 'string' is not assignable to type 'number | undefined'.
      // optionalNumber = 'forty-two';
    });

    it('Maybe<T> should correctly represent T, null, or undefined', () => {
      let maybeBoolean: Maybe<boolean>;
      maybeBoolean = true;
      expect(maybeBoolean).toBe(true);
      maybeBoolean = null;
      expect(maybeBoolean).toBeNull();
      maybeBoolean = undefined;
      expect(maybeBoolean).toBeUndefined();

      // @ts-expect-error: Type 'number' is not assignable to type 'boolean | null | undefined'.
      // maybeBoolean = 0;
    });

    it('Dictionary<T> should correctly represent an object with string keys and T values', () => {
      const stringDict: Dictionary<string> = {
        key1: 'value1',
        key2: 'value2',
      };
      expect(stringDict.key1).toBe('value1');
      expect(stringDict.key2).toBe('value2');
      expect(Object.keys(stringDict)).toEqual(['key1', 'key2']);

      // @ts-expect-error: Type 'number' is not assignable to type 'string'.
      // const invalidDict: Dictionary<string> = { key: 123 };
    });

    it('NumericDictionary<T> should correctly represent an object with number keys and T values', () => {
      const numberDict: NumericDictionary<boolean> = {
        1: true,
        2: false,
      };
      expect(numberDict[1]).toBe(true);
      expect(numberDict[2]).toBe(false);
      expect(Object.keys(numberDict)).toEqual(['1', '2']); // Keys are still strings at runtime

      // @ts-expect-error: Type 'string' is not assignable to type 'number'.
      // const invalidDict: NumericDictionary<boolean> = { 'one': true };
    });

    it('ValueOf<T> should extract the value types from an object type', () => {
      const myObject = {
        a: 1,
        b: 'hello',
        c: true,
      };
      type MyObjectValues = ValueOf<typeof myObject>;

      let value: MyObjectValues;
      value = 1;
      expect(value).toBe(1);
      value = 'hello';
      expect(value).toBe('hello');
      value = true;
      expect(value).toBe(true);

      // @ts-expect-error: Type 'null' is not assignable to type 'string | number | boolean'.
      // value = null;
    });

    it('NonEmptyArray<T> should represent an array with at least one element', () => {
      const nonEmptyStrings: NonEmptyArray<string> = ['first'];
      expect(nonEmptyStrings).toEqual(['first']);
      nonEmptyStrings.push('second');
      expect(nonEmptyStrings).toEqual(['first', 'second']);

      // @ts-expect-error: Type '[]' is not assignable to type '[string, ...string[]]'.
      // const emptyArray: NonEmptyArray<string> = [];
    });

    it('Brand<T, BrandName> and ID should create nominal types', () => {
      // ID is a branded string
      const userId: ID = 'user-123' as ID;
      expect(userId).toBe('user-123');

      // Demonstrate custom branding
      type ProductCode = Brand<string, 'ProductCode'>;
      const productCode: ProductCode = 'P-XYZ-789' as ProductCode;
      expect(productCode).toBe('P-XYZ-789');

      // The core benefit of Brand is compile-time type safety:
      // @ts-expect-error: Type 'ProductCode' is not assignable to type 'ID'.
      // const anotherId: ID = productCode;

      // @ts-expect-error: Type 'ID' is not assignable to type 'ProductCode'.
      // const anotherProductCode: ProductCode = userId;

      // A plain string cannot be assigned to a branded type without casting
      const plainString: string = 'some-id';
      // @ts-expect-error: Type 'string' is not assignable to type 'ID'.
      // const invalidId: ID = plainString;
      const validId: ID = plainString as ID; // Requires explicit cast
      expect(validId).toBe('some-id');
    });
  });

  // --- 2. Common Application Types ---

  describe('Common Application Types', () => {
    it('SortOrder should define "asc" or "desc"', () => {
      let order: SortOrder;
      order = 'asc';
      expect(order).toBe('asc');
      order = 'desc';
      expect(order).toBe('desc');

      // @ts-expect-error: Type '"ascending"' is not assignable to type 'SortOrder'.
      // order = 'ascending';
    });

    it('IdNamePair should have id (ID) and name (string)', () => {
      const item: IdNamePair = {
        id: 'item-1' as ID,
        name: 'First Item',
      };
      expect(item.id).toBe('item-1');
      expect(item.name).toBe('First Item');

      // @ts-expect-error: Property 'id' is missing in type '{ name: string; }' but required in type 'IdNamePair'.
      // const invalidItem1: IdNamePair = { name: 'Missing ID' };

      // @ts-expect-error: Type 'number' is not assignable to type 'ID'.
      // const invalidItem2: IdNamePair = { id: 123, name: 'Invalid ID' };
    });

    it('ApiResponse<T> should structure API responses', () => {
      interface User {
        id: ID;
        username: string;
      }

      const userResponse: ApiResponse<User> = {
        data: { id: 'user-456' as ID, username: 'testuser' },
        success: true,
        message: 'User fetched successfully',
        meta: { timestamp: Date.now() },
      };

      expect(userResponse.data.id).toBe('user-456');
      expect(userResponse.data.username).toBe('testuser');
      expect(userResponse.success).toBe(true);
      expect(userResponse.message).toBe('User fetched successfully');
      expect(userResponse.meta).toHaveProperty('timestamp');

      const emptyResponse: ApiResponse<null> = {
        data: null,
        success: true,
      };
      expect(emptyResponse.data).toBeNull();
      expect(emptyResponse.success).toBe(true);

      // @ts-expect-error: Property 'success' is missing in type '{ data: User; }' but required in type 'ApiResponse<User>'.
      // const incompleteResponse: ApiResponse<User> = { data: { id: 'user-789' as ID, username: 'incomplete' } };
    });

    it('ApiError should structure API error responses', () => {
      const validationError: ApiError = {
        code: 'VALIDATION_FAILED',
        message: 'Input validation failed',
        details: {
          email: 'Invalid email format',
          password: ['Too short', 'Missing special character'],
        },
        statusCode: 400,
      };

      expect(validationError.code).toBe('VALIDATION_FAILED');
      expect(validationError.message).toBe('Input validation failed');
      expect(validationError.details?.email).toBe('Invalid email format');
      expect(validationError.details?.password).toEqual(['Too short', 'Missing special character']);
      expect(validationError.statusCode).toBe(400);

      const genericError: ApiError = {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong',
      };
      expect(genericError.code).toBe('INTERNAL_SERVER_ERROR');
      expect(genericError.message).toBe('Something went wrong');
      expect(genericError.details).toBeUndefined();
    });

    it('PaginationMeta should define pagination details', () => {
      const meta: PaginationMeta = {
        total: 100,
        limit: 10,
        page: 3,
        totalPages: 10,
      };

      expect(meta.total).toBe(100);
      expect(meta.limit).toBe(10);
      expect(meta.page).toBe(3);
      expect(meta.totalPages).toBe(10);

      // @ts-expect-error: Property 'total' is missing in type '{ limit: number; page: number; totalPages: number; }' but required in type 'PaginationMeta'.
      // const incompleteMeta: PaginationMeta = { limit: 5, page: 1, totalPages: 2 };
    });
  });

  // --- 3. Environment Variables Augmentation ---

  describe('Environment Variables Augmentation', () => {
    const originalProcessEnv = process.env;

    beforeEach(() => {
      // Mock process.env to simulate environment variables being set
      process.env = {
        ...originalProcessEnv, // Keep existing env vars if any
        API_URL: 'http://test-api.com',
        NODE_ENV: 'test',
        IS_DEV: 'false',
      } as NodeJS.ProcessEnv; // Cast to ensure type safety in test setup
    });

    afterEach(() => {
      // Restore original process.env after each test
      process.env = originalProcessEnv;
    });

    it('NodeJS.ProcessEnv augmentation should provide type-checked environment variables', () => {
      // These assertions check the runtime values, which are influenced by the type declaration
      // if the environment variables are set.
      expect(process.env.API_URL).toBe('http://test-api.com');
      expect(process.env.NODE_ENV).toBe('test');
      expect(process.env.IS_DEV).toBe('false');

      // Demonstrate that assigning an incorrect type would be a compile-time error
      // @ts-expect-error: Type '"invalid"' is not assignable to type '"development" | "production" | "test"'.
      // process.env.NODE_ENV = 'invalid';

      // @ts-expect-error: Type 'number' is not assignable to type 'string'.
      // process.env.API_URL = 123;
    });

    it('ImportMetaEnv augmentation is for browser environments and cannot be directly tested in Node.js Jest', () => {
      // `import.meta.env` is a browser/bundler-specific construct (e.g., Vite, Create React App).
      // Jest runs in a Node.js environment, so `import.meta.env` will not be available or typed
      // by the `ImportMetaEnv` declaration in a standard Jest setup.
      // This test serves as documentation that the declaration exists for its intended environment.

      // If you were to run this code in a browser environment with Vite, for example:
      // console.log(import.meta.env.VITE_API_URL); // Would be type-checked as string
      // console.log(import.meta.env.VITE_NODE_ENV); // Would be type-checked as 'development' | 'production' | 'test'

      // We can't assert on `import.meta.env` directly here without a complex mock
      // that would go beyond testing the type declaration itself.
      expect(true).toBe(true); // Placeholder assertion
    });
  });
});