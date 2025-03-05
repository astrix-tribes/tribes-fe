export const TribesABI = [
  // Post functions
  {
    inputs: [{ name: "postId", type: "uint256" }],
    name: "getPost",
    outputs: [
      { name: "id", type: "uint256" },
      { name: "creator", type: "address" },
      { name: "tribeId", type: "uint256" },
      { name: "type", type: "string" },
      { name: "content", type: "string" },
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "tags", type: "string[]" },
      { name: "images", type: "string[]" },
      { name: "videos", type: "string[]" },
      { name: "timestamp", type: "uint256" },
      { name: "likes", type: "uint256" },
      { name: "comments", type: "uint256" },
      { name: "shares", type: "uint256" },
      { name: "views", type: "uint256" },
      { name: "engagement", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "tribeId", type: "uint256" }],
    name: "getPostsByTribe",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "tribeId", type: "uint256" },
          { name: "type", type: "string" },
          { name: "content", type: "string" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "tags", type: "string[]" },
          { name: "images", type: "string[]" },
          { name: "videos", type: "string[]" },
          { name: "timestamp", type: "uint256" },
          { name: "likes", type: "uint256" },
          { name: "comments", type: "uint256" },
          { name: "shares", type: "uint256" },
          { name: "views", type: "uint256" },
          { name: "engagement", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [{ name: "userId", type: "address" }],
    name: "getUserPosts",
    outputs: [
      {
        components: [
          { name: "id", type: "uint256" },
          { name: "creator", type: "address" },
          { name: "tribeId", type: "uint256" },
          { name: "type", type: "string" },
          { name: "content", type: "string" },
          { name: "title", type: "string" },
          { name: "description", type: "string" },
          { name: "tags", type: "string[]" },
          { name: "images", type: "string[]" },
          { name: "videos", type: "string[]" },
          { name: "timestamp", type: "uint256" },
          { name: "likes", type: "uint256" },
          { name: "comments", type: "uint256" },
          { name: "shares", type: "uint256" },
          { name: "views", type: "uint256" },
          { name: "engagement", type: "uint256" }
        ],
        name: "",
        type: "tuple[]"
      }
    ],
    stateMutability: "view",
    type: "function"
  },
  {
    inputs: [
      { name: "tribeId", type: "uint256" },
      { name: "metadata", type: "string" }
    ],
    name: "createPost",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "postId", type: "uint256" },
      { name: "metadata", type: "string" }
    ],
    name: "updatePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "postId", type: "uint256" }],
    name: "deletePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "postId", type: "uint256" }],
    name: "likePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { name: "postId", type: "uint256" },
      { name: "content", type: "string" }
    ],
    name: "commentPost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [{ name: "postId", type: "uint256" }],
    name: "sharePost",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [],
    name: "getLastPostId",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function"
  }
]; 