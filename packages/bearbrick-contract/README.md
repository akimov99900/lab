# BearBrick NFT Contract

A Hardhat-based Solidity smart contract package for the BearBrick NFT project. Implements ERC-721 and ERC-2981 standards with Farcaster FID-based minting.

## Features

- **ERC-721 NFT Standard**: Full compliance with ERC-721 for NFT ownership and transfers
- **ERC-2981 Royalty Standard**: Built-in 2% royalty support for secondary sales
- **Fixed Mint Price**: 0.00001 ETH per mint
- **FID-Based Minting**: One mint per Farcaster FID, preventing duplicate mints
- **TokenURI Management**: Token owners can update their NFT metadata URI
- **Owner Withdrawal**: Contract owner can withdraw accumulated mint proceeds
- **Events for Indexing**: Comprehensive events for off-chain indexing and tracking
- **Security**: ReentrancyGuard protection on critical functions

## Contract Architecture

### BearBrickNFT.sol

The main contract inherits from:
- `ERC721` - Standard NFT functionality
- `ERC721URIStorage` - Token-specific URI storage
- `ERC2981` - Royalty standard implementation
- `Ownable` - Access control for administrative functions
- `ReentrancyGuard` - Protection against reentrancy attacks

### Key Functions

#### Public Functions

- `mint(uint256 fid, string memory tokenURI_)` - Mint an NFT for a given FID
  - Requires exactly 0.00001 ETH payment
  - FID must be > 0 and not previously minted
  - Sets tokenURI at mint time
  - Emits `NFTMinted` event

- `setTokenURI(uint256 tokenId, string memory tokenURI_)` - Update token URI
  - Only callable by token owner
  - Emits `TokenURIUpdated` event

- `getTokenIdByFid(uint256 fid)` - Get tokenId for a given FID
  - Returns tokenId (equal to FID)
  - Reverts if FID hasn't minted yet

#### Owner Functions

- `withdraw()` - Withdraw contract balance
  - Only callable by contract owner
  - Protected by ReentrancyGuard
  - Emits `Withdrawal` event

- `setDefaultRoyalty(address receiver, uint96 feeNumerator)` - Update royalty settings
  - Only callable by contract owner
  - feeNumerator is in basis points (200 = 2%)
  - Emits `RoyaltyUpdated` event

### Storage Mappings

- `fidToTokenId` - Maps FID → tokenId
- `hasMinted` - Tracks which FIDs have minted

## Installation

```bash
cd packages/labuba-contract
pnpm install
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required variables:
- `PRIVATE_KEY` - Deployer private key (without 0x prefix)
- `BASE_SEPOLIA_RPC_URL` - Base Sepolia RPC endpoint (default: https://sepolia.base.org)
- `BASE_RPC_URL` - Base mainnet RPC endpoint (default: https://mainnet.base.org)
- `BASESCAN_API_KEY` - BaseScan API key for contract verification

Optional variables:
- `REPORT_GAS` - Set to "true" to enable gas reporting in tests

### Network Configuration

The package is pre-configured for:
- **Base Sepolia** (testnet) - Chain ID: 84532
- **Base Mainnet** - Chain ID: 8453
- **Hardhat** (local) - Chain ID: 31337

## Development

### Compile Contracts

```bash
pnpm hardhat compile
```

This will:
1. Compile Solidity contracts
2. Generate TypeChain types
3. Create artifacts in `artifacts/` directory

### Run Tests

```bash
# Run all tests
pnpm test

# Run with gas reporting
REPORT_GAS=true pnpm test

# Run with coverage
pnpm hardhat coverage
```

### Test Coverage

The test suite covers:
- ✅ Deployment and initialization
- ✅ Payment enforcement (exact amount required)
- ✅ Duplicate mint prevention (per FID)
- ✅ TokenURI updates (owner-only)
- ✅ Royalty info conformance (ERC-2981)
- ✅ Withdrawal security (owner-only, reentrancy-protected)
- ✅ FID to tokenId lookups
- ✅ ERC-721 standard compliance
- ✅ Event emissions

## Deployment

### Deploy to Base Sepolia (Testnet)

```bash
pnpm deploy:base-sepolia
```

### Deploy to Base Mainnet (Production)

⚠️ **Production Deployment - Use with Caution**

```bash
pnpm deploy:base-mainnet
```

**Mainnet Configuration:**
- **Network**: Base Mainnet (Chain ID: 8453)
- **Owner Address**: 0x4CA964d1A084628aFCef42680cC955a263158A8F
- **Mint Price**: 0.00001 ETH
- **Royalty**: 2% (200 basis points)
- **Payment Recipient**: 0x4CA964d1A084628aFCef42680cC955a263158A8F

**Prerequisites:**
1. Ensure sufficient ETH on Base for deployment gas
2. Set `PRIVATE_KEY` in `.env` with deployer wallet private key
3. Set `BASE_RPC_URL` with Base mainnet RPC endpoint
4. Set `BASESCAN_API_KEY` for contract verification

**Post-Deployment Steps:**
1. Verify contract on BaseScan:
   ```bash
   pnpm verify:base-mainnet <CONTRACT_ADDRESS>
   ```
2. Update frontend environment with deployed address
3. Test contract functionality on mainnet with small amounts

### Deploy to Base Mainnet (Alternative)

```bash
pnpm deploy:base
```

Deployment info is saved to `deployments/{network}.json` with:
- Contract address
- Deployer address
- Owner address
- Network details
- Deployment timestamp
- Transaction hash
- Configuration summary

The mainnet deployment also saves the contract address to `MAINNET_ADDRESS.txt` for easy reference.

### Verify Contract

After deployment, verify on BaseScan:

```bash
# Base Sepolia
pnpm verify:base-sepolia <CONTRACT_ADDRESS>

# Base Mainnet
pnpm verify:base <CONTRACT_ADDRESS>
```

Or manually:
```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

## Frontend Integration

### Using ABI and Types

After building the package, the following files are available:

```typescript
// Import TypeChain factory
import { BearBrickNFT__factory } from "@lab/labuba-contract";

// Import types
import type { BearBrickNFT } from "@lab/labuba-contract";

// Import raw ABI
import BearBrickNFTABI from "@lab/labuba-contract/abi";
```

### Example: Connect to Deployed Contract

```typescript
import { ethers } from "ethers";
import { BearBrickNFT__factory } from "@lab/labuba-contract";

// Load deployment info
import deployment from "@lab/labuba-contract/deployments/base.json";

// Connect to contract
const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const labubaNFT = BearBrickNFT__factory.connect(deployment.contractAddress, signer);

// Mint an NFT
const tx = await labubaNFT.mint(
  123, // FID
  "ipfs://QmYourTokenURI",
  { value: ethers.parseEther("0.00001") }
);
await tx.wait();
```

### Example: Read Contract Data

```typescript
// Check if FID has minted
const hasMinted = await labubaNFT.hasMinted(123);

// Get token ID for FID
const tokenId = await labubaNFT.getTokenIdByFid(123);

// Get token URI
const uri = await labubaNFT.tokenURI(tokenId);

// Get royalty info
const [receiver, royaltyAmount] = await labubaNFT.royaltyInfo(
  tokenId,
  ethers.parseEther("1") // sale price
);
```

## Build Output

The build process generates:

```
dist/
├── abi/
│   └── BearBrickNFT.json         # Contract ABI
├── typechain-types/            # TypeChain generated types
│   ├── BearBrickNFT.ts
│   ├── factories/
│   │   └── BearBrickNFT__factory.ts
│   └── ...
└── index.d.ts                  # TypeScript declarations
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm build` | Compile contracts, generate types, copy artifacts |
| `pnpm test` | Run Hardhat tests |
| `pnpm deploy:base-sepolia` | Deploy to Base Sepolia testnet |
| `pnpm deploy:base` | Deploy to Base mainnet |
| `pnpm deploy:base-mainnet` | Deploy to Base mainnet (production script) |
| `pnpm verify:base-sepolia` | Verify contract on Base Sepolia |
| `pnpm verify:base` | Verify contract on Base mainnet |
| `pnpm verify:base-mainnet` | Verify contract on Base mainnet |
| `pnpm clean` | Clean build artifacts |

## Security Considerations

### Auditing

This contract has not been formally audited. Please conduct a security audit before deploying to mainnet with real funds.

### Key Security Features

1. **ReentrancyGuard**: Protects `mint()` and `withdraw()` from reentrancy attacks
2. **Ownable**: Restricts administrative functions to contract owner
3. **Exact Payment Validation**: Requires exact mint price (prevents over/underpayment)
4. **Duplicate Prevention**: FID-based mapping prevents multiple mints per FID
5. **Owner-Only URI Updates**: Only token owners can update their token URIs

### Known Limitations

1. Token IDs are derived from FIDs (tokenId = FID), which means:
   - Token IDs are not sequential
   - Large FIDs could theoretically cause issues with some NFT platforms
   - Consider this design choice for your use case

2. TokenURI can be updated by token owner:
   - This provides flexibility but means metadata is not immutable
   - Consider implementing URI freeze functionality if immutability is required

## Testing on Testnet

1. Get Base Sepolia ETH from a faucet:
   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
   - https://docs.base.org/tools/network-faucets

2. Deploy contract:
   ```bash
   pnpm deploy:base-sepolia
   ```

3. Interact with contract using Hardhat console:
   ```bash
   npx hardhat console --network baseSepolia
   ```

4. Or use frontend/scripts with the deployed address from `deployments/baseSepolia.json`

## License

MIT

## Support

For issues, questions, or contributions, please refer to the main project repository.
