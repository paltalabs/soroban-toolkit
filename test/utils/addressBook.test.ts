import { AddressBook } from '../../src/utils/addressBook';
import { existsSync, unlinkSync, rmdirSync } from 'fs';
import path from 'path';

describe('AddressBook', () => {
  const testDir = './test-address-book';
  const testNetwork = 'testnet';

  afterEach(() => {
    // Clean up test files
    try {
      if (existsSync(path.join(testDir, `${testNetwork}.contracts.json`))) {
        unlinkSync(path.join(testDir, `${testNetwork}.contracts.json`));
      }
      if (existsSync(testDir)) {
        rmdirSync(testDir);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('loadFromFile', () => {
    it('should create new address book when file does not exist', () => {
      const addressBook = AddressBook.loadFromFile(testNetwork, testDir);
      
      expect(addressBook).toBeDefined();
      expect(() => addressBook.getContractId('test')).toThrow();
    });

    it('should load existing address book from file', () => {
      // Create a test address book first
      const initialAddressBook = new AddressBook(
        new Map([['token', 'contract123']]),
        new Map([['token', 'hash456']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );
      initialAddressBook.writeToFile();

      // Load it back
      const loadedAddressBook = AddressBook.loadFromFile(testNetwork, testDir);
      
      expect(loadedAddressBook.getContractId('token')).toBe('contract123');
      expect(loadedAddressBook.getWasmHash('token')).toBe('hash456');
    });

    it('should handle malformed JSON gracefully', () => {
      // Create a malformed JSON file
      const fs = require('fs');
      if (!existsSync(testDir)) {
        fs.mkdirSync(testDir, { recursive: true });
      }
      fs.writeFileSync(
        path.join(testDir, `${testNetwork}.contracts.json`),
        'invalid json content'
      );

      // Should create new address book instead of crashing
      const addressBook = AddressBook.loadFromFile(testNetwork, testDir);
      expect(addressBook).toBeDefined();
    });
  });

  describe('writeToFile', () => {
    it('should create directory and write file', () => {
      const addressBook = new AddressBook(
        new Map([['token', 'contract123']]),
        new Map([['token', 'hash456']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.writeToFile();

      expect(existsSync(path.join(testDir, `${testNetwork}.contracts.json`))).toBe(true);
    });

    it('should write contract IDs and hashes correctly', () => {
      const addressBook = new AddressBook(
        new Map([['token', 'contract123'], ['factory', 'contract789']]),
        new Map([['token', 'hash456'], ['factory', 'hash012']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.writeToFile();

      const loadedAddressBook = AddressBook.loadFromFile(testNetwork, testDir);
      expect(loadedAddressBook.getContractId('token')).toBe('contract123');
      expect(loadedAddressBook.getContractId('factory')).toBe('contract789');
      expect(loadedAddressBook.getWasmHash('token')).toBe('hash456');
      expect(loadedAddressBook.getWasmHash('factory')).toBe('hash012');
    });
  });

  describe('getContractId', () => {
    it('should return contract ID for existing key', () => {
      const addressBook = new AddressBook(
        new Map([['token', 'contract123']]),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      const contractId = addressBook.getContractId('token');
      expect(contractId).toBe('contract123');
    });

    it('should throw error for non-existent contract key', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      expect(() => {
        addressBook.getContractId('non-existent');
      }).toThrow("Unable to find contractId for key: non-existent");
    });
  });

  describe('setContractId', () => {
    it('should set contract ID for new key', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.setContractId('new-token', 'contract999');
      expect(addressBook.getContractId('new-token')).toBe('contract999');
    });

    it('should update existing contract ID', () => {
      const addressBook = new AddressBook(
        new Map([['token', 'contract123']]),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.setContractId('token', 'contract456');
      expect(addressBook.getContractId('token')).toBe('contract456');
    });
  });

  describe('getWasmHash', () => {
    it('should return wasm hash for existing key', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map([['token', 'hash123']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      const wasmHash = addressBook.getWasmHash('token');
      expect(wasmHash).toBe('hash123');
    });

    it('should throw error for non-existent wasm hash key', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      expect(() => {
        addressBook.getWasmHash('non-existent');
      }).toThrow("Unable to find wasmHash for key: non-existent");
    });
  });

  describe('setWasmHash', () => {
    it('should set wasm hash for new key', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.setWasmHash('new-token', 'hash999');
      expect(addressBook.getWasmHash('new-token')).toBe('hash999');
    });

    it('should update existing wasm hash', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map([['token', 'hash123']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      addressBook.setWasmHash('token', 'hash456');
      expect(addressBook.getWasmHash('token')).toBe('hash456');
    });
  });

  describe('getAvailableKeys', () => {
    it('should return empty arrays for empty address book', () => {
      const addressBook = new AddressBook(
        new Map(),
        new Map(),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      const keys = addressBook.getAvailableKeys();
      expect(keys.contractKeys).toEqual([]);
      expect(keys.wasmKeys).toEqual([]);
    });

    it('should return all contract and wasm keys', () => {
      const addressBook = new AddressBook(
        new Map([['token', 'contract123'], ['factory', 'contract789']]),
        new Map([['token', 'hash123'], ['factory', 'hash789']]),
        path.join(testDir, `${testNetwork}.contracts.json`)
      );

      const keys = addressBook.getAvailableKeys();
      expect(keys.contractKeys).toContain('token');
      expect(keys.contractKeys).toContain('factory');
      expect(keys.contractKeys).toHaveLength(2);
      expect(keys.wasmKeys).toContain('token');
      expect(keys.wasmKeys).toContain('factory');
      expect(keys.wasmKeys).toHaveLength(2);
    });
  });
}); 