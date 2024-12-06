import {
  Address,
  Contract,
  Keypair,
  Operation,
  StrKey,
  hash,
  xdr,
} from '@stellar/stellar-sdk';
import { SorobanToolkit } from '../config/toolkit';
import { resolvePath } from '../utils/utils';
import {
  createTransaction,
  createTransactionBuilder,
  sendTransaction,
} from './transaction';
import { randomBytes } from 'crypto';

export async function installContract(
  toolkit: SorobanToolkit,
  wasmKey: string,
  customBuffer?: Buffer,
  source?: Keypair
) {
  let contractWasm, wasmHash;

  if (!customBuffer) {
    const wasmPath = toolkit.getContractPath(wasmKey);
    contractWasm = resolvePath(wasmPath);
    wasmHash = hash(contractWasm);
  } else {
    wasmHash = hash(customBuffer);
    contractWasm = customBuffer;
  }

  toolkit.logVerbose('full', `Installing contract: ${wasmKey}`);
  toolkit.logVerbose('full', `WASM hash: ${wasmHash.toString('hex')}`);

  toolkit.addressBook.setWasmHash(wasmKey, wasmHash.toString('hex'));
  toolkit.addressBook.writeToFile();

  const op = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeUploadContractWasm(contractWasm),
    auth: [],
  });

  await createTransaction(toolkit, op, false, source);
}

export async function deployContract(
  toolkit: SorobanToolkit,
  wasmKey: string,
  contractKey: string,
  args: xdr.ScVal[],
  source?: Keypair
) {
  const contractIdSalt = randomBytes(32);
  const networkId = hash(Buffer.from(toolkit.passphrase));

  const contractIdPreimage = xdr.ContractIdPreimage.contractIdPreimageFromAddress(
    new xdr.ContractIdPreimageFromAddress({
      address: Address.fromString(
        source?.publicKey() ?? toolkit.admin.publicKey()
      ).toScAddress(),
      salt: contractIdSalt,
    })
  );

  const hashIdPreimage = xdr.HashIdPreimage.envelopeTypeContractId(
    new xdr.HashIdPreimageContractId({
      networkId,
      contractIdPreimage,
    })
  );

  const contractId = StrKey.encodeContract(hash(hashIdPreimage.toXDR()));
  toolkit.addressBook.setContractId(contractKey, contractId);
  toolkit.addressBook.writeToFile();

  const wasmHash = Buffer.from(toolkit.addressBook.getWasmHash(wasmKey), 'hex');

  toolkit.logVerbose('some', `Deploying contract: ${contractKey}`);
  const deployOp = Operation.invokeHostFunction({
    func: xdr.HostFunction.hostFunctionTypeCreateContractV2(
      new xdr.CreateContractArgsV2({
        contractIdPreimage,
        executable: xdr.ContractExecutable.contractExecutableWasm(wasmHash),
        constructorArgs: args,
      })
    ),
    auth: [],
  });

  await createTransaction(toolkit, deployOp, false, source);

  return contractId;
}

export async function invokeContract(
  toolkit: SorobanToolkit,
  contractKey: string,
  method: string,
  params: xdr.ScVal[],
  simulate: boolean = false,
  source?: Keypair
) {
  const contractId = toolkit.addressBook.getContractId(contractKey);
  const contract = new Contract(contractId);

  const operation = contract.call(method, ...params);

  toolkit.logVerbose('some', `Invoking contract ${contractKey}: ${method}`);
  return await createTransaction(toolkit, operation, simulate, source);
}

export async function invokeCustomContract(
  toolkit: SorobanToolkit,
  contractId: string,
  method: string,
  params: xdr.ScVal[],
  simulate: boolean = false,
  source?: Keypair
) {
  const contract = new Contract(contractId);

  const operation = contract.call(method, ...params);

  toolkit.logVerbose('some', `Invoking contract ${contractId}: ${method}`);
  return await createTransaction(toolkit, operation, simulate, source);
}

export async function bumpContractInstance(
  toolkit: SorobanToolkit,
  contractId: string,
  source?: Keypair
) {
  const address = Address.fromString(contractId);
  toolkit.logVerbose('some', `Bumping contract instance: ${contractId}`);
  const contractInstanceXDR = xdr.LedgerKey.contractData(
    new xdr.LedgerKeyContractData({
      contract: address.toScAddress(),
      key: xdr.ScVal.scvLedgerKeyContractInstance(),
      durability: xdr.ContractDataDurability.persistent(),
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractInstanceXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });

  const txBuilder = await createTransactionBuilder(toolkit, source);
  txBuilder.addOperation(Operation.extendFootprintTtl({ extendTo: 535670 })); // 1 year
  txBuilder.setSorobanData(bumpTransactionData);
  const result = await sendTransaction(
    toolkit,
    txBuilder.build(),
    false,
    source
  );
  return result;
}

export async function bumpContractCode(
  toolkit: SorobanToolkit,
  wasmHash: string,
  source?: Keypair
) {
  const wasmHashBuffer = Buffer.from(wasmHash, 'hex');
  const contractCodeXDR = xdr.LedgerKey.contractCode(
    new xdr.LedgerKeyContractCode({
      hash: wasmHashBuffer,
    })
  );
  const bumpTransactionData = new xdr.SorobanTransactionData({
    resources: new xdr.SorobanResources({
      footprint: new xdr.LedgerFootprint({
        readOnly: [contractCodeXDR],
        readWrite: [],
      }),
      instructions: 0,
      readBytes: 0,
      writeBytes: 0,
    }),
    resourceFee: xdr.Int64.fromString('0'),
    // @ts-ignore
    ext: new xdr.ExtensionPoint(0),
  });

  const txBuilder = await createTransactionBuilder(toolkit, source);
  txBuilder.addOperation(Operation.extendFootprintTtl({ extendTo: 535670 })); // 1 year
  txBuilder.setSorobanData(bumpTransactionData);
  const result = await sendTransaction(
    toolkit,
    txBuilder.build(),
    false,
    source
  );
  return result;
}
