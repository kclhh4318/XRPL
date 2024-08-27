import axios from 'axios';

interface NFT {
  id: string;
  name: string;
  image: string;
  collectionAddress: string;
}

interface Collection {
  address: string;
  floorPrice: number;
}

// Fetch top 100 collections (mock function, replace with actual API call)
async function fetchTop100Collections(): Promise<Collection[]> {
  // This should be replaced with an actual API call
  const response = await axios.get('https://api.example.com/top100collections');
  return response.data;
}

// Determine NFT tier and chips based on collection ranking
function determineNFTTierAndChips(collectionRank: number): { tier: number; chips: number } {
  if (collectionRank <= 10) return { tier: 1, chips: 80 };
  if (collectionRank <= 30) return { tier: 2, chips: 50 };
  if (collectionRank <= 50) return { tier: 3, chips: 30 };
  if (collectionRank <= 100) return { tier: 4, chips: 20 };
  return { tier: 5, chips: 10 };
}

// Apply weighting to user's NFTs
async function applyNFTWeighting(userNFTs: NFT[]): Promise<(NFT & { tier: number; chips: number })[]> {
  const top100Collections = await fetchTop100Collections();
  
  return userNFTs.map(nft => {
    const collectionRank = top100Collections.findIndex(c => c.address === nft.collectionAddress) + 1;
    const { tier, chips } = determineNFTTierAndChips(collectionRank);
    return { ...nft, tier, chips };
  });
}

// Example usage in NFTSelector component
async function fetchAndWeightUserNFTs(): Promise<(NFT & { tier: number; chips: number })[]> {
  // This should be replaced with actual user NFT fetching logic
  const userNFTs: NFT[] = [
    { id: '1', name: 'NFT #1', image: 'https://example.com/nft1.jpg', collectionAddress: '0x123...' },
    { id: '2', name: 'NFT #2', image: 'https://example.com/nft2.jpg', collectionAddress: '0x456...' },
    { id: '3', name: 'NFT #3', image: 'https://example.com/nft3.jpg', collectionAddress: '0x789...' },
  ];

  return applyNFTWeighting(userNFTs);
}

export { fetchAndWeightUserNFTs };