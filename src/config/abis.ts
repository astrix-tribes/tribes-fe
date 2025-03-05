import ProfileNFTMinterABI from '../abi/ProfileNFTMinter.json';
import TribeControllerABI from '../abi/TribeController.json';
import CollectibleControllerABI from '../abi/CollectibleController.json';
import EventControllerABI from '../abi/EventController.json';
import CommunityPointsABI from '../abi/CommunityPoints.json';
import VotingABI from '../abi/Voting.json';
import RoleManagerABI from '../abi/RoleManager.json';
import SuperCommunityControllerABI from '../abi/SuperCommunityController.json';
import ContentManagerABI from '../abi/ContentManager.json';
import PostMinterABI from '../abi/PostMinter.json';

// Export all ABIs with proper typing
export const ABIS = {
  ProfileNFTMinter: ProfileNFTMinterABI,
  TribeController: TribeControllerABI,
  CollectibleController: CollectibleControllerABI,
  EventController: EventControllerABI,
  CommunityPoints: CommunityPointsABI,
  Voting: VotingABI,
  RoleManager: RoleManagerABI,
  SuperCommunityController: SuperCommunityControllerABI,
  ContentManager: ContentManagerABI,
  PostMinter: PostMinterABI
} as const; 