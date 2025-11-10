# Deployment Guide

Complete guide for deploying the LabubaNFT contract to Base networks.

## Prerequisites

### 1. Install Dependencies

```bash
cd packages/labuba-contract
pnpm install
```

### 2. Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here_without_0x_prefix

# Optional: Override default RPC URLs
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASE_RPC_URL=https://mainnet.base.org

# Required for verification
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional: Enable gas reporting in tests
REPORT_GAS=false
```

### 3. Obtain Required Resources

#### Private Key
- Export your private key from MetaMask or your wallet
- **NEVER commit this to git or share it**
- Store securely in `.env` file

#### Base Sepolia ETH (Testnet)
Get free testnet ETH from faucets:
- https://www.coinbase.com/faucets/base-ethereum-goerli-faucet
- Bridge from Ethereum Sepolia: https://bridge.base.org/deposit

#### Base Mainnet ETH
- Bridge ETH from Ethereum mainnet: https://bridge.base.org/
- Or acquire from exchanges that support Base

#### BaseScan API Key
1. Go to https://basescan.org/
2. Sign up for a free account
3. Create an API key in your account settings
4. Add to `.env` file

## Testing Locally

Before deploying, test the contract thoroughly:

```bash
# Compile contracts
pnpm hardhat compile

# Run all tests
pnpm test

# Run tests with gas reporting
REPORT_GAS=true pnpm test

# Generate coverage report
pnpm hardhat coverage
```

## Deployment to Base Sepolia (Testnet)

### Step 1: Verify Account Balance

```bash
npx hardhat console --network baseSepolia
```

In the console:
```javascript
const [deployer] = await ethers.getSigners();
console.log("Deployer address:", deployer.address);
console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
```

Make sure you have at least 0.001 ETH for deployment gas.

### Step 2: Deploy Contract

```bash
pnpm deploy:base-sepolia
```

Expected output:
```
Deploying LabubaNFT contract...
Network: baseSepolia
Deploying with account: 0x...
Account balance: 0.05 ETH
LabubaNFT deployed to: 0x...

Deployment info saved to: deployments/baseSepolia.json

Deployment Summary:
-------------------
Contract Address: 0x...
Network: baseSepolia
Mint Price: 0.00001 ETH
Default Royalty: 2%

To verify the contract, run:
npx hardhat verify --network baseSepolia 0x...
```

### Step 3: Verify Contract

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

Or use the script:
```bash
pnpm verify:base-sepolia <CONTRACT_ADDRESS>
```

After verification, your contract will be viewable on:
https://sepolia.basescan.org/address/<CONTRACT_ADDRESS>

### Step 4: Test on Testnet

Interact with your deployed contract:

```bash
npx hardhat console --network baseSepolia
```

Test minting:
```javascript
const LabubaNFT = await ethers.getContractFactory("LabubaNFT");
const contract = LabubaNFT.attach("<CONTRACT_ADDRESS>");

// Mint an NFT
const mintPrice = await contract.MINT_PRICE();
const tx = await contract.mint(123, "ipfs://QmTestURI", { value: mintPrice });
await tx.wait();

console.log("Minted! Check:", await contract.tokenURI(123));
```

## Deployment to Base Mainnet

### ⚠️ Important Pre-Deployment Checklist

Before deploying to mainnet:

- [ ] All tests pass successfully
- [ ] Contract has been deployed and tested on Base Sepolia
- [ ] Code has been reviewed (ideally by multiple people)
- [ ] Security considerations have been addressed
- [ ] You understand the contract is immutable after deployment
- [ ] You have sufficient ETH for deployment (recommend 0.01 ETH minimum)
- [ ] Private key is securely stored and backed up
- [ ] You have verified the correct RPC URL for Base mainnet

### Step 1: Final Checks

```bash
# Ensure everything compiles
pnpm hardhat clean
pnpm hardhat compile

# Run full test suite
pnpm test

# Verify account has sufficient balance
npx hardhat console --network base
```

### Step 2: Deploy to Mainnet

```bash
pnpm deploy:base
```

**Double-check the output before proceeding!**

### Step 3: Verify on BaseScan

```bash
npx hardhat verify --network base <CONTRACT_ADDRESS>
```

Or:
```bash
pnpm verify:base <CONTRACT_ADDRESS>
```

Verified contract will be available at:
https://basescan.org/address/<CONTRACT_ADDRESS>

### Step 4: Update Frontend Configuration

Update your frontend environment variables with the mainnet address:

```bash
# In your Next.js or frontend .env.production
NEXT_PUBLIC_LABUBA_NFT_ADDRESS=<CONTRACT_ADDRESS>
NEXT_PUBLIC_NETWORK=base
NEXT_PUBLIC_CHAIN_ID=8453
```

## Post-Deployment Tasks

### 1. Save Deployment Information

The deployment script automatically saves info to `deployments/<network>.json`:

```json
{
  "network": "base",
  "chainId": 8453,
  "contractAddress": "0x...",
  "deployer": "0x...",
  "deploymentTime": "2024-01-01T00:00:00.000Z",
  "mintPrice": "0.00001",
  "defaultRoyalty": "2%"
}
```

**Important:** Keep this file secure but accessible to your team.

### 2. Configure Frontend

Import the deployment info in your frontend:

```typescript
import deployment from "@lab/labuba-contract/deployments/base.json";

const CONTRACT_ADDRESS = deployment.contractAddress;
```

### 3. Set Up Indexer (Optional)

For better UX, set up an indexer to track events:

- Use The Graph protocol
- Or use a service like Alchemy/Moralis
- Or index events yourself using the contract's event emissions

### 4. Monitor Contract

Keep track of:
- Mint activity (via `NFTMinted` events)
- Total mints (count of unique FIDs)
- Contract balance (accumulated mint fees)
- Gas usage patterns

### 5. Test Live Contract

Before announcing, test all functionality:

```typescript
// Test read operations
const hasMinted = await contract.hasMinted(testFID);
const mintPrice = await contract.MINT_PRICE();

// Test mint (on testnet first!)
const tx = await contract.mint(fid, tokenURI, { value: mintPrice });
await tx.wait();

// Verify
const tokenId = await contract.getTokenIdByFid(fid);
const uri = await contract.tokenURI(tokenId);
```

## Troubleshooting

### "Insufficient funds for intrinsic transaction cost"

You don't have enough ETH. Get more ETH from:
- Testnet: Use faucet
- Mainnet: Bridge from Ethereum or buy on exchange

### "Invalid private key"

- Remove any `0x` prefix from `PRIVATE_KEY` in `.env`
- Ensure the key is 64 hexadecimal characters
- Check for extra spaces or newlines

### "Transaction underpriced"

Network is congested. Either:
- Wait for gas to decrease
- Increase gas price in transaction
- Check Base network status

### "Already verified"

Contract is already verified on BaseScan. Nothing to do!

### "FID has already minted" (when testing)

Use a different FID for each test mint since each FID can only mint once.

## Security Best Practices

### Private Key Management

1. **Never commit private keys to git**
   - `.env` is in `.gitignore`
   - Double-check before any commit

2. **Use hardware wallet for mainnet**
   - Consider using a Ledger/Trezor
   - Or a multisig wallet for production

3. **Separate keys for different environments**
   - Use different keys for testnet and mainnet
   - Use different key for development

### Contract Security

1. **Audit before mainnet**
   - Have code reviewed by experienced Solidity developers
   - Consider professional audit for production use

2. **Start with small transactions**
   - Test with minimum amounts first
   - Gradually increase as confidence builds

3. **Monitor for unusual activity**
   - Set up alerts for contract events
   - Watch for unexpected behaviors

### Operational Security

1. **Backup everything**
   - Deployment info
   - Private keys (securely!)
   - Environment configurations

2. **Use environment variables**
   - Never hardcode sensitive data
   - Use different configs per environment

3. **Limit access**
   - Only necessary team members should have deployment access
   - Use separate admin accounts for contract operations

## Mainnet Deployment Costs (Estimates)

Based on current Base gas prices (January 2024):

| Operation | Gas Units | Cost (at 0.05 gwei) |
|-----------|-----------|---------------------|
| Deploy Contract | ~2,500,000 | ~$0.50 |
| Mint NFT | ~150,000 | ~$0.03 |
| Update URI | ~50,000 | ~$0.01 |
| Transfer | ~65,000 | ~$0.013 |
| Withdraw | ~35,000 | ~$0.007 |

**Note:** Gas prices vary based on network congestion. Always check current prices before deploying.

## Network Information

### Base Sepolia (Testnet)

- **Chain ID:** 84532
- **RPC URL:** https://sepolia.base.org
- **Explorer:** https://sepolia.basescan.org
- **Faucet:** https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

### Base Mainnet

- **Chain ID:** 8453
- **RPC URL:** https://mainnet.base.org
- **Explorer:** https://basescan.org
- **Bridge:** https://bridge.base.org

## Next Steps

After successful deployment:

1. ✅ Save contract address securely
2. ✅ Verify contract on BaseScan
3. ✅ Update frontend configuration
4. ✅ Test all functionality with real transactions
5. ✅ Set up monitoring and alerts
6. ✅ Document contract address in team wiki/docs
7. ✅ Announce to users (if applicable)

## Support

If you encounter issues:

1. Check this guide thoroughly
2. Review Hardhat documentation: https://hardhat.org/docs
3. Check Base documentation: https://docs.base.org
4. Review transaction on BaseScan for detailed error messages
5. Consult team members or community

## Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Base Documentation](https://docs.base.org)
- [BaseScan](https://basescan.org)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Ethers.js Documentation](https://docs.ethers.org)
