import { createToolkit } from '../../src/config/loader';
import { Keypair } from '@stellar/stellar-sdk';

describe('Toolkit Loader', () => {
  let adminKeypair: Keypair;

  beforeEach(() => {
    // Create a random admin keypair for testing
    adminKeypair = Keypair.random();
  });

  describe('createToolkit', () => {
    it('should create toolkit with default networks', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
      });

      expect(toolkit).toBeDefined();
      expect(toolkit.listAvailableNetworks()).toContain('testnet');
      expect(toolkit.listAvailableNetworks()).toContain('futurenet');
    });

    it('should create toolkit with custom networks', () => {
      const customNetwork = {
        network: 'custom-test',
        horizonRpcUrl: 'https://horizon-testnet.stellar.org',
        sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
      };

      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
        customNetworks: [customNetwork],
      });

      expect(toolkit.listAvailableNetworks()).toContain('custom-test');
    });

    it('should create toolkit with contract paths', () => {
      const contractPaths = {
        token: './contracts/token.wasm',
        factory: './contracts/factory.wasm',
      };

      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
        contractPaths,
      });

      const testnetToolkit = toolkit.getNetworkToolkit('testnet');
      expect(testnetToolkit).toBeDefined();
    });

    it('should create toolkit with custom address book path', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
        addressBookPath: './custom-address-book',
      });

      expect(toolkit).toBeDefined();
    });

    it('should create toolkit with verbose logging', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
        verbose: 'full',
      });

      expect(toolkit).toBeDefined();
    });
  });

  describe('getNetworkToolkit', () => {
    it('should return toolkit for testnet', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
      });

      const testnetToolkit = toolkit.getNetworkToolkit('testnet');
      expect(testnetToolkit).toBeDefined();
      expect(testnetToolkit.passphrase).toBe('Test SDF Network ; September 2015');
    });

    it('should return toolkit for futurenet', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
      });

      const futurenetToolkit = toolkit.getNetworkToolkit('futurenet');
      expect(futurenetToolkit).toBeDefined();
      expect(futurenetToolkit.passphrase).toBe('Test SDF Future Network ; October 2022');
    });

    it('should throw error for unknown network', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
      });

      expect(() => {
        toolkit.getNetworkToolkit('unknown-network');
      }).toThrow('Unknown network: unknown-network');
    });
  });

  describe('listAvailableNetworks', () => {
    it('should list default networks', () => {
      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
      });

      const networks = toolkit.listAvailableNetworks();
      expect(networks).toContain('testnet');
      expect(networks).toContain('futurenet');
    });

    it('should include custom networks', () => {
      const customNetwork = {
        network: 'custom-test',
        horizonRpcUrl: 'https://horizon-testnet.stellar.org',
        sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
      };

      const toolkit = createToolkit({
        adminSecret: adminKeypair.secret(),
        customNetworks: [customNetwork],
      });

      const networks = toolkit.listAvailableNetworks();
      expect(networks).toContain('custom-test');
      expect(networks).toContain('testnet');
      expect(networks).toContain('futurenet');
    });
  });
}); 