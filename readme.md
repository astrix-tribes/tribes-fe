# Tribes: Decentralized Social Platform

<!-- ![Tribes Platform Banner](path/to/logo.png) -->

## Overview

Welcome to Tribes! This decentralized social platform enables users to create communities (tribes), share content, and interact in a Web3 environment. Built on blockchain technology, Tribes ensures data persistence, user ownership, and transparent community governance.

## Features

- **Blockchain-Based Social Interactions**: Create posts, comments, and reactions that are stored on-chain for permanence and ownership.
- **Tribe Communities**: Create or join interest-based communities with their own governance and content rules.
- **Rich Content Types**: Share text posts, images, videos, events, polls, and links with full ownership of your content.
- **Web3 Identity**: Connect with your crypto wallet for a seamless, self-sovereign identity experience.
- **Cross-Chain Compatibility**: Works across multiple blockchain networks including Monad, Fuse, and other EVM-compatible chains.

## Why We Built This

Traditional social media platforms control user data, monetize attention without fair compensation, and can censor content arbitrarily. Tribes returns ownership to users, ensures content permanence through blockchain technology, and creates a more equitable ecosystem where communities can self-govern.

## How It Works

Tribes uses a combination of smart contracts and a modern React frontend to deliver a seamless social experience:

### Technical Architecture

#### Smart Contracts
- **PostMinter**: Handles the creation and management of posts on the blockchain.
- **PostFeedManager**: Manages feeds and content discovery.
- **TribeController**: Manages tribe creation and membership.
- **ProfileNFTMinter**: Handles user profile creation as NFTs.

#### Frontend Architecture
- **Components**: Reusable UI elements like PostCreator, FeedCard, and ProfileSearch.
- **Screens**: Main application views like Dashboard, Profile, and TribeDetails.
- **Services**: Backend communication and data processing.
- **Hooks**: Custom React hooks for blockchain interactions and data fetching.
- **Utils**: Helper functions for blockchain operations and data transformation.

#### State Management
Redux is used for global state management with dedicated slices:
- **postsSlice**: Manages post creation, fetching, and caching.
- **chainSlice**: Handles blockchain connection and network state.

#### Blockchain Integration
The application connects to blockchain networks through:
- **blockchainUtils.ts**: Core utilities for blockchain operations.
- **ethers.js**: Library for Ethereum blockchain interactions.
- **Contract ABIs**: JSON interfaces for smart contract communication.

## Getting Started

Getting started with Tribes is easy:

1. Clone the repository: `git clone https://github.com/your-repo/tribes.git`
2. Install dependencies: `npm install`
3. Configure environment variables: `cp .env.example .env`
4. Start the development server: `npm run dev`
5. Connect your Web3 wallet (MetaMask, WalletConnect, etc.)
6. Create a profile or mint an NFT profile
7. Join existing tribes or create your own
8. Start posting and interacting with the community

## Post Creation Flow

Creating a post in Tribes follows this process:
1. User opens the PostCreator component.
2. User selects a post type (text, image, video, event, poll, link).
3. User fills in content and metadata.
4. On submission, the Redux action `createPost` is dispatched.
5. The action calls `createTribePost` in `blockchainUtils.ts`.
6. A blockchain transaction is created and sent to the PostMinter contract.
7. Once confirmed, the post appears in the feed.

<!-- ## Community & Support

We welcome contributions and feedback from our community! Here's how you can get involved:

- Join our Discord community
- Report issues or suggest features on GitHub
- Follow us on Twitter for updates -->

## The Team

Tribes is built and maintained by a team of blockchain and web developers passionate about decentralized social interactions and Web3 technology. We believe in building tools that empower users and communities.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
