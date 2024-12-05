import {
  Account,
  BASE_FEE,
  Keypair,
  rpc,
  Transaction,
  TransactionBuilder,
  xdr,
} from "@stellar/stellar-sdk";
import { SorobanToolkit } from "../config/toolkit";

export async function signWithKeypair(
  toolkit: SorobanToolkit,
  txXdr: string,
  source: Keypair
): Promise<string> {
  const tx = new Transaction(txXdr, toolkit.passphrase);
  tx.sign(source);
  return tx.toXDR();
}

export async function createTransaction(
  toolkit: SorobanToolkit,
  operation: string | xdr.Operation,
  simulate: boolean = false,
  source?: Keypair
): Promise<any> {
  const txBuilder = await createTransactionBuilder(toolkit, source);

  if (typeof operation === "string") {
    operation = xdr.Operation.fromXDR(operation, "base64");
  }

  txBuilder.addOperation(operation);
  const tx = txBuilder.build();
  const result = await sendTransaction(toolkit, tx, simulate, source);

  return result;
}

export async function createTransactionBuilder(toolkit: SorobanToolkit, source?: Keypair) {
  const account: Account = await toolkit.rpc.getAccount(source?.publicKey() ?? toolkit.admin.publicKey());

  return new TransactionBuilder(account, {
    fee: BASE_FEE,
    timebounds: { minTime: 0, maxTime: 0 },
    networkPassphrase: toolkit.passphrase,
  });
}

export async function sendTransaction(
  toolkit: SorobanToolkit,
  transaction: Transaction,
  simulate: boolean,
  source?: Keypair
) {
  const simulationResponse = await toolkit.rpc.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(simulationResponse)) {
    toolkit.logVerbose("full", "simulationResponse:", simulationResponse);
    throw Error(`Simulation error`);
  } else if (simulate) {
    return simulationResponse;
  }
  
  const assembledTransaction = rpc.assembleTransaction(transaction, simulationResponse);
  const prepped_tx = assembledTransaction.build();
  prepped_tx.sign(source ?? toolkit.admin);
  
  const tx_hash = prepped_tx.hash().toString("hex");
  toolkit.logVerbose("some", `Transaction Hash: ${tx_hash}`);

  toolkit.logVerbose("full", 'SIGNED TX:', prepped_tx.toXDR());

  toolkit.logVerbose("full", "submitting tx...");
  const response = await toolkit.rpc.sendTransaction(prepped_tx);
  const status = response.status;
  
  let txResponse;
  while (status === "PENDING") {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toolkit.logVerbose("some", "waiting for tx...");
    txResponse = await toolkit.rpc.getTransaction(tx_hash);

    if (txResponse.status === "SUCCESS") {
      toolkit.logVerbose("some", "Transaction successful");
      break;
    }
  }
  return txResponse;
}