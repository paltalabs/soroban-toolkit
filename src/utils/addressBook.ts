import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

export class AddressBook {
  private ids: Map<string, string>;
  private hashes: Map<string, string>;
  private fileName: string;

  constructor(
    ids: Map<string, string>,
    hashes: Map<string, string>,
    fileName: string
  ) {
    this.ids = ids;
    this.hashes = hashes;
    this.fileName = fileName;
  }

  /**
   * Load the address book from a file or create a blank one.
   * @param network - The network name to load the contracts for.
   * @param basePath - The base path for the .soroban directory (default: ./.soroban).
   * @returns Loaded AddressBook instance.
   */
  static loadFromFile(
    network: string,
    basePath: string = "./.soroban"
  ): AddressBook {
    const fileName = path.join(basePath, `${network}.contracts.json`);
    try {
      const contractFile = readFileSync(fileName, { encoding: "utf-8" });
      const contractObj = JSON.parse(contractFile);
      return new AddressBook(
        new Map(Object.entries(contractObj.ids)),
        new Map(Object.entries(contractObj.hashes)),
        fileName
      );
    } catch (error) {
      console.warn(
        `Unable to load address book for network: ${network}. Creating a new one.`
      );
      return new AddressBook(new Map(), new Map(), fileName);
    }
  }

  /**
   * Write the current address book to a file.
   */
  writeToFile(): void {
    const dirPath = path.dirname(this.fileName);

    if (!existsSync(dirPath)) {
      mkdirSync(dirPath, { recursive: true });
    }

    const fileContent = JSON.stringify(
      this,
      (key, value) => {
        if (value instanceof Map) {
          return Object.fromEntries(value);
        }
        return key !== "fileName" ? value : undefined;
      },
      2
    );

    writeFileSync(this.fileName, fileContent, { encoding: "utf-8" });
    console.log(`Address book saved to: ${this.fileName}`);
  }

  /**
   * Get the hex-encoded contractId for a given contractKey.
   * @param contractKey - The name of the contract.
   * @returns Hex-encoded contractId.
   */
  getContractId(contractKey: string): string {
    const contractId = this.ids.get(contractKey);

    if (!contractId) {
      throw new Error(
        `Unable to find contractId for key: ${contractKey} in ${this.fileName}`
      );
    }

    return contractId;
  }

  /**
   * Set the hex-encoded contractId for a given contractKey.
   * @param contractKey - The name of the contract.
   * @param contractId - Hex-encoded contractId.
   */
  setContractId(contractKey: string, contractId: string): void {
    this.ids.set(contractKey, contractId);
  }

  /**
   * Get the hex-encoded wasmHash for a given contractKey.
   * @param contractKey - The name of the contract.
   * @returns Hex-encoded wasmHash.
   */
  getWasmHash(contractKey: string): string {
    const wasmHash = this.hashes.get(contractKey);

    if (!wasmHash) {
      throw new Error(
        `Unable to find wasmHash for key: ${contractKey} in ${this.fileName}`
      );
    }

    return wasmHash;
  }

  /**
   * Set the hex-encoded wasmHash for a given contractKey.
   * @param contractKey - The name of the contract.
   * @param wasmHash - Hex-encoded wasmHash.
   */
  setWasmHash(contractKey: string, wasmHash: string): void {
    this.hashes.set(contractKey, wasmHash);
  }

  /**
   * Get all available keys in the address book.
   * @returns An object with contract keys and wasm keys.
   */
  getAvailableKeys(): { contractKeys: string[]; wasmKeys: string[] } {
    const contractKeys = Array.from(this.ids.keys());
    const wasmKeys = Array.from(this.hashes.keys());
    return { contractKeys, wasmKeys };
  }
}