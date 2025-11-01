export const streamKey = process.env.NEXT_PUBLIC_LIVEPEER_API_KEY || process.env.NEXT_PUBLIC_LIVEPEER_STREAM_KEY || process.env.LIVEPEER_API_KEY || "";

// ============ RealmOS Tokens ============
export const REALM_TOKEN = "0.0.7171833";

// NFT Collections
export const PROFILE_NFT = "0.0.7171835";
export const GAME_NFT = "0.0.7171837";
export const ACHIEVEMENT_NFT = "0.0.7171838";

// HCS Topics
export const LEADERBOARD_TOPIC = "0.0.7171840";
export const GAME_EVENTS_TOPIC = "0.0.7171843";
export const TOURNAMENT_TOPIC = "0.0.7171847";

// Smart Contracts (HSCS) 
export const NFT_MARKETPLACE = "0.0.7171576";
export const PRIZE_ESCROW = "0.0.7171580";
export const GUILD_TREASURY = "0.0.7171583";

// Network Configuration
export const HEDERA_NETWORK = "testnet";

// Media CIDs (IPFS)
export const MINIGAME_IMAGE_IPFS_CID = "bafybeiaqix2r6tvqq2zvsxtjam2a7yhv2lxqyrpch6bib234gsgrn46gue";
export const MINIGAME_IMAGE_IPFS_URL = `ipfs://${MINIGAME_IMAGE_IPFS_CID}`;
