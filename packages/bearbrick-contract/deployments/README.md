# Deployment Information

This directory contains deployment information for different networks.

After deploying, you'll find JSON files for each network:

- `baseSepolia.json` - Base Sepolia testnet deployment
- `base.json` - Base mainnet deployment
- `hardhat.json` - Local Hardhat network deployment

Each file contains:
- Contract address
- Deployer address
- Network details (name, chainId)
- Deployment timestamp
- Configuration summary (mint price, royalty percentage)

## Usage in Frontend

```typescript
import deployment from "@lab/labuba-contract/deployments/base.json";

const contractAddress = deployment.contractAddress;
const mintPrice = deployment.mintPrice;
```

**Note:** These files are gitignored by default to avoid committing testnet/local addresses. The actual deployment addresses should be configured via environment variables in production.
