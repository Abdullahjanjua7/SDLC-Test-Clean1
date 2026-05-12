import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { apiClient } from '../src/apiClient'; // Adjust the path as necessary

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('apiClient', () => {
  const baseURL = 'https://api.example.com/v1';
  const defaultTimeout = 30000;
  const customTimeout = 15000;
  const authTokenKey = 'myAppAuthToken';
  const mockToken = 'test_jwt_token';

  let onUnauthorizedMock: jest.Mock;
  let onForbiddenMock: jest.Mock;
  let onNotFoundMock: jest.Mock;
  let on