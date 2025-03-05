/**
 * Interface for Tribe-related services
 */
import { 
  Tribe, 
  TribeConfig, 
  TribeData, 
  MembershipData,
  NFTRequirement
} from '../../types/tribe';

export interface ITribeService {
  /**
   * Create a new tribe
   * @param name Tribe name
   * @param metadata Tribe metadata
   * @param admins List of admin addresses
   * @param joinType Join type (0: open, 1: approval required, 2: closed)
   * @param entryFee Entry fee in wei
   * @param nftRequirements NFT requirements for joining
   * @returns The created tribe ID
   */
  createTribe(
    name: string,
    metadata: string,
    admins?: string[],
    joinType?: number,
    entryFee?: bigint,
    nftRequirements?: NFTRequirement[]
  ): Promise<number>;

  /**
   * Get tribe data by ID
   * @param tribeId Tribe ID
   * @returns Tribe data
   */
  getTribeData(tribeId: number): Promise<TribeData>;

  /**
   * Get tribe configuration
   * @param tribeId Tribe ID
   * @returns Tribe configuration
   */
  getTribeConfig(tribeId: number): Promise<TribeConfig>;

  /**
   * Join a tribe
   * @param tribeId Tribe ID
   */
  joinTribe(tribeId: number): Promise<void>;

  /**
   * Request to join a tribe
   * @param tribeId Tribe ID
   * @param entryFee Entry fee to pay
   */
  requestToJoinTribe(tribeId: number, entryFee: bigint): Promise<void>;

  /**
   * Get the total number of tribes
   * @returns Total tribes count
   */
  getTribesCount(): Promise<number>;

  /**
   * Get user's membership status in a tribe
   * @param tribeId Tribe ID
   * @param memberAddress Member address
   * @returns Membership status
   */
  getMemberStatus(tribeId: number, memberAddress: string): Promise<number>;

  /**
   * Get all tribes a user is a member of
   * @param userAddress User address
   * @returns List of tribe IDs
   */
  getUserTribes(userAddress: string): Promise<number[]>;

  /**
   * Map tribe data to UI format
   * @param tribeData Tribe data from blockchain
   * @param chainId Current chain ID
   * @returns Formatted tribe data
   */
  mapTribeDataToUIFormat(tribeData: TribeData, chainId: number): Tribe;
} 