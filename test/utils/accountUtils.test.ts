import { airdropAccount } from '../../src/utils/accountUtils';
import { SorobanToolkit, StellarNetworkConfig } from '../../src/config/toolkit';
import { Keypair } from '@stellar/stellar-sdk';

describe('Account Utils', () => {
  let adminKeypair: Keypair;
  let testAccount: Keypair;
  let testNetwork: StellarNetworkConfig;
  let mockToolkit: SorobanToolkit;

  beforeEach(() => {
    // Create random keypairs for testing
    adminKeypair = Keypair.random();
    testAccount = Keypair.random();
    
    testNetwork = {
      network: 'testnet',
      friendbotUrl: 'https://friendbot.stellar.org',
      horizonRpcUrl: 'https://horizon-testnet.stellar.org',
      sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
      networkPassphrase: 'Test SDF Network ; September 2015',
    };

    // Create a mock toolkit
    mockToolkit = new SorobanToolkit({
      adminSecret: adminKeypair.secret(),
      network: testNetwork,
    });
  });

  describe('airdropAccount', () => {
    it('should call RPC requestAirdrop method', async () => {
      // Mock the RPC requestAirdrop method
      const mockRequestAirdrop = jest.fn().mockResolvedValue(undefined);
      mockToolkit.rpc.requestAirdrop = mockRequestAirdrop;

      await airdropAccount(mockToolkit, testAccount);

      expect(mockRequestAirdrop).toHaveBeenCalledWith(
        testAccount.publicKey(),
        testNetwork.friendbotUrl
      );
    });

    it('should handle airdrop errors gracefully', async () => {
      // Mock the RPC requestAirdrop method to throw an error with status 502
      const mockRequestAirdrop = jest.fn().mockRejectedValue({ status: 502 });
      mockToolkit.rpc.requestAirdrop = mockRequestAirdrop;

      // Should not throw, but log the error
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      await airdropAccount(mockToolkit, testAccount);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Couldnt fund account, Friendbot is unavailable.'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle other airdrop errors gracefully', async () => {
      // Create a toolkit with verbose logging enabled
      const verboseToolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'some',
      });

      // Mock the RPC requestAirdrop method to throw a different error
      const mockRequestAirdrop = jest.fn().mockRejectedValue(new Error('Other error'));
      verboseToolkit.rpc.requestAirdrop = mockRequestAirdrop;

      // Should not throw, but log the verbose message
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      await airdropAccount(verboseToolkit, testAccount);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        `Account ${testAccount.publicKey()} is already funded`
      );
      
      consoleSpy.mockRestore();
    });

    it('should work with different friendbot URLs', async () => {
      const customNetwork = {
        ...testNetwork,
        friendbotUrl: 'https://custom-friendbot.example.com',
      };

      const customToolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: customNetwork,
      });

      const mockRequestAirdrop = jest.fn().mockResolvedValue(undefined);
      customToolkit.rpc.requestAirdrop = mockRequestAirdrop;

      await airdropAccount(customToolkit, testAccount);

      expect(mockRequestAirdrop).toHaveBeenCalledWith(
        testAccount.publicKey(),
        'https://custom-friendbot.example.com'
      );
    });

    it('should handle missing friendbot URL gracefully', async () => {
      const networkWithoutFriendbot = {
        ...testNetwork,
        friendbotUrl: undefined,
      };

      const toolkitWithoutFriendbot = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: networkWithoutFriendbot,
      });

      const mockRequestAirdrop = jest.fn().mockResolvedValue(undefined);
      toolkitWithoutFriendbot.rpc.requestAirdrop = mockRequestAirdrop;

      // Should not throw when friendbot URL is missing
      await expect(airdropAccount(toolkitWithoutFriendbot, testAccount)).resolves.not.toThrow();
    });

    it('should log verbose messages when verbose is enabled', async () => {
      const verboseToolkit = new SorobanToolkit({
        adminSecret: adminKeypair.secret(),
        network: testNetwork,
        verbose: 'full',
      });

      const mockRequestAirdrop = jest.fn().mockResolvedValue(undefined);
      verboseToolkit.rpc.requestAirdrop = mockRequestAirdrop;
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await airdropAccount(verboseToolkit, testAccount);

      expect(consoleSpy).toHaveBeenCalledWith(
        `Start funding account: ${testAccount.publicKey()}`
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        `Funded account: ${testAccount.publicKey()}`
      );

      consoleSpy.mockRestore();
    });
  });
}); 