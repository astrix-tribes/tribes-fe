/**
 * TypeScript type definitions for Tribes smart contracts
 * These are placeholder interfaces to be used with TribesHelper
 */

export interface RoleManager {
  hasRole: (role: string, account: string) => Promise<boolean>;
}

export interface ProfileNFTMinter {
  createProfile: (username: string, metadata: string) => Promise<any>;
  isUsernameAvailable: (username: string) => Promise<boolean>;
  updateProfileMetadata: (profileId: number, metadata: string) => Promise<any>;
  getProfile: (profileId: number) => Promise<{
    owner: string;
    username: string;
    metadata: string;
  }>;
  getProfileIdByUsername: (username: string) => Promise<bigint>;
}

export interface TribeController {
  createTribe: (
    name: string,
    metadata: string,
    admins: string[],
    joinType: number,
    entryFee: bigint,
    nftRequirements: any[]
  ) => Promise<any>;
  updateTribeConfig: (
    tribeId: number,
    joinType: number,
    entryFee: bigint,
    nftRequirements: any[]
  ) => Promise<any>;
  updateTribe: (
    tribeId: number,
    newMetadata: string,
    updatedWhitelist: string[]
  ) => Promise<any>;
  joinTribe: (tribeId: number) => Promise<any>;
  requestToJoinTribe: (tribeId: number, options: { value: bigint }) => Promise<any>;
  joinTribeWithCode: (tribeId: number, codeHash: string) => Promise<any>;
  approveMember: (tribeId: number, memberAddress: string) => Promise<any>;
  rejectMember: (tribeId: number, memberAddress: string) => Promise<any>;
  banMember: (tribeId: number, memberAddress: string) => Promise<any>;
  createInviteCode: (
    tribeId: number,
    code: string,
    maxUses: number,
    expiryTime: number
  ) => Promise<any>;
  getMemberStatus: (tribeId: number, memberAddress: string) => Promise<bigint>;
  getTribeConfigView: (tribeId: number) => Promise<any>;
  getUserTribes: (userAddress: string) => Promise<bigint[]>;
}

export interface PostMinter {
  createPost: (
    tribeId: number,
    metadata: string,
    isGated: boolean,
    collectibleContract: string,
    collectibleId: number
  ) => Promise<any>;
  createEncryptedPost: (
    tribeId: number,
    metadata: string,
    encryptionKeyHash: string,
    accessSigner: string
  ) => Promise<any>;
  createSignatureGatedPost: (
    tribeId: number,
    metadata: string,
    encryptionKeyHash: string,
    accessSigner: string,
    collectibleContract: string,
    collectibleId: number
  ) => Promise<any>;
  createReply: (
    parentPostId: number,
    metadata: string,
    isGated: boolean,
    collectibleContract: string,
    collectibleId: number
  ) => Promise<any>;
  deletePost: (postId: number) => Promise<any>;
  interactWithPost: (postId: number, interactionType: number) => Promise<any>;
  getPost: (postId: number) => Promise<any[]>;
  canViewPost: (postId: number, viewer: string) => Promise<boolean>;
  getPostsByTribe: (
    tribeId: number,
    offset: number,
    limit: number
  ) => Promise<[bigint[], bigint]>;
  getPostsByUser: (
    userAddress: string,
    offset: number,
    limit: number
  ) => Promise<[bigint[], bigint]>;
  getInteractionCount: (postId: number, interactionType: number) => Promise<bigint>;
}

export interface PointSystem {
  createTribeToken: (tribeId: number, name: string, symbol: string) => Promise<any>;
  setActionPoints: (tribeId: number, actionType: string, points: number) => Promise<any>;
  awardPoints: (
    tribeId: number,
    member: string,
    points: number,
    actionType: string
  ) => Promise<any>;
  recordAction: (tribeId: number, member: string, actionType: string) => Promise<any>;
  getMemberPoints: (tribeId: number, member: string) => Promise<bigint>;
}

export interface CollectibleController {
  createCollectible: (
    tribeId: number,
    name: string,
    symbol: string,
    metadataURI: string,
    maxSupply: number,
    price: bigint,
    pointsRequired: number
  ) => Promise<any>;
  claimCollectible: (
    tribeId: number,
    collectibleId: number,
    options: { value: bigint }
  ) => Promise<any>;
  getCollectible: (collectibleId: number) => Promise<{
    name: string;
    symbol: string;
    metadataURI: string;
    maxSupply: bigint;
    currentSupply: bigint;
    price: bigint;
    pointsRequired: bigint;
    isActive: boolean;
  }>;
}

export interface ProjectController {
  validateAndCreateProject: (postId: number) => Promise<any>;
  validateAndCreateUpdate: (postId: number) => Promise<any>;
} 