# BearBrick NFT Utils Integration Example

This example demonstrates how to integrate `@lab/nft-utils` with the BearBrick NFT contract for generating and minting unique NFTs.

## Frontend Integration

```typescript
import { createBearBrickTokenUri } from '@lab/nft-utils';
import { ethers } from 'ethers';

// Example: Mint a BearBrick NFT for a user
async function mintBearBrickForUser(
  contract: ethers.Contract,
  userAddress: string,
  fid: number,
  username: string,
  colors: { primary: string; secondary: string }
) {
  // Generate the token URI with SVG and metadata
  const config = {
    colors,
    fid,
    username,
    size: 512,
    showUsername: true,
  };

  const { metadata, tokenUri } = createBearBrickTokenUri(config);

  // Get the current mint price from the contract
  const mintPrice = await contract.mintPrice();
  
  // Mint the NFT with the generated token URI
  const tx = await contract.mintBearBrick(
    userAddress,
    fid,
    tokenUri,
    { value: mintPrice }
  );

  await tx.wait();
  
  return {
    transactionHash: tx.hash,
    metadata,
    tokenUri,
  };
}

// Usage example
const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  signer
);

const result = await mintBearBrickForUser(
  contract,
  '0x1234...5678',
  12345,
  'alice',
  {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
  }
);

console.log(`NFT minted! TX: ${result.transactionHash}`);
console.log(`Metadata: ${JSON.stringify(result.metadata, null, 2)}`);
```

## Color Scheme Generation

```typescript
// Generate different color schemes based on user preferences
function getUserColorScheme(userProfile: any): { primary: string; secondary: string } {
  const schemes = [
    { primary: '#FF6B6B', secondary: '#4ECDC4' }, // Coral & Turquoise
    { primary: '#6C5CE7', secondary: '#A29BFE' }, // Purple & Lavender
    { primary: '#00B894', secondary: '#55EFC4' }, // Emerald & Mint
    { primary: '#FDCB6E', secondary: '#E17055' }, // Yellow & Coral
    { primary: '#FD79A8', secondary: '#FDCB6E' }, // Pink & Yellow
    { primary: '#636E72', secondary: '#B2BEC3' }, // Dark & Light Gray
  ];

  // Use user's FID to deterministically select a color scheme
  const schemeIndex = userProfile.fid % schemes.length;
  return schemes[schemeIndex];
}
```

## Batch Minting for Collections

```typescript
// Mint multiple BearBricks for a collection
async function mintCollection(
  contract: ethers.Contract,
  collectionData: Array<{
    fid: number;
    username: string;
    colors?: { primary: string; secondary: string };
  }>
) {
  const results = [];

  for (const item of collectionData) {
    const colors = item.colors || getUserColorScheme({ fid: item.fid });
    
    const { tokenUri } = createBearBrickTokenUri({
      colors,
      fid: item.fid,
      username: item.username,
    });

    const mintPrice = await contract.mintPrice();
    const tx = await contract.mintBearBrick(
      await signer.getAddress(),
      item.fid,
      tokenUri,
      { value: mintPrice }
    );

    const receipt = await tx.wait();
    results.push({
      fid: item.fid,
      username: item.username,
      transactionHash: tx.hash,
      tokenId: receipt.events?.[0]?.args?.tokenId,
    });
  }

  return results;
}
```

## Gas Optimization Tips

```typescript
// Pre-generate metadata off-chain to save gas during minting
function preGenerateMetadata(userConfigs: Array<{
  fid: number;
  username: string;
  colors: { primary: string; secondary: string };
}>) {
  return userConfigs.map(config => {
    const { metadata, tokenUri } = createBearBrickTokenUri(config);
    return {
      fid: config.fid,
      tokenUri,
      metadata,
    };
  });
}

// Store pre-generated data and only mint when needed
const preGenerated = preGenerateMetadata(userList);

// Later, when minting:
async function mintWithPreGenerated(
  contract: ethers.Contract,
  fid: number
) {
  const preGenData = preGenerated.find(p => p.fid === fid);
  if (!preGenData) throw new Error('User data not pre-generated');

  const mintPrice = await contract.mintPrice();
  const tx = await contract.mintBearBrick(
    await signer.getAddress(),
    fid,
    preGenData.tokenUri,
    { value: mintPrice }
  );

  return tx.wait();
}
```

## Metadata Verification

```typescript
// Verify that generated metadata meets your standards
function validateMetadata(metadata: any): boolean {
  const requiredFields = ['name', 'description', 'image', 'attributes'];
  
  // Check all required fields exist
  for (const field of requiredFields) {
    if (!metadata[field]) return false;
  }

  // Check attributes structure
  if (!Array.isArray(metadata.attributes)) return false;
  
  const requiredAttributes = ['FID', 'Primary Color', 'Secondary Color'];
  for (const attr of requiredAttributes) {
    if (!metadata.attributes.some((a: any) => a.trait_type === attr)) {
      return false;
    }
  }

  // Check image is a valid data URI
  if (!metadata.image.startsWith('data:image/svg+xml;base64,')) {
    return false;
  }

  return true;
}

// Usage
const { metadata } = createBearBrickTokenUri(config);
console.log('Metadata valid:', validateMetadata(metadata));
```

## Integration with Farcaster Auth

```typescript
import { useFarcasterUser } from '@lab/farcaster-auth';
import { createBearBrickTokenUri } from '@lab/nft-utils';

function MintBearBrickComponent() {
  const { user, loading, error } = useFarcasterUser();

  const handleMint = async () => {
    if (!user) return;

    const config = {
      colors: getUserColorScheme(user),
      fid: user.fid,
      username: user.username,
    };

    const { tokenUri } = createBearBrickTokenUri(config);
    
    // Mint with contract...
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>Please connect your Farcaster account</div>;

  return (
    <button onClick={handleMint}>
      Mint BearBrick for @{user.username}
    </button>
  );
}
```

This integration example shows how `@lab/nft-utils` seamlessly works with the BearBrick contract ecosystem, providing deterministic NFT generation with proper metadata and gas-optimized on-chain storage.