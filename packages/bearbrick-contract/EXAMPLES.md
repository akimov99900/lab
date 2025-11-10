# Usage Examples

This document provides examples of how to interact with the BearBrickNFT contract from a frontend application.

## Installation

In your Next.js or React project:

```bash
pnpm add @lab/labuba-contract ethers
```

## Setup

```typescript
import { ethers } from "ethers";
import { BearBrickNFT__factory } from "@lab/labuba-contract";
import type { BearBrickNFT } from "@lab/labuba-contract";

// Load deployment info
import deployment from "@lab/labuba-contract/deployments/base.json";

// Initialize provider (for reading)
const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

// Initialize contract instance
const contract = BearBrickNFT__factory.connect(
  deployment.contractAddress,
  provider
);
```

## Read Operations

### Check if FID has minted

```typescript
async function hasUserMinted(fid: number): Promise<boolean> {
  return await contract.hasMinted(fid);
}

// Usage
const fid = 123;
const minted = await hasUserMinted(fid);
console.log(`FID ${fid} has minted:`, minted);
```

### Get Token ID by FID

```typescript
async function getTokenIdForFid(fid: number): Promise<bigint> {
  try {
    return await contract.getTokenIdByFid(fid);
  } catch (error) {
    console.error("FID has not minted yet");
    throw error;
  }
}

// Usage
const tokenId = await getTokenIdForFid(123);
console.log("Token ID:", tokenId.toString());
```

### Get Token URI

```typescript
async function getTokenMetadata(tokenId: number): Promise<string> {
  return await contract.tokenURI(tokenId);
}

// Usage
const uri = await getTokenMetadata(123);
console.log("Token URI:", uri);
```

### Get Token Owner

```typescript
async function getTokenOwner(tokenId: number): Promise<string> {
  return await contract.ownerOf(tokenId);
}

// Usage
const owner = await getTokenOwner(123);
console.log("Token owner:", owner);
```

### Get Royalty Info

```typescript
async function getRoyaltyInfo(
  tokenId: number,
  salePrice: bigint
): Promise<{ receiver: string; royaltyAmount: bigint }> {
  const [receiver, royaltyAmount] = await contract.royaltyInfo(
    tokenId,
    salePrice
  );
  return { receiver, royaltyAmount };
}

// Usage
const salePrice = ethers.parseEther("1.0");
const royalty = await getRoyaltyInfo(123, salePrice);
console.log("Royalty receiver:", royalty.receiver);
console.log("Royalty amount:", ethers.formatEther(royalty.royaltyAmount), "ETH");
```

## Write Operations (Requires Signer)

### Mint NFT

```typescript
async function mintNFT(
  signer: ethers.Signer,
  fid: number,
  tokenURI: string
): Promise<{ tokenId: bigint; txHash: string }> {
  const contract = BearBrickNFT__factory.connect(
    deployment.contractAddress,
    signer
  );

  const mintPrice = await contract.MINT_PRICE();

  const tx = await contract.mint(fid, tokenURI, {
    value: mintPrice,
  });

  const receipt = await tx.wait();
  
  // Parse event to get tokenId
  const event = receipt?.logs
    .map((log) => {
      try {
        return contract.interface.parseLog({
          topics: [...log.topics],
          data: log.data,
        });
      } catch {
        return null;
      }
    })
    .find((e) => e?.name === "NFTMinted");

  const tokenId = event?.args?.tokenId;

  return {
    tokenId,
    txHash: receipt!.hash,
  };
}

// Usage with MetaMask or similar wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const result = await mintNFT(
  signer,
  123,
  "ipfs://QmYourTokenURI"
);

console.log("Minted token ID:", result.tokenId.toString());
console.log("Transaction hash:", result.txHash);
```

### Update Token URI

```typescript
async function updateTokenURI(
  signer: ethers.Signer,
  tokenId: number,
  newURI: string
): Promise<string> {
  const contract = BearBrickNFT__factory.connect(
    deployment.contractAddress,
    signer
  );

  const tx = await contract.setTokenURI(tokenId, newURI);
  const receipt = await tx.wait();

  return receipt!.hash;
}

// Usage
const txHash = await updateTokenURI(
  signer,
  123,
  "ipfs://QmNewTokenURI"
);
console.log("Updated! Transaction:", txHash);
```

### Transfer NFT

```typescript
async function transferNFT(
  signer: ethers.Signer,
  from: string,
  to: string,
  tokenId: number
): Promise<string> {
  const contract = BearBrickNFT__factory.connect(
    deployment.contractAddress,
    signer
  );

  const tx = await contract.transferFrom(from, to, tokenId);
  const receipt = await tx.wait();

  return receipt!.hash;
}

// Usage
const fromAddress = await signer.getAddress();
const toAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
const txHash = await transferNFT(signer, fromAddress, toAddress, 123);
console.log("Transferred! Transaction:", txHash);
```

## React Hooks Examples

### Custom Hook for Contract Instance

