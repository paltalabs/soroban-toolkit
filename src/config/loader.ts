import { futurenet, testnet } from "./defaultNetworks";
import { StellarNetworkConfig, SorobanToolkit } from "./toolkit";

interface Toolkit {
  getNetworkToolkit: (networkName: string) => SorobanToolkit;
  listAvailableNetworks: () => string[];
}

interface CreateToolkitOptions {
  adminSecret: string;
  contractPaths?: Record<string, string>;
  customNetworks?: StellarNetworkConfig[];
  addressBookPath?: string;
  verbose?: "none" | "some" | "full";
}

export function createToolkit({
  adminSecret, 
  contractPaths, 
  customNetworks, 
  addressBookPath = "./.soroban", 
  verbose = "none"
}: CreateToolkitOptions): Toolkit {
  // Default networks
  const defaultNetworks: Record<string, StellarNetworkConfig> = {
    testnet,
    futurenet,
  };

  // Add custom networks
  const additionalNetworks = customNetworks?.reduce((acc, network) => {
    acc[network.network] = network;
    return acc;
  }, {} as Record<string, StellarNetworkConfig>) ?? {};

  // Merge default and custom networks
  const allNetworks = { ...defaultNetworks, ...additionalNetworks };

  return {
    /**
     * Load a toolkit for a specific network.
     * @param networkName - The name of the network to load.
     * @returns A SorobanToolkit instance for the specified network.
     */
    getNetworkToolkit(networkName: string): SorobanToolkit {
      const network = allNetworks[networkName];
      if (!network) {
        throw new Error(`Unknown network: ${networkName}`);
      }
      return new SorobanToolkit({ 
        adminSecret, 
        network, 
        contractPaths,
        addressBookPath,
        verbose
      });
    },

    /**
     * List available network names.
     * @returns An array of network names.
     */
    listAvailableNetworks(): string[] {
      return Object.keys(allNetworks);
    },
  };
}