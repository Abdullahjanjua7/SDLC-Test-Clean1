import {
  ApiResponse,
  ApiErrorDetail,
  ApiErrorResponse,
  ApiResult,
  PaginationQueryParams,
  PaginationMeta,
  PaginatedResponse,
  Identifiable,
  Timestamped,
  BaseResource,
  IUser,
  IProduct,
  GetUsersRequestParams,
  GetUsersResponse,
  GetUserResponse,
  CreateUserRequestPayload,
  CreateUserResponse,
  UpdateUserRequestPayload,
  UpdateUserResponse,
  DeleteUserResponse,
  GetProductsRequestParams,
  GetProductsResponse,
  GetProductResponse,
  CreateProductRequestPayload,
  CreateProductResponse,
  UpdateProductRequestPayload,
  UpdateProductResponse,
  DeleteProductResponse,
} from './api'; // Assuming the file is src/types/api.ts and tests are in a sibling directory or similar. Adjust path as needed.

describe('API Type Definitions', () => {

  // Helper function to check if an object has specific properties
  const hasProperties = (obj: any, props: string[]) => {
    return props.every(prop => Object.prototype.hasOwnProperty.call(obj, prop));
  };

  // Helper function to check if an object does NOT have specific properties
  const doesNotHaveProperties = (obj: any, props: string[]) => {
    return props.every(prop => !Object.prototype.hasOwnProperty.call(obj, prop));
  };

  // --- Core API Structures ---

  describe('ApiResponse<T>', () => {
    it('should correctly represent a successful API response with data', () => {
      interface TestData {
        id: number;
        name: string;
      }
      const data: TestData = { id: 1, name: 'Test Item' };
      const response: ApiResponse<TestData> = {
        success: true,
        data: data,
        message: 'Item fetched successfully',
      };

      expect(response).toEqual({
        success: true,
        data: { id: 1, name: 'Test Item' },
        message: 'Item fetched successfully',
      });
      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
      expect(response.message).toBe('Item fetched successfully');
      expect(hasProperties(response, ['success', 'data', 'message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });

    it('should correctly represent a successful API response without an optional message', () => {
      interface TestData {
        status: string;
      }
      const data: TestData = { status: 'OK' };
      const response: ApiResponse<TestData> = {
        success: true,
        data: data,
      };

      expect(response.success).toBe(true);
      expect(response.data).toBe(data);
      expect(response.message).toBeUndefined();
      expect(hasProperties(response, ['success', 'data'])).toBe(true);
      expect(doesNotHaveProperties(response, ['message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('ApiErrorDetail', () => {
    it('should correctly represent an error detail object', () => {
      const errorDetail: ApiErrorDetail = {
        code: 'VALIDATION_ERROR',
        message: 'Input data is invalid.',
        details: {
          field: 'email',
          reason: 'Invalid format',
        },
      };

      expect(errorDetail).toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Input data is invalid.',
        details: { field: 'email', reason: 'Invalid format' },
      });
      expect(errorDetail.code).toBe('VALIDATION_ERROR');
      expect(errorDetail.message).toBe('Input data is invalid.');
      expect(errorDetail.details).toEqual({ field: 'email', reason: 'Invalid format' });
      expect(hasProperties(errorDetail, ['code', 'message', 'details'])).toBe(true);
      expect(errorDetail).toMatchSnapshot();
    });

    it('should correctly represent an error detail object without optional details', () => {
      const errorDetail: ApiErrorDetail = {
        code: 'NOT_FOUND',
        message: 'Resource not found.',
      };

      expect(errorDetail.code).toBe('NOT_FOUND');
      expect(errorDetail.message).toBe('Resource not found.');
      expect(errorDetail.details).toBeUndefined();
      expect(hasProperties(errorDetail, ['code', 'message'])).toBe(true);
      expect(doesNotHaveProperties(errorDetail, ['details'])).toBe(true);
      expect(errorDetail).toMatchSnapshot();
    });
  });

  describe('ApiErrorResponse', () => {
    it('should correctly represent an API error response', () => {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'AUTH_FAILED',
          message: 'Authentication required.',
        },
        message: 'Failed to process request.',
      };

      expect(errorResponse).toEqual({
        success: false,
        error: { code: 'AUTH_FAILED', message: 'Authentication required.' },
        message: 'Failed to process request.',
      });
      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error.code).toBe('AUTH_FAILED');
      expect(errorResponse.error.message).toBe('Authentication required.');
      expect(errorResponse.message).toBe('Failed to process request.');
      expect(hasProperties(errorResponse, ['success', 'error', 'message'])).toBe(true);
      expect(errorResponse).toMatchSnapshot();
    });

    it('should correctly represent an API error response without an optional general message', () => {
      const errorResponse: ApiErrorResponse = {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Internal server error.',
        },
      };

      expect(errorResponse.success).toBe(false);
      expect(errorResponse.error.code).toBe('SERVER_ERROR');
      expect(errorResponse.error.message).toBe('Internal server error.');
      expect(errorResponse.message).toBeUndefined();
      expect(hasProperties(errorResponse, ['success', 'error'])).toBe(true);
      expect(doesNotHaveProperties(errorResponse, ['message'])).toBe(true);
      expect(errorResponse).toMatchSnapshot();
    });
  });

  describe('ApiResult<T>', () => {
    interface User {
      id: string;
      name: string;
    }

    it('should accept an ApiResponse<T>', () => {
      const successResult: ApiResult<User> = {
        success: true,
        data: { id: '123', name: 'Alice' },
      };
      expect(successResult.success).toBe(true);
      expect((successResult as ApiResponse<User>).data.name).toBe('Alice');
      expect(successResult).toMatchSnapshot();
    });

    it('should accept an ApiErrorResponse', () => {
      const errorResult: ApiResult<User> = {
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User with ID 456 not found.' },
      };
      expect(errorResult.success).toBe(false);
      expect((errorResult as ApiErrorResponse).error.code).toBe('USER_NOT_FOUND');
      expect(errorResult).toMatchSnapshot();
    });
  });

  // --- Pagination ---

  describe('PaginationQueryParams', () => {
    it('should correctly represent pagination query parameters', () => {
      const params: PaginationQueryParams = {
        page: 2,
        limit: 10,
        search: 'test',
        sortBy: 'name',
        sortOrder: 'desc',
      };

      expect(params).toEqual({
        page: 2,
        limit: 10,
        search: 'test',
        sortBy: 'name',
        sortOrder: 'desc',
      });
      expect(params.page).toBe(2);
      expect(params.limit).toBe(10);
      expect(params.search).toBe('test');
      expect(params.sortBy).toBe('name');
      expect(params.sortOrder).toBe('desc');
      expect(hasProperties(params, ['page', 'limit', 'search', 'sortBy', 'sortOrder'])).toBe(true);
      expect(params).toMatchSnapshot();
    });

    it('should allow all parameters to be optional', () => {
      const params: PaginationQueryParams = {};
      expect(params.page).toBeUndefined();
      expect(params.limit).toBeUndefined();
      expect(params.search).toBeUndefined();
      expect(params.sortBy).toBeUndefined();
      expect(params.sortOrder).toBeUndefined();
      expect(Object.keys(params).length).toBe(0);
      expect(params).toMatchSnapshot();
    });
  });

  describe('PaginationMeta', () => {
    it('should correctly represent pagination metadata', () => {
      const meta: PaginationMeta = {
        page: 1,
        limit: 20,
        totalItems: 100,
        totalPages: 5,
        itemCount: 20,
        nextPage: '/api/items?page=2',
        prevPage: undefined,
      };

      expect(meta).toEqual({
        page: 1,
        limit: 20,
        totalItems: 100,
        totalPages: 5,
        itemCount: 20,
        nextPage: '/api/items?page=2',
        prevPage: undefined,
      });
      expect(meta.page).toBe(1);
      expect(meta.limit).toBe(20);
      expect(meta.totalItems).toBe(100);
      expect(meta.totalPages).toBe(5);
      expect(meta.itemCount).toBe(20);
      expect(meta.nextPage).toBe('/api/items?page=2');
      expect(meta.prevPage).toBeUndefined();
      expect(hasProperties(meta, ['page', 'limit', 'totalItems', 'totalPages', 'itemCount', 'nextPage'])).toBe(true);
      expect(doesNotHaveProperties(meta, ['prevPage'])).toBe(true); // prevPage is undefined, so it's not a property
      expect(meta).toMatchSnapshot();
    });
  });

  describe('PaginatedResponse<T>', () => {
    interface Item {
      id: string;
      value: string;
    }
    it('should correctly represent a paginated API response', () => {
      const items: Item[] = [{ id: 'a', value: 'A' }, { id: 'b', value: 'B' }];
      const meta: PaginationMeta = {
        page: 1,
        limit: 2,
        totalItems: 5,
        totalPages: 3,
        itemCount: 2,
        nextPage: '/api/items?page=2',
      };
      const response: PaginatedResponse<Item> = {
        success: true,
        data: items,
        meta: meta,
      };

      expect(response.success).toBe(true);
      expect(response.data).toEqual(items);
      expect(response.meta).toEqual(meta);
      expect(response.meta.page).toBe(1);
      expect(response.data.length).toBe(2);
      expect(hasProperties(response, ['success', 'data', 'meta'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  // --- Base Resources ---

  describe('Identifiable', () => {
    it('should define an object with an id property', () => {
      const resource: Identifiable = { id: 'unique-id-123' };
      expect(resource.id).toBe('unique-id-123');
      expect(hasProperties(resource, ['id'])).toBe(true);
      expect(resource).toMatchSnapshot();
    });
  });

  describe('Timestamped', () => {
    it('should define an object with createdAt and updatedAt properties', () => {
      const now = new Date().toISOString();
      const resource: Timestamped = { createdAt: now, updatedAt: now };
      expect(resource.createdAt).toBe(now);
      expect(resource.updatedAt).toBe(now);
      expect(hasProperties(resource, ['createdAt', 'updatedAt'])).toBe(true);
      expect(resource).toMatchSnapshot();
    });
  });

  describe('BaseResource', () => {
    it('should combine Identifiable and Timestamped properties', () => {
      const now = new Date().toISOString();
      const resource: BaseResource = {
        id: 'base-resource-456',
        createdAt: now,
        updatedAt: now,
      };
      expect(resource.id).toBe('base-resource-456');
      expect(resource.createdAt).toBe(now);
      expect(resource.updatedAt).toBe(now);
      expect(hasProperties(resource, ['id', 'createdAt', 'updatedAt'])).toBe(true);
      expect(resource).toMatchSnapshot();
    });
  });

  // --- Example API Entities ---

  describe('IUser', () => {
    it('should correctly define a User entity', () => {
      const now = new Date().toISOString();
      const user: IUser = {
        id: 'user-1',
        createdAt: now,
        updatedAt: now,
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: 'user',
        isActive: true,
      };

      expect(user.id).toBe('user-1');
      expect(user.createdAt).toBe(now);
      expect(user.updatedAt).toBe(now);
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john.doe@example.com');
      expect(user.role).toBe('user');
      expect(user.isActive).toBe(true);
      expect(hasProperties(user, ['id', 'createdAt', 'updatedAt', 'name', 'email', 'role', 'isActive'])).toBe(true);
      expect(user).toMatchSnapshot();
    });
  });

  describe('IProduct', () => {
    it('should correctly define a Product entity', () => {
      const now = new Date().toISOString();
      const product: IProduct = {
        id: 'prod-1',
        createdAt: now,
        updatedAt: now,
        name: 'Laptop',
        description: 'Powerful laptop for professionals',
        price: 1200.00,
        stock: 50,
        category: 'Electronics',
        imageUrl: 'http://example.com/laptop.jpg',
      };

      expect(product.id).toBe('prod-1');
      expect(product.createdAt).toBe(now);
      expect(product.updatedAt).toBe(now);
      expect(product.name).toBe('Laptop');
      expect(product.description).toBe('Powerful laptop for professionals');
      expect(product.price).toBe(1200.00);
      expect(product.stock).toBe(50);
      expect(product.category).toBe('Electronics');
      expect(product.imageUrl).toBe('http://example.com/laptop.jpg');
      expect(hasProperties(product, ['id', 'createdAt', 'updatedAt', 'name', 'description', 'price', 'stock', 'category', 'imageUrl'])).toBe(true);
      expect(product).toMatchSnapshot();
    });

    it('should allow imageUrl to be optional', () => {
      const now = new Date().toISOString();
      const product: IProduct = {
        id: 'prod-2',
        createdAt: now,
        updatedAt: now,
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 25.00,
        stock: 200,
        category: 'Accessories',
      };
      expect(product.imageUrl).toBeUndefined();
      expect(hasProperties(product, ['id', 'createdAt', 'updatedAt', 'name', 'description', 'price', 'stock', 'category'])).toBe(true);
      expect(doesNotHaveProperties(product, ['imageUrl'])).toBe(true);
      expect(product).toMatchSnapshot();
    });
  });

  // --- Example Request/Response Types for Users ---

  describe('GetUsersRequestParams', () => {
    it('should extend PaginationQueryParams and add user-specific filters', () => {
      const params: GetUsersRequestParams = {
        page: 1,
        limit: 5,
        search: 'john',
        role: 'admin',
        isActive: true,
      };
      expect(params.page).toBe(1);
      expect(params.limit).toBe(5);
      expect(params.search).toBe('john');
      expect(params.role).toBe('admin');
      expect(params.isActive).toBe(true);
      expect(hasProperties(params, ['page', 'limit', 'search', 'role', 'isActive'])).toBe(true);
      expect(params).toMatchSnapshot();
    });

    it('should allow all parameters to be optional', () => {
      const params: GetUsersRequestParams = {};
      expect(params.page).toBeUndefined();
      expect(params.role).toBeUndefined();
      expect(Object.keys(params).length).toBe(0);
      expect(params).toMatchSnapshot();
    });
  });

  describe('GetUsersResponse', () => {
    it('should be a PaginatedResponse of IUser', () => {
      const now = new Date().toISOString();
      const users: IUser[] = [{
        id: 'u1',
        createdAt: now,
        updatedAt: now,
        name: 'User One',
        email: 'u1@example.com',
        role: 'user',
        isActive: true,
      }, {
        id: 'u2',
        createdAt: now,
        updatedAt: now,
        name: 'User Two',
        email: 'u2@example.com',
        role: 'guest',
        isActive: false,
      }, ];
      const meta: PaginationMeta = {
        page: 1,
        limit: 2,
        totalItems: 10,
        totalPages: 5,
        itemCount: 2,
      };
      const response: GetUsersResponse = {
        success: true,
        data: users,
        meta: meta,
      };
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
      expect(response.data[0].name).toBe('User One');
      expect(response.meta.totalItems).toBe(10);
      expect(hasProperties(response, ['success', 'data', 'meta'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('GetUserResponse', () => {
    it('should be an ApiResponse of IUser', () => {
      const now = new Date().toISOString();
      const user: IUser = {
        id: 'u1',
        createdAt: now,
        updatedAt: now,
        name: 'User One',
        email: 'u1@example.com',
        role: 'user',
        isActive: true,
      };
      const response: GetUserResponse = {
        success: true,
        data: user,
      };
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('u1');
      expect(response.data.name).toBe('User One');
      expect(hasProperties(response, ['success', 'data'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('CreateUserRequestPayload', () => {
    it('should omit BaseResource fields from IUser', () => {
      const payload: CreateUserRequestPayload = {
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        isActive: true,
      };
      expect(payload.name).toBe('New User');
      expect(payload.email).toBe('new@example.com');
      expect(payload.role).toBe('user');
      expect(payload.isActive).toBe(true);
      expect(doesNotHaveProperties(payload, ['id', 'createdAt', 'updatedAt'])).toBe(true);
      expect(hasProperties(payload, ['name', 'email', 'role', 'isActive'])).toBe(true);
      expect(payload).toMatchSnapshot();
    });
  });

  describe('CreateUserResponse', () => {
    it('should be an ApiResponse of IUser', () => {
      const now = new Date().toISOString();
      const user: IUser = {
        id: 'new-u-id',
        createdAt: now,
        updatedAt: now,
        name: 'New User',
        email: 'new@example.com',
        role: 'user',
        isActive: true,
      };
      const response: CreateUserResponse = {
        success: true,
        data: user,
        message: 'User created successfully',
      };
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('new-u-id');
      expect(response.message).toBe('User created successfully');
      expect(hasProperties(response, ['success', 'data', 'message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('UpdateUserRequestPayload', () => {
    it('should be a partial of IUser without BaseResource fields', () => {
      const payload: UpdateUserRequestPayload = {
        name: 'Updated Name',
        isActive: false,
      };
      expect(payload.name).toBe('Updated Name');
      expect(payload.isActive).toBe(false);
      expect(payload.email).toBeUndefined(); // Optional
      expect(doesNotHaveProperties(payload, ['id', 'createdAt', 'updatedAt'])).toBe(true);
      expect(hasProperties(payload, ['name', 'isActive'])).toBe(true);
      expect(payload).toMatchSnapshot();
    });

    it('should allow an empty object for no updates', () => {
      const payload: UpdateUserRequestPayload = {};
      expect(Object.keys(payload).length).toBe(0);
      expect(payload).toMatchSnapshot();
    });
  });

  describe('UpdateUserResponse', () => {
    it('should be an ApiResponse of IUser', () => {
      const now = new Date().toISOString();
      const user: IUser = {
        id: 'u-to-update',
        createdAt: now,
        updatedAt: now,
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'user',
        isActive: false,
      };
      const response: UpdateUserResponse = {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Updated User');
      expect(response.data.isActive).toBe(false);
      expect(hasProperties(response, ['success', 'data', 'message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('DeleteUserResponse', () => {
    it('should be an ApiResponse with id and message', () => {
      const response: DeleteUserResponse = {
        success: true,
        data: { id: 'user-to-delete', message: 'User deleted successfully' },
      };
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('user-to-delete');
      expect(response.data.message).toBe('User deleted successfully');
      expect(hasProperties(response, ['success', 'data'])).toBe(true);
      expect(hasProperties(response.data, ['id', 'message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  // --- Example Request/Response Types for Products ---

  describe('GetProductsRequestParams', () => {
    it('should extend PaginationQueryParams and add product-specific filters', () => {
      const params: GetProductsRequestParams = {
        page: 1,
        limit: 5,
        search: 'laptop',
        category: 'Electronics',
        minPrice: 500,
        maxPrice: 1500,
        inStock: true,
      };
      expect(params.page).toBe(1);
      expect(params.limit).toBe(5);
      expect(params.search).toBe('laptop');
      expect(params.category).toBe('Electronics');
      expect(params.minPrice).toBe(500);
      expect(params.maxPrice).toBe(1500);
      expect(params.inStock).toBe(true);
      expect(hasProperties(params, ['page', 'limit', 'search', 'category', 'minPrice', 'maxPrice', 'inStock'])).toBe(true);
      expect(params).toMatchSnapshot();
    });

    it('should allow all parameters to be optional', () => {
      const params: GetProductsRequestParams = {};
      expect(params.page).toBeUndefined();
      expect(params.category).toBeUndefined();
      expect(Object.keys(params).length).toBe(0);
      expect(params).toMatchSnapshot();
    });
  });

  describe('GetProductsResponse', () => {
    it('should be a PaginatedResponse of IProduct', () => {
      const now = new Date().toISOString();
      const products: IProduct[] = [{
        id: 'p1',
        createdAt: now,
        updatedAt: now,
        name: 'Product One',
        description: 'Desc 1',
        price: 10.00,
        stock: 100,
        category: 'Category A',
      }, {
        id: 'p2',
        createdAt: now,
        updatedAt: now,
        name: 'Product Two',
        description: 'Desc 2',
        price: 20.00,
        stock: 50,
        category: 'Category B',
      }, ];
      const meta: PaginationMeta = {
        page: 1,
        limit: 2,
        totalItems: 10,
        totalPages: 5,
        itemCount: 2,
      };
      const response: GetProductsResponse = {
        success: true,
        data: products,
        meta: meta,
      };
      expect(response.success).toBe(true);
      expect(response.data.length).toBe(2);
      expect(response.data[0].name).toBe('Product One');
      expect(response.meta.totalItems).toBe(10);
      expect(hasProperties(response, ['success', 'data', 'meta'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('GetProductResponse', () => {
    it('should be an ApiResponse of IProduct', () => {
      const now = new Date().toISOString();
      const product: IProduct = {
        id: 'p1',
        createdAt: now,
        updatedAt: now,
        name: 'Product One',
        description: 'Desc 1',
        price: 10.00,
        stock: 100,
        category: 'Category A',
      };
      const response: GetProductResponse = {
        success: true,
        data: product,
      };
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('p1');
      expect(response.data.name).toBe('Product One');
      expect(hasProperties(response, ['success', 'data'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('CreateProductRequestPayload', () => {
    it('should omit BaseResource fields from IProduct', () => {
      const payload: CreateProductRequestPayload = {
        name: 'New Product',
        description: 'A brand new product',
        price: 99.99,
        stock: 100,
        category: 'New Category',
      };
      expect(payload.name).toBe('New Product');
      expect(payload.price).toBe(99.99);
      expect(doesNotHaveProperties(payload, ['id', 'createdAt', 'updatedAt'])).toBe(true);
      expect(hasProperties(payload, ['name', 'description', 'price', 'stock', 'category'])).toBe(true);
      expect(payload).toMatchSnapshot();
    });
  });

  describe('CreateProductResponse', () => {
    it('should be an ApiResponse of IProduct', () => {
      const now = new Date().toISOString();
      const product: IProduct = {
        id: 'new-p-id',
        createdAt: now,
        updatedAt: now,
        name: 'New Product',
        description: 'A brand new product',
        price: 99.99,
        stock: 100,
        category: 'New Category',
      };
      const response: CreateProductResponse = {
        success: true,
        data: product,
        message: 'Product created successfully',
      };
      expect(response.success).toBe(true);
      expect(response.data.id).toBe('new-p-id');
      expect(response.message).toBe('Product created successfully');
      expect(hasProperties(response, ['success', 'data', 'message'])).toBe(true);
      expect(response).toMatchSnapshot();
    });
  });

  describe('UpdateProductRequestPayload', () => {
    it('should be a partial of IProduct without BaseResource fields', () => {
      const payload: UpdateProductRequestPayload = {
        price: 109.99,
        stock: 90,
      };
      expect(payload.price).toBe(109.99);
      expect(payload.stock).toBe(90);
      expect(payload.name).toBeUndefined(); // Optional
      expect(doesNotHaveProperties(payload, ['id', 'createdAt', 'updatedAt'])).toBe(true);
      expect(hasProperties(payload, ['price', 'stock'])).toBe(true);
      expect(payload).toMatchSnapshot();
    });

    it('should allow an empty object for no updates', () => {
      const payload: UpdateProductRequestPayload = {};
      expect(Object.keys(payload).length).toBe(0