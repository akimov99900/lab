# Base Mainnet Deployment Checklist

## 🚨 Pre-Deployment Checklist

### Environment Setup
- [ ] `.env` file exists and is configured
- [ ] `PRIVATE_KEY` is set with deployer wallet private key
- [ ] `BASE_RPC_URL` is set with Base mainnet RPC endpoint
- [ ] `BASESCAN_API_KEY` is set for contract verification
- [ ] Deployer wallet has sufficient ETH on Base for gas fees
- [ ] Contract is compiled (`pnpm hardhat compile`)

### Contract Configuration Verification
- [ ] Owner address: `0x4CA964d1A084628aFCef42680cC955a263158A8F`
- [ ] Mint price: `0.00001 ETH` (hardcoded in contract)
- [ ] Royalty: `2%` (200 basis points, hardcoded in contract)
- [ ] Payment recipient: Same as owner address

### Security Verification
- [ ] Contract code reviewed and tested
- [ ] All tests pass (`pnpm test`)
- [ ] Gas estimation looks reasonable
- [ ] No obvious security vulnerabilities

## 🚀 Deployment Process

### Execute Deployment
```bash
cd packages/labuba-contract
pnpm deploy:base-mainnet
```

### Verify Deployment Success
- [ ] Contract deployment transaction confirmed
- [ ] Contract address recorded
- [ ] Deployment info saved to `deployments/base-mainnet.json`
- [ ] Contract address saved to `MAINNET_ADDRESS.txt`
- [ ] Owner address matches expected: `0x4CA964d1A084628aFCef42680cC955a263158A8F`

### Post-Deployment Verification
- [ ] Contract verified on BaseScan
- [ ] Contract configuration verified on-chain
- [ ] Test mint with small amount
- [ ] Test withdrawal functionality
- [ ] Verify royalty settings

## 📋 Commands

### Deploy Contract
```bash
pnpm deploy:base-mainnet
```

### Verify Contract on BaseScan
```bash
# Get contract address from MAINNET_ADDRESS.txt
CONTRACT_ADDRESS=$(cat MAINNET_ADDRESS.txt)
pnpm verify:base-mainnet $CONTRACT_ADDRESS "0x4CA964d1A084628aFCef42680cC955a263158A8F"
```

### Manual Verification (if script fails)
```bash
npx hardhat verify --network base-mainnet <CONTRACT_ADDRESS> "0x4CA964d1A084628aFCef42680cC955a263158A8F"
```

## 📊 Post-Deployment Tasks

### Documentation Updates
- [ ] Update README with deployed contract address
- [ ] Document deployment timestamp and transaction hash
- [ ] Add BaseScan link to documentation

### Frontend Integration
- [ ] Update frontend `.env` with `NEXT_PUBLIC_BEARBRICK_CONTRACT_ADDRESS`
- [ ] Test frontend contract interaction
- [ ] Verify OpenSea integration (if applicable)

### Monitoring
- [ ] Set up contract monitoring
- [ ] Monitor for unusual activity
- [ ] Track gas usage and costs

## 🔗 Important Links

- **BaseScan**: https://basescan.org/
- **Base Mainnet RPC**: https://mainnet.base.org
- **Contract Owner**: 0x4CA964d1A084628aFCef42680cC955a263158A8F

## 📝 Deployment Records

After deployment, fill in this section:

- **Contract Address**: `0x...` (will be filled by deployment script)
- **Transaction Hash**: `0x...` (will be filled by deployment script)
- **Deployment Time**: `YYYY-MM-DD HH:MM:SS UTC`
- **Gas Used**: `...`
- **Total Cost**: `... ETH`
- **BaseScan Link**: https://basescan.org/address/CONTRACT_ADDRESS

## 🚨 Emergency Procedures

### If Deployment Fails
1. Check wallet balance
2. Verify RPC connectivity
3. Check network congestion
4. Review transaction parameters

### If Post-Deployment Issues
1. Verify contract configuration
2. Check owner permissions
3. Test basic functionality
4. Contact development team

---

⚠️ **Remember**: This is a production deployment. Double-check all addresses and configurations before proceeding.
