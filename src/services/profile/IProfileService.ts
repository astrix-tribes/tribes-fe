/**
 * Interface for Profile-related services
 */
import { WalletClient } from 'viem';
import { ProfileData, ProfileMetadata } from '../../types/user';

export interface IProfileService {
  /**
   * Connect to a wallet
   * @param walletClient Wallet client
   * @param address Wallet address
   */
  connect(walletClient: WalletClient, address: string): Promise<void>;

  /**
   * Check if wallet is connected
   * @returns Whether the wallet is connected
   */
  isWalletConnected(): boolean;

  /**
   * Get profile by ID
   * @param profileId Profile ID
   * @returns Profile data
   */
  getProfileById(profileId: number): Promise<ProfileData>;

  /**
   * Get profile by username
   * @param username Username
   * @returns Profile data
   */
  getProfileByUsername(username: string): Promise<ProfileData>;

  /**
   * Get profile by address
   * @param address Wallet address
   * @returns Profile data or null if no profile exists
   */
  getProfileByAddress(address: string): Promise<ProfileData | null>;

  /**
   * Create a new profile
   * @param username Username
   * @param metadata Profile metadata
   * @returns Created profile ID
   */
  createProfile(username: string, metadata: ProfileMetadata): Promise<number>;

  /**
   * Update profile metadata
   * @param profileId Profile ID
   * @param metadata New profile metadata
   */
  updateProfileMetadata(profileId: number, metadata: ProfileMetadata): Promise<void>;

  /**
   * Check if a username is available
   * @param username Username to check
   * @returns Whether the username is available
   */
  checkUsernameAvailability(username: string): Promise<boolean>;

  /**
   * Check profile ownership
   * @param address Wallet address
   * @returns Profile data or null if no profile exists
   */
  checkProfileOwnership(address: string): Promise<ProfileData | null>;

  /**
   * Find username by address
   * @param address Wallet address
   * @returns Username or null if no username exists
   */
  findUsernameByAddress(address: string): Promise<string | null>;

  /**
   * Skip profile creation
   * @param address Wallet address
   * @returns Whether the profile creation was skipped
   */
  skipProfileCreation(address: string): Promise<boolean>;

  /**
   * Check if a profile creation was skipped
   * @param address Wallet address
   * @returns Whether the profile creation was skipped
   */
  hasSkippedProfileCreation(address: string): Promise<boolean>;
} 