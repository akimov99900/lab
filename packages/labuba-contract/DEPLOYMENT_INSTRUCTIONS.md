# Base Mainnet Deployment Instructions

## 🎯 Objective

Deploy the LabubaNFT smart contract to Base mainnet for production use with the following specifications:
- **Owner Address**: 0x4CA964d1A084628aFCef42680cC955a263158A8F
- **Mint Price**: 0.00001 ETH
- **Royalty**: 2% (200 basis points)
- **Payment Recipient**: 0x4CA964d1A084628aFCef42680cC955a263158A8F

## 📋 Prerequisites

### 1. Environment Setup
Ensure your `.env` file is properly configured:

```bash
# Required for deployment
PRIVATE_KEY=your_private_key_here
BASE_RPC_URL=https://mainnet.base.org
BASESCAN_API_KEY=your_basescan_api_key_here

# Optional
REPORT_GAS=false
```

### 2. Verify Requirements
- [ ] Deployer wallet has sufficient ETH on Base mainnet for gas fees
- [ ] Contract is compiled (`pnpm hardhat compile`)
- [ ] All tests pass (`pnpm test`)
- [ ] Build completed successfully (`pnpm build`)

### 3. Run Preparation Script
```bash
pnpm hardhat run scripts/prepare-deployment.ts --network hardhat
```

## 🚀 Deployment Process

### Step 1: Deploy Contract
```bash
cd packages/labuba-contract
pnpm deploy:base-mainnet
```

**Expected Output:**
```
🚀 Deploying LabubaNFT contract to Base Mainnet...
Network: base-mainnet
Chain ID: 8453
Deploying with account: 0x...
Account balance: X.XXX ETH
Contract owner will be set to: 0x4CA964d1A084628aFCef42680cC955a263158A8F
Deploying LabubaNFT contract...
Waiting for deployment transaction confirmation...
✅ LabubaNFT deployed to: 0x...
```

### Step 2: Verify Contract Deployment
After deployment, the script will:
- Save deployment info to `deployments/base-mainnet.json`
- Save contract address to `MAINNET_ADDRESS.txt`
- Display verification command

### Step 3: Verify on BaseScan
```bash
# Get the deployed address
CONTRACT_ADDRESS=$(cat MAINNET_ADDRESS.txt)

# Verify contract
pnpm verify:base-mainnet $CONTRACT_ADDRESS "0x4CA964d1A084628aFCef42680cC955a263158A8F"
```

Or manually:
```bash
npx hardhat verify --network base-mainnet <CONTRACT_ADDRESS> "0x4CA964d1A084628aFCef42680cC955a263158A8F"
```

## 📊 Post-Deployment Verification

### 1. Check Contract Configuration
Connect to the deployed contract and verify:
```javascript
// Check owner
const owner = await labubaNFT.owner();
// Should be: 0x4CA964d1A084628aFCef42680cC955a263158A8F

// Check mint price
const mintPrice = await labubaNFT.MINT_PRICE();
// Should be: 10000000000000 wei (0.00001 ETH)

// Check royalty
const royalty = await labubaNFT.DEFAULT_ROYALTY_BPS();
// Should be: 200 (2%)
```

### 2. Test Functionality
- [ ] Test mint with correct payment amount
- [ ] Test mint with incorrect payment (should fail)
- [ ] Test duplicate FID prevention
- [ ] Test withdrawal functionality
- [ ] Test royalty information

## 🔗 Important Links

- **BaseScan**: https://basescan.org/
- **Base Mainnet RPC**: https://mainnet.base.org
- **Contract Owner**: 0x4CA964d1A084628aFCef42680cC955a263158A8F

## 📁 Generated Files

After successful deployment, you will have:

1. **`deployments/base-mainnet.json`** - Complete deployment information
2. **`MAINNET_ADDRESS.txt`** - Contract address for easy reference
3. **Verified contract on BaseScan** - Source code and ABI publicly available

## 🔧 Frontend Integration

Update your frontend environment:

```bash
# In your frontend .env file
NEXT_PUBLIC_LABUBA_CONTRACT_ADDRESS=<DEPLOYED_CONTRACT_ADDRESS>
NEXT_PUBLIC_BASE_RPC_URL=https://mainnet.base.org
```

## 🚨 Important Notes

### Security Considerations
- This is a **production deployment** - double-check all addresses
- The contract owner has significant privileges (withdraw funds, change royalties)
- Ensure the owner private key is stored securely

### Gas Estimates
- Estimated gas: ~2,500,000 gas
- Estimated cost: ~0.001-0.005 ETH (varies with network conditions)
- Always have extra ETH for buffer

### Contract Immutability
- Once deployed, the contract code cannot be changed
- Only owner settings (royalties) can be modified
- Test thoroughly on testnet first

## 🆘 Troubleshooting

### Common Issues

1. **Insufficient Gas**
   - Check wallet balance on Base mainnet
   - Increase gas limit if network is congested

2. **Verification Fails**
   - Ensure constructor parameters match exactly
   - Check that BaseScan API key is valid

3. **Transaction Stuck**
   - Use higher gas price for faster confirmation
   - Check network status on Base

### Support Commands

```bash
# Check deployment status
npx hardhat run scripts/check-deployment.ts --network base-mainnet

# Re-verify if needed
npx hardhat verify --network base-mainnet <ADDRESS> <OWNER_ADDRESS>

# Interact with deployed contract
npx hardhat console --network base-mainnet
```

## 📝 Deployment Record

After deployment, update this section:

- **Contract Address**: `0x...` (filled automatically)
- **Transaction Hash**: `0x...` (filled automatically)
- **Deployment Time**: `YYYY-MM-DD HH:MM:SS UTC`
- **Gas Used**: `...`
- **Total Cost**: `... ETH`
- **BaseScan Link**: https://basescan.org/address/CONTRACT_ADDRESS

---

⚠️ **Final Reminder**: This is a production deployment. Verify all addresses and configurations before executing the deployment command.
