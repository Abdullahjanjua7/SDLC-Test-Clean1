import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { ApiService, ApiError, ApiErrorDetails, ApiSuccessResponse } from './apiService'; // Adjust path as needed

// Mock axios
jest.mock('axios');

// Cast axios to a JestMocked type for easier access to mock methods
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock an AxiosInstance
const mockAxiosInstance = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  interceptors: {
    response: {
      use: jest.fn(),
    },
  },
  defaults: {
    headers: {
      common: {},
    },
  },
} as unknown as jest.Mocked<AxiosInstance>; // Cast to AxiosInstance

// Mock axios.create to return our mock instance
mockedAxios.create.mockReturnValue(mockAxiosInstance);

// Mock axios.isAxiosError
// This is crucial for the handleError method to correctly identify AxiosErrors
mockedAxios.isAxiosError.mockImplementation((payload: any) => payload && payload.isAxiosError === true);

describe('ApiService', () => {
  const BASE_URL = 'https://api.example.com/v1';
  const COMMON_