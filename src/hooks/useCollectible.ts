// import { useCallback } from 'react';
// import { getCurrentChainInfo } from '../config/contracts';
// import { Collectible } from '../types/contracts';

// export const useCollectible = () => {
//   const { contracts, getWalletClient, publicClient } = getCurrentChainInfo();
//   const createCollectible = useCallback(async (
//     tribeId: bigint,
//     name: string,
//     symbol: string,
//     metadataURI: string,
//     maxSupply: bigint,
//     price: bigint,
//     pointsRequired: bigint
//   ) => {
//     const walletClient = await getWalletClient();
//     const [account] = await walletClient.getAddresses();

//     const hash = await walletClient.writeContract({
//       address: contracts.collectibleController.address,
//       abi: contracts.collectibleController.abi,
//       functionName: 'createCollectible',
//       args: [tribeId, name, symbol, metadataURI, maxSupply, price, pointsRequired],
//       account
//     });

//     await publicClient.waitForTransactionReceipt({ hash });
//     return hash;
//   }, []);

//   const claimCollectible = useCallback(async (
//     tribeId: bigint,
//     collectibleId: bigint,
//     price: bigint
//   ) => {
//     const walletClient = await getWalletClient();
//     const [account] = await walletClient.getAddresses();

//     const hash = await walletClient.writeContract({
//       address: contracts.collectibleController.address,
//       abi: contracts.collectibleController.abi,
//       functionName: 'claimCollectible',
//       args: [tribeId, collectibleId],
//       account,
//       value: price
//     });

//     await publicClient.waitForTransactionReceipt({ hash });
//     return hash;
//   }, []);

//   const getCollectible = useCallback(async (collectibleId: bigint): Promise<Collectible> => {
//     const result = await publicClient.readContract({
//       address: contracts.collectibleController.address,
//       abi: contracts.collectibleController.abi,
//       functionName: 'getCollectible',
//       args: [collectibleId]
//     }) as [string, string, string, bigint, bigint, bigint, bigint, boolean];

//     const [name, symbol, metadataUri, maxSupply, currentSupply, price, pointsRequired, isActive] = result;

//     return {
//       id: collectibleId,
//       tribeId: 0n, // This needs to be fetched separately
//       name,
//       symbol,
//       metadataUri,
//       maxSupply,
//       currentSupply,
//       price,
//       pointsRequired,
//       isActive
//     };
//   }, []);

//   return {
//     createCollectible,
//     claimCollectible,
//     getCollectible
//   };
// }; 