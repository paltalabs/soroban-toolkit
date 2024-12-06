import { Address, Keypair, nativeToScVal, xdr } from '@stellar/stellar-sdk';
import { resolveInternalPath } from '../utils/utils';
import { SorobanToolkit } from '../config/toolkit';
import { deployContract, installContract } from './contract';

/**
 * Deploy the Soroban Token Contract.
 * @param toolkit - The SorobanToolkit instance.
 * @param source - The Keypair to use as the source for the transaction.
 * @returns The WASM hash of the deployed token contract.
 */
export async function deploySorobanToken(
  toolkit: SorobanToolkit,
  name: string,
  symbol: string,
  decimals: number,
  source?: Keypair
) {
  toolkit.logVerbose('some', `Deploying Token: ${name} ${symbol}`);
  const wasmKey = 'soroban_token';
  const wasmBuffer = resolveInternalPath('./soroban_token.wasm');

  // Check if the WASM hash is already stored in the AddressBook
  try {
    const existingWasmHash = toolkit.addressBook.getWasmHash(wasmKey);
    if (existingWasmHash) {
      toolkit.logVerbose('full', `WASM is already installed`);
    }
  } catch {
    // WASM not found in AddressBook, proceed with installation
    toolkit.logVerbose(
      'full',
      'WASM not found in AddressBook, proceeding with installation'
    );
    await installContract(toolkit, wasmKey, wasmBuffer, source);
  }

  const args: xdr.ScVal[] = [
    new Address(source?.publicKey() ?? toolkit.admin.publicKey()).toScVal(),
    nativeToScVal(decimals, { type: 'u32' }),
    nativeToScVal(name, { type: 'string' }),
    nativeToScVal(symbol, { type: 'string' }),
  ];

  return await deployContract(toolkit, wasmKey, symbol, args, source);
}
