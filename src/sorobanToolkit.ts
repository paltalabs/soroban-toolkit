import { Horizon, Keypair, rpc } from "@stellar/stellar-sdk";

export interface StellarNetworkConfig {
  network: string;
  friendbotUrl?: string;
  horizonRpcUrl: string;
  sorobanRpcUrl: string;
  networkPassphrase: string;
}

interface ToolkitOptions {
  adminSecret: string;
  network: StellarNetworkConfig;
  contractPaths?: Record<string, string>;
}

export class SorobanToolkit {
  rpc: rpc.Server;
  horizonRpc: Horizon.Server;
  passphrase: string;
  friendbotUrl?: string;
  admin: Keypair;
  contractPaths: Record<string, string>;

  constructor(options: ToolkitOptions) {
    const { adminSecret, network, contractPaths = {} } = options;

    if (!adminSecret) {
      throw new Error("Admin secret key is required.");
    }

    this.rpc = new rpc.Server(network.sorobanRpcUrl, { allowHttp: true });
    this.horizonRpc = new Horizon.Server(network.horizonRpcUrl, {
      allowHttp: true,
    });
    this.passphrase = network.networkPassphrase;
    this.friendbotUrl = network.friendbotUrl;
    this.admin = Keypair.fromSecret(adminSecret);
    this.contractPaths = contractPaths;
  }

  /**
   * Get the path to a specific contract.
   * @param key - The contract key.
   * @returns The contract path.
   */
  getContractPath(key: string): string {
    const path = this.contractPaths[key];
    if (!path) {
      throw new Error(`Contract path for key '${key}' is not defined.`);
    }
    return path;
  }

  /**
   * Create a Keypair from a private key.
   * @param privateKey - The private key.
   * @returns A Keypair instance.
   */
  createKeypair(privateKey: string): Keypair {
    return Keypair.fromSecret(privateKey);
  }
}