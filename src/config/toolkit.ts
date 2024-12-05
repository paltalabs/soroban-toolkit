import { Horizon, Keypair, rpc } from "@stellar/stellar-sdk";
import { AddressBook } from "../utils/addressBook";

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
  addressBookPath?: string;
  verbose?: "none" | "some" | "full";
}

export class SorobanToolkit {
  rpc: rpc.Server;
  horizonRpc: Horizon.Server;
  passphrase: string;
  friendbotUrl?: string;
  admin: Keypair;
  contractPaths: Record<string, string>;
  addressBook: AddressBook;
  private verbose: "none" | "some" | "full";

  constructor(options: ToolkitOptions) {
    const { 
      adminSecret, 
      network, 
      contractPaths = {}, 
      addressBookPath = "./.soroban",
      verbose = "none",
    } = options;

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
    this.addressBook = AddressBook.loadFromFile(network.network, addressBookPath);
    this.verbose = verbose;
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

  /**
   * Log messages based on verbosity level.
   * @param level - The level of verbosity for this message ("some" or "full").
   * @param messages - The messages to log.
   */
  private log(level: "some" | "full", ...messages: any[]): void {
    if (this.verbose === "none") return;
    if (this.verbose === "some" && level === "some") {
      console.log(...messages);
    } else if (this.verbose === "full") {
      console.log(...messages);
    }
  }

  /**
   * Public logging method (to be used by managers/utilities).
   * @param level - The level of verbosity for this message.
   * @param messages - The messages to log.
   */
  public logVerbose(level: "some" | "full", ...messages: any[]): void {
    this.log(level, ...messages);
  }
}