import { SorobanToolkit, StellarNetworkConfig } from '../../src/config/toolkit';
import { Keypair } from '@stellar/stellar-sdk';

describe('SorobanToolkit', () => {
  let adminKeypair: Keypair;
  let testNetwork: StellarNetworkConfig;

  beforeEach(() => {
    // Create a random admin keypair for testing
    adminKeypair = Keypair.random();
    
    testNetwork = {
      network: 'testnet',
      friendbotUrl: 'https://friendbot.stellar.org',
      horizonRpcUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015',
    };
  });

  describe('constructor', () => {
    it('should create toolkit with valid options', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
      });

      expect(toolkit).toBeDefined();
      expect(toolkit.admin).toEqual(adminKeypair);
      expect(toolkit.passphrase).toBe(testNetwork.networkPassphrase);
      expect(toolkit.friendbotUrl).toBe(testNetwork.friendbotUrl);
    });

    it('should create toolkit with contract paths', () => {
      const contractPaths = {
        token: './contracts/token.wasm',
        factory: './contracts/factory.wasm',
      };

      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        contractPaths,
      });

      expect(toolkit.contractPaths).toEqual(contractPaths);
    });

    it('should create toolkit with custom address book path', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        addressBookPath: './custom-address-book',
      });

      expect(toolkit.addressBook).toBeDefined();
    });

    it('should create toolkit with verbose logging', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'full',
      });

      expect(toolkit).toBeDefined();
    });

    it('should throw error when admin secret is missing', () => {
      expect(() => {
        new SorobanToolkit({
          adminSecret: '',
          network: testNetwork,
        });
      }).toThrow('Admin secret key is required.');
    });

    it('should create RPC servers with correct URLs', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
      });

      expect(toolkit.rpc).toBeDefined();
      expect(toolkit.horizonRpc).toBeDefined();
    });

    it('should handle HTTP URLs for local development', () => {
      const localNetwork = {
        ...testNetwork,
        sorobanRpcUrl: 'http://localhost:8000/soroban/rpc',
        horizonRpcUrl: 'http://localhost:8000',
      };

      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: localNetwork,
      });

      expect(toolkit.rpc).toBeDefined();
      expect(toolkit.horizonRpc).toBeDefined();
    });
  });

  describe('getContractPath', () => {
    it('should return contract path for existing key', () => {
      const contractPaths = {
        token: './contracts/token.wasm',
      };

      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        contractPaths,
      });

      const path = toolkit.getContractPath('token');
      expect(path).toBe('./contracts/token.wasm');
    });

    it('should throw error for non-existent contract key', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
      });

      expect(() => {
        toolkit.getContractPath('non-existent');
      }).toThrow("Contract path for key 'non-existent' is not defined.");
    });
  });

  describe('createKeypair', () => {
    it('should create keypair from private key', () => {
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
      });

      const newKeypair = toolkit.createKeypair(adminKeypair.secret());
      expect(newKeypair).toEqual(adminKeypair);
    });
  });

  describe('logVerbose', () => {
    it('should log when verbose is set to some', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'some',
      });

      toolkit.logVerbose('some', 'Test message');
      expect(consoleSpy).toHaveBeenCalledWith('Test message');
      
      consoleSpy.mockRestore();
    });

    it('should log when verbose is set to full', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'full',
      });

      toolkit.logVerbose('some', 'Test message');
      toolkit.logVerbose('full', 'Full message');
      expect(consoleSpy).toHaveBeenCalledTimes(2);
      
      consoleSpy.mockRestore();
    });

    it('should not log when verbose is set to none', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const toolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'none',
      });

      toolkit.logVerbose('some', 'Test message');
      expect(consoleSpy).not.toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });
}); 