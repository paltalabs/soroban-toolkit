import { Networks } from "@stellar/stellar-sdk";
import { StellarNetworkConfig } from "./toolkit";

export const testnet: StellarNetworkConfig = {
  network: "testnet",
  friendbotUrl: "https://friendbot.stellar.org/",
  horizonRpcUrl: "https://horizon-testnet.stellar.org",
  sorobanRpcUrl: "https://soroban-testnet.stellar.org/",
  networkPassphrase: Networks.TESTNET,
};

export const futurenet: StellarNetworkConfig = {
  network: "futurenet",
  friendbotUrl: "https://friendbot-futurenet.stellar.org/",
  horizonRpcUrl: "https://horizon-futurenet.stellar.org",
  sorobanRpcUrl: "https://rpc-futurenet.stellar.org/",
  networkPassphrase: Networks.FUTURENET,
};