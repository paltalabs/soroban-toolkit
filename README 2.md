it can be bused using a single network like this or with multiple network with this other approach 

Single network
```
import { StellarToolkit, testnet } from "stellar-soroban-utils";

const toolkit = new StellarToolkit({
  adminSecret: "SXXXXXXXXXXXXXXXX",
  network: testnet,
  contractPaths: {
    defindex_vault: "/path/to/defindex_vault.wasm",
  },
});

// Example usage
console.log(toolkit.getContractPath("defindex_vault"));
```

Multiple Networks
```
import { initializeToolkit, testnet, futurenet } from "stellar-soroban-utils";

const toolkitLoader = initializeToolkit("SXXXXXXXXXXXXXXXX", {
  defindex_vault: "/path/to/defindex_vault.wasm",
}, [
  {
    network: "customnet",
    friendbotUrl: "https://friendbot-customnet.example.com/",
    horizonRpcUrl: "https://horizon-customnet.example.com",
    sorobanRpcUrl: "https://soroban-customnet.example.com/",
    networkPassphrase: "Custom Network Passphrase",
  },
]);

// List available networks
console.log(toolkitLoader.listAvailableNetworks());

// Load specific network
const toolkit = toolkitLoader.getNetworkToolkit("customnet");
console.log(toolkit.getContractPath("defindex_vault"));
```