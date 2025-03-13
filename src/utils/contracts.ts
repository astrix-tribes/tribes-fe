export interface ContractAddresses {
  tribes: string;
}

// Define chain constants for clarity
const CHAIN_IDS = {
  ETHEREUM_MAINNET: 1,
  GOERLI: 5,
  MONAD_TESTNET: 20143,
  FUSE_EMBER: 1264453517
};

// Define fallback addresses to use when a specific chain isn't supported
const FALLBACK_ADDRESSES: ContractAddresses = {
  tribes: '0x54812005171F747f5E69afA08989F41Cf06eeE48' // Using Fuse tribes address as default
};

export function getContractAddresses(chainId: number): ContractAddresses {
  console.log(`Getting contract addresses for chain ID: ${chainId}`);
  
  switch (chainId) {
    case CHAIN_IDS.ETHEREUM_MAINNET: // Ethereum Mainnet
      return {
        tribes: '0x1234567890123456789012345678901234567890' // Replace with actual mainnet address
      };
    case CHAIN_IDS.GOERLI: // Goerli
      return {
        tribes: '0x1234567890123456789012345678901234567890' // Replace with actual testnet address
      };
    case CHAIN_IDS.MONAD_TESTNET: // Monad Devnet
      return {
        tribes: '0x16C4F870B59E55bB80A620547987Bd9302FC567d'
      };
    case CHAIN_IDS.FUSE_EMBER: // Fuse Ember Testnet
      return {
        tribes: '0x54812005171F747f5E69afA08989F41Cf06eeE48'
      };
    default:
      console.warn(`Using fallback addresses for unsupported chain ID: ${chainId}`);
      return FALLBACK_ADDRESSES;
  }
} 