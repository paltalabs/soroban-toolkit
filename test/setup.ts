// Test setup file
import '@testing-library/jest-dom';

// Mock fetch globally for tests
global.fetch = jest.fn();

// Mock console methods to avoid noise in tests
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

beforeEach(() => {
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
  
  // Suppress console output during tests unless explicitly testing it
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterEach(() => {
  // Restore console methods
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});

// Mock the stellar-sdk to avoid actual network calls during tests
jest.mock('@stellar/stellar-sdk', () => {
  const original = jest.requireActual('@stellar/stellar-sdk');
  return {
    ...original,
    Server: jest.fn().mockImplementation(() => ({
      loadAccount: jest.fn().mockResolvedValue({
        accountId: 'test-account-id',
        balances: [],
        sequence: '1',
      }),
    })),
  };
}); 