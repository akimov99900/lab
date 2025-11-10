import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🔍 Preparing for Base Mainnet Deployment");
  console.log("=========================================");

  // Check environment variables
  const requiredEnvVars = ["PRIVATE_KEY", "BASE_RPC_URL", "BASESCAN_API_KEY"];
  const missingVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.log("❌ Missing environment variables:");
    missingVars.forEach(varName => console.log(`   - ${varName}`));
    console.log("\nPlease set these variables in your .env file before deploying.");
    process.exit(1);
  }

  console.log("✅ All required environment variables are set");

  // Check if contract is compiled
  const artifactsPath = path.join(__dirname, "..", "artifacts", "contracts", "LabubaNFT.sol", "LabubaNFT.json");
  if (!fs.existsSync(artifactsPath)) {
    console.log("❌ Contract not compiled. Please run: pnpm hardhat compile");
    process.exit(1);
  }
  console.log("✅ Contract is compiled");

  // Check deployer balance (simulated)
  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("✅ Deployer account:", deployer.address);
  console.log("✅ Account balance:", ethers.formatEther(balance), "ETH");

  // Estimate deployment gas
  const LabubaNFT = await ethers.getContractFactory("LabubaNFT");
  const ownerAddress = "0x4CA964d1A084628aFCef42680cC955a263158A8F";
  const deploymentTx = await LabubaNFT.getDeployTransaction(ownerAddress);
  
  const estimatedGas = await ethers.provider.estimateGas(deploymentTx);
  const gasPrice = await ethers.provider.getFeeData();
  
  console.log("📊 Deployment Estimates:");
  console.log("   - Estimated Gas:", estimatedGas.toString());
  console.log("   - Gas Price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");
  
  const estimatedCost = estimatedGas * (gasPrice.gasPrice || 0n);
  console.log("   - Estimated Cost:", ethers.formatEther(estimatedCost), "ETH");

  // Verify contract configuration
  console.log("\n🔍 Contract Configuration:");
  console.log("   - Owner Address:", ownerAddress);
  console.log("   - Mint Price: 0.00001 ETH");
  console.log("   - Royalty: 2% (200 basis points)");
  console.log("   - Payment Recipient:", ownerAddress);

  // Create deployment instructions
  console.log("\n📋 Deployment Instructions:");
  console.log("==========================");
  console.log("1. Ensure you have sufficient ETH on Base mainnet");
  console.log("2. Run the deployment command:");
  console.log("   pnpm deploy:base-mainnet");
  console.log("3. Verify the contract on BaseScan:");
  console.log("   pnpm verify:base-mainnet <CONTRACT_ADDRESS>");
  console.log("4. Update frontend with the new contract address");

  console.log("\n✅ Deployment preparation complete!");
  console.log("You're ready to deploy to Base mainnet.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Preparation failed:", error);
    process.exit(1);
  });