```typescript
import { useMemo } from "react";
import { ethers } from "ethers";
import { useProvider, useSigner } from "wagmi"; // or your Web3 library
import { BearBrickNFT__factory } from "@lab/labuba-contract";

export function useBearBrickNFT(needsSigner = false) {
  const provider = useProvider();
  const { data: signer } = useSigner();

  return useMemo(() => {
    const contractAddress = process.env.NEXT_PUBLIC_BEARBRICK_NFT_ADDRESS!;
    
    if (needsSigner && signer) {
      return BearBrickNFT__factory.connect(contractAddress, signer);
    }
    
    return BearBrickNFT__factory.connect(contractAddress, provider);
  }, [provider, signer, needsSigner]);
}
```

### Check Mint Status Hook

```typescript
import { useEffect, useState } from "react";
import { useBearBrickNFT } from "./useBearBrickNFT";

export function useMintStatus(fid: number | null) {
  const [hasMinted, setHasMinted] = useState(false);
  const [tokenId, setTokenId] = useState<bigint | null>(null);
  const [loading, setLoading] = useState(false);
  const contract = useBearBrickNFT();

  useEffect(() => {
    if (!fid) return;

    setLoading(true);
    
    contract.hasMinted(fid)
      .then(async (minted) => {
        setHasMinted(minted);
        
        if (minted) {
          const id = await contract.getTokenIdByFid(fid);
          setTokenId(id);
        }
      })
      .finally(() => setLoading(false));
  }, [fid, contract]);

  return { hasMinted, tokenId, loading };
}

// Usage in component
function MintButton({ fid }: { fid: number }) {
  const { hasMinted, loading } = useMintStatus(fid);

  if (loading) return <div>Loading...</div>;
  if (hasMinted) return <div>Already minted!</div>;

  return <button onClick={() => /* mint */}>Mint NFT</button>;
}
```

### Mint Hook

```typescript
import { useState } from "react";
import { useBearBrickNFT } from "./useBearBrickNFT";

export function useMint() {
  const [isMinting, setIsMinting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const contract = useBearBrickNFT(true); // needs signer

  const mint = async (fid: number, tokenURI: string) => {
    setIsMinting(true);
    setError(null);

    try {
      const mintPrice = await contract.MINT_PRICE();
      const tx = await contract.mint(fid, tokenURI, { value: mintPrice });
      const receipt = await tx.wait();
      
      return receipt;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsMinting(false);
    }
  };

  return { mint, isMinting, error };
}

// Usage in component
function MintComponent({ fid, tokenURI }: Props) {
  const { mint, isMinting, error } = useMint();

  const handleMint = async () => {
    try {
      await mint(fid, tokenURI);
      alert("Successfully minted!");
    } catch (err) {
      console.error("Failed to mint:", err);
    }
  };

  return (
    <div>
      <button onClick={handleMint} disabled={isMinting}>
        {isMinting ? "Minting..." : "Mint NFT"}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

## Error Handling

```typescript
async function safeMint(fid: number, tokenURI: string) {
  try {
    const result = await mintNFT(signer, fid, tokenURI);
    return { success: true, data: result };
  } catch (error: any) {
    // Parse Solidity revert reasons
    if (error.message.includes("Incorrect payment amount")) {
      return { success: false, error: "Please send exactly 0.00001 ETH" };
    }
    
    if (error.message.includes("FID has already minted")) {
      return { success: false, error: "This FID has already minted" };
    }
    
    if (error.message.includes("FID must be greater than 0")) {
      return { success: false, error: "Invalid FID" };
    }
    
    // User rejected transaction
    if (error.code === "ACTION_REJECTED") {
      return { success: false, error: "Transaction cancelled" };
    }
    
    return { success: false, error: "Failed to mint NFT" };
  }
}
```

## TypeScript Type Safety

```typescript
import type { BearBrickNFT } from "@lab/labuba-contract";

// Function that accepts contract instance
function processContract(contract: BearBrickNFT) {
  // TypeScript knows all available methods and their signatures
  contract.mint(/* ... */);
  contract.tokenURI(/* ... */);
  // etc.
}

// Events are also typed
contract.on("NFTMinted", (minter, fid, tokenId, tokenURI) => {
  // All parameters are properly typed
  console.log(`Minted by ${minter}`);
  console.log(`FID: ${fid}`);
  console.log(`Token ID: ${tokenId}`);
  console.log(`URI: ${tokenURI}`);
});
```

## Listening to Events

```typescript
// Listen for mint events
contract.on("NFTMinted", (minter, fid, tokenId, tokenURI, event) => {
  console.log("New NFT minted!");
  console.log("Minter:", minter);
  console.log("FID:", fid.toString());
  console.log("Token ID:", tokenId.toString());
  console.log("URI:", tokenURI);
});

// Listen for URI updates
contract.on("TokenURIUpdated", (tokenId, newURI, event) => {
  console.log(`Token ${tokenId} URI updated to: ${newURI}`);
});

// Query past events
const filter = contract.filters.NFTMinted();
const events = await contract.queryFilter(filter, -1000); // last 1000 blocks

events.forEach((event) => {
  console.log("Past mint:", {
    minter: event.args.minter,
    fid: event.args.fid.toString(),
    tokenId: event.args.tokenId.toString(),
  });
});
```
