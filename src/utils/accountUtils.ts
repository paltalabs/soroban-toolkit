import { Address, Contract, Keypair, scValToNative } from "@stellar/stellar-sdk";
import { SorobanToolkit } from "../config/toolkit";
import { createTransaction } from "../managers/transaction";

/**
 * Airdrops funds to a user using the Friendbot for supported networks.
 * @param toolkit - The SorobanToolkit instance with network configuration.
 * @param user - The Keypair of the user to fund.
 */
export async function airdropAccount(toolkit: SorobanToolkit, user: Keypair): Promise<void> {
  try {
    toolkit.logVerbose("full", `Start funding account: ${user.publicKey()}`);
    await toolkit.rpc.requestAirdrop(user.publicKey(), toolkit.friendbotUrl);
    
    toolkit.logVerbose("some", `Funded account: ${user.publicKey()}`);
  } catch (e) {
    //@ts-ignore
    if(e.status == 502) console.warn("Couldnt fund account, Friendbot is unavailable.");
    toolkit.logVerbose("some", `Account ${user.publicKey()} is already funded`);
  }
}

export async function getTokenBalance(
  toolkit: SorobanToolkit,
  contractId: string,
  from: string,
  source?: Keypair
) {
  const tokenContract = new Contract(contractId);
  const op = tokenContract.call("balance", new Address(from).toScVal());

  const result = await createTransaction(toolkit, op, true, source);
  const parsedResult = scValToNative(result.result.retval).toString();

  if (!parsedResult) {
    throw new Error("The operation has no result.");
  }
  if (parsedResult == 0) {
    return parsedResult;
  }
  const resultNumber = Number(parsedResult);
  return resultNumber;
}
