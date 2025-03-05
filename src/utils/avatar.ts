/**
 * Generates an avatar URL from an Ethereum address using DiceBear API
 * @param address The Ethereum address to generate an avatar for
 * @returns A URL to the generated avatar
 */
export function generateAvatarFromAddress(address: string | undefined | null): string {
  // Handle undefined or null address
  if (!address) {
    console.warn('No address provided for avatar generation, using default');
    return `https://api.dicebear.com/7.x/identicon/svg?seed=default&backgroundColor=transparent`;
  }

  // Remove '0x' prefix if present and take first 8 characters as seed
  const seed = address.startsWith('0x') ? address.substring(2, 10) : address.substring(0, 8);
  
  // Use DiceBear API to generate a consistent avatar
  return `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=transparent`;
} 