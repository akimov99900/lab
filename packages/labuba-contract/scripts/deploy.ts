import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  console.log("Deploying LabubaNFT contract...");
  console.log("Network:", network.name);

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)));

  // Owner address for production deployment
  const ownerAddress = "0x4CA964d1A084628aFCef42680cC955a263158A8F";
  console.log("Contract owner will be set to:", ownerAddress);

  const LabubaNFT = await ethers.getContractFactory("LabubaNFT");
  const labubaNFT = await LabubaNFT.deploy(ownerAddress);

  await labubaNFT.waitForDeployment();

  const contractAddress = await labubaNFT.getAddress();
  console.log("LabubaNFT deployed to:", contractAddress);

  const deploymentInfo = {
    network: network.name,
    chainId: network.config.chainId,
    contractAddress: contractAddress,
    deployer: deployer.address,
    owner: ownerAddress,
    deploymentTime: new Date().toISOString(),
    mintPrice: ethers.formatEther(await labubaNFT.MINT_PRICE()),
    defaultRoyalty: "2%",
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log("\nDeployment info saved to:", deploymentFile);
  console.log("\nDeployment Summary:");
  console.log("-------------------");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", network.name);
  console.log("Mint Price:", deploymentInfo.mintPrice, "ETH");
  console.log("Default Royalty:", deploymentInfo.defaultRoyalty);
  console.log("\nTo verify the contract, run:");
  console.log(`npx hardhat verify --network ${network.name} ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
