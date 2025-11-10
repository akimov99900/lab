import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("🚀 Deploying BearBrickNFT contract to Base Mainnet...");
  console.log("Network:", network.name);
  console.log("Chain ID:", network.config.chainId);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Production owner address
  const ownerAddress = "0x4CA964d1A084628aFCef42680cC955a263158A8F";
  console.log("Contract owner will be set to:", ownerAddress);

  // Verify we're on Base mainnet
  if (network.config.chainId !== 8453) {
    throw new Error(`Expected chain ID 8453 (Base mainnet), got ${network.config.chainId}`);
  }

  console.log("Deploying BearBrickNFT contract...");
  const BearBrickNFT = await ethers.getContractFactory("BearBrickNFT");
  const bearBrickNFT = await BearBrickNFT.deploy(ownerAddress);

  console.log("Waiting for deployment transaction confirmation...");
  await bearBrickNFT.waitForDeployment();

  const contractAddress = await bearBrickNFT.getAddress();
  console.log("✅ BearBrickNFT deployed to:", contractAddress);

  // Get deployment transaction hash
  const deploymentTx = bearBrickNFT.deploymentTransaction();
  const txHash = deploymentTx?.hash || "unknown";
  console.log("📝 Deployment transaction hash:", txHash);

  // Verify contract configuration
  const mintPrice = await bearBrickNFT.MINT_PRICE();
  const defaultRoyalty = await bearBrickNFT.DEFAULT_ROYALTY_BPS();
  const contractOwner = await bearBrickNFT.owner();

  console.log("\n🔍 Contract Configuration:");
  console.log("- Mint Price:", ethers.formatEther(mintPrice), "ETH");
  console.log("- Default Royalty:", defaultRoyalty.toString(), "basis points (" + (Number(defaultRoyalty) / 100) + "%)");
  console.log("- Contract Owner:", contractOwner);
  console.log("- Expected Owner:", ownerAddress);
  console.log("- Owner Match:", contractOwner.toLowerCase() === ownerAddress.toLowerCase());

  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: ownerAddress,
    deploymentTime: new Date().toISOString(),
    transactionHash: txHash,
    mintPrice: ethers.formatEther(mintPrice),
    defaultRoyaltyBps: defaultRoyalty.toString(),
    defaultRoyaltyPercentage: (Number(defaultRoyalty) / 100) + "%",
    basescanUrl: `https://basescan.org/address/${contractAddress}`,
    transactionUrl: `https://basescan.org/tx/${txHash}`,
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  // Save contract address to separate file for easy access
  const addressFile = path.join(__dirname, "..", "MAINNET_ADDRESS.txt");
  fs.writeFileSync(addressFile, contractAddress);

  console.log("\n📁 Deployment files saved:");
  console.log("- Deployment info:", deploymentFile);
  console.log("- Contract address:", addressFile);

  console.log("\n🎉 Deployment Summary:");
  console.log("=====================");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name, "(Chain ID:", network.config.chainId, ")");
  console.log("Mint Price:", deploymentInfo.mintPrice, "ETH");
  console.log("Default Royalty:", deploymentInfo.defaultRoyaltyPercentage);
  console.log("Owner:", deploymentInfo.owner);
  console.log("Deployer:", deployer.address);
  console.log("BaseScan:", deploymentInfo.basescanUrl);
  console.log("Transaction:", deploymentInfo.transactionUrl);

  console.log("\n🔧 To verify the contract on BaseScan, run:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress} "${ownerAddress}"`);

  console.log("\n📝 Next steps:");
  console.log("1. Verify contract on BaseScan using the command above");
  console.log("2. Update frontend environment with contract address");
  console.log("3. Test contract functionality on mainnet");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
