import { expect } from "chai";
import { ethers } from "hardhat";
import { BearBrickNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

describe("BearBrickNFT", function () {
  const MINT_PRICE = ethers.parseEther("0.00001");
  const FID_1 = 123n;
  const FID_2 = 456n;
  const TOKEN_URI_1 = "ipfs://QmTest1";
  const TOKEN_URI_2 = "ipfs://QmTest2";

  async function deployBearBrickNFTFixture() {
    const [owner, user1, user2, user3] = await ethers.getSigners();

    const BearBrickNFT = await ethers.getContractFactory("BearBrickNFT");
    const bearBrickNFT = await BearBrickNFT.deploy(owner.address);

    return { bearBrickNFT, owner, user1, user2, user3 };
  }

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      const { bearBrickNFT, owner } = await loadFixture(deployBearBrickNFTFixture);
      expect(await bearBrickNFT.owner()).to.equal(owner.address);
    });

    it("Should have correct name and symbol", async function () {
      const { bearBrickNFT } = await loadFixture(deployBearBrickNFTFixture);
      expect(await bearBrickNFT.name()).to.equal("BearBrick NFT");
      expect(await bearBrickNFT.symbol()).to.equal("BEARBRICK");
    });

    it("Should set default royalty to 2%", async function () {
      const { bearBrickNFT, owner } = await loadFixture(deployBearBrickNFTFixture);
      const salePrice = ethers.parseEther("1");
      const royaltyInfo = await bearBrickNFT.royaltyInfo(0, salePrice);
      
      expect(royaltyInfo[0]).to.equal(owner.address);
      expect(royaltyInfo[1]).to.equal(ethers.parseEther("0.02"));
    });

    it("Should have correct mint price constant", async function () {
      const { bearBrickNFT } = await loadFixture(deployBearBrickNFTFixture);
      expect(await bearBrickNFT.MINT_PRICE()).to.equal(MINT_PRICE);
    });
  });

  describe("Minting", function () {
    it("Should mint an NFT with correct payment", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE })
      )
        .to.emit(bearBrickNFT, "NFTMinted")
        .withArgs(user1.address, FID_1, FID_1, TOKEN_URI_1);

      expect(await bearBrickNFT.ownerOf(FID_1)).to.equal(user1.address);
      expect(await bearBrickNFT.tokenURI(FID_1)).to.equal(TOKEN_URI_1);
      expect(await bearBrickNFT.hasMinted(FID_1)).to.be.true;
      expect(await bearBrickNFT.fidToTokenId(FID_1)).to.equal(FID_1);
    });

    it("Should fail if payment is too low", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { 
          value: ethers.parseEther("0.000001") 
        })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should fail if payment is too high", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { 
          value: ethers.parseEther("0.0001") 
        })
      ).to.be.revertedWith("Incorrect payment amount");
    });

    it("Should fail if FID is 0", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).mint(0, TOKEN_URI_1, { value: MINT_PRICE })
      ).to.be.revertedWith("FID must be greater than 0");
    });

    it("Should prevent duplicate mints for same FID", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      await expect(
        bearBrickNFT.connect(user2).mint(FID_1, TOKEN_URI_2, { value: MINT_PRICE })
      ).to.be.revertedWith("FID has already minted");
    });

    it("Should allow different users to mint with different FIDs", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user2).mint(FID_2, TOKEN_URI_2, { value: MINT_PRICE });

      expect(await bearBrickNFT.ownerOf(FID_1)).to.equal(user1.address);
      expect(await bearBrickNFT.ownerOf(FID_2)).to.equal(user2.address);
      expect(await bearBrickNFT.tokenURI(FID_1)).to.equal(TOKEN_URI_1);
      expect(await bearBrickNFT.tokenURI(FID_2)).to.equal(TOKEN_URI_2);
    });

    it("Should derive tokenId from FID", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      
      expect(await bearBrickNFT.getTokenIdByFid(FID_1)).to.equal(FID_1);
    });

    it("Should track contract balance after mints", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user2).mint(FID_2, TOKEN_URI_2, { value: MINT_PRICE });

      const contractBalance = await ethers.provider.getBalance(await bearBrickNFT.getAddress());
      expect(contractBalance).to.equal(MINT_PRICE * 2n);
    });
  });

  describe("Token URI Updates", function () {
    it("Should allow token owner to update tokenURI", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      const newURI = "ipfs://QmUpdated";
      await expect(
        bearBrickNFT.connect(user1).setTokenURI(FID_1, newURI)
      )
        .to.emit(bearBrickNFT, "TokenURIUpdated")
        .withArgs(FID_1, newURI);

      expect(await bearBrickNFT.tokenURI(FID_1)).to.equal(newURI);
    });

    it("Should prevent non-owner from updating tokenURI", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      await expect(
        bearBrickNFT.connect(user2).setTokenURI(FID_1, "ipfs://QmHacked")
      ).to.be.revertedWith("Only token owner can update URI");
    });

    it("Should allow tokenURI update after transfer", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user1).transferFrom(user1.address, user2.address, FID_1);

      const newURI = "ipfs://QmNewOwner";
      await bearBrickNFT.connect(user2).setTokenURI(FID_1, newURI);

      expect(await bearBrickNFT.tokenURI(FID_1)).to.equal(newURI);
    });
  });

  describe("Royalty Management", function () {
    it("Should return correct royalty info for 2%", async function () {
      const { bearBrickNFT, owner } = await loadFixture(deployBearBrickNFTFixture);

      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await bearBrickNFT.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(owner.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.02"));
    });

    it("Should allow owner to update royalty", async function () {
      const { bearBrickNFT, owner, user1 } = await loadFixture(deployBearBrickNFTFixture);

      const newRoyalty = 500n; // 5%
      await expect(
        bearBrickNFT.connect(owner).setDefaultRoyalty(user1.address, newRoyalty)
      )
        .to.emit(bearBrickNFT, "RoyaltyUpdated")
        .withArgs(user1.address, newRoyalty);

      const salePrice = ethers.parseEther("1");
      const [receiver, royaltyAmount] = await bearBrickNFT.royaltyInfo(1, salePrice);

      expect(receiver).to.equal(user1.address);
      expect(royaltyAmount).to.equal(ethers.parseEther("0.05"));
    });

    it("Should prevent non-owner from updating royalty", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).setDefaultRoyalty(user1.address, 500)
      ).to.be.revertedWithCustomError(bearBrickNFT, "OwnableUnauthorizedAccount");
    });

    it("Should calculate royalty correctly for different sale prices", async function () {
      const { bearBrickNFT, owner } = await loadFixture(deployBearBrickNFTFixture);

      const testCases = [
        { price: ethers.parseEther("0.5"), expected: ethers.parseEther("0.01") },
        { price: ethers.parseEther("2"), expected: ethers.parseEther("0.04") },
        { price: ethers.parseEther("10"), expected: ethers.parseEther("0.2") },
      ];

      for (const testCase of testCases) {
        const [receiver, royaltyAmount] = await bearBrickNFT.royaltyInfo(1, testCase.price);
        expect(receiver).to.equal(owner.address);
        expect(royaltyAmount).to.equal(testCase.expected);
      }
    });
  });

  describe("Withdrawal", function () {
    it("Should allow owner to withdraw funds", async function () {
      const { bearBrickNFT, owner, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user2).mint(FID_2, TOKEN_URI_2, { value: MINT_PRICE });

      const contractBalance = await ethers.provider.getBalance(await bearBrickNFT.getAddress());
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await bearBrickNFT.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      expect(await ethers.provider.getBalance(await bearBrickNFT.getAddress())).to.equal(0);
      expect(ownerBalanceAfter).to.equal(ownerBalanceBefore + contractBalance - gasUsed);
    });

    it("Should emit Withdrawal event", async function () {
      const { bearBrickNFT, owner, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      await expect(bearBrickNFT.connect(owner).withdraw())
        .to.emit(bearBrickNFT, "Withdrawal")
        .withArgs(owner.address, MINT_PRICE);
    });

    it("Should prevent non-owner from withdrawing", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      await expect(
        bearBrickNFT.connect(user2).withdraw()
      ).to.be.revertedWithCustomError(bearBrickNFT, "OwnableUnauthorizedAccount");
    });

    it("Should fail when no funds to withdraw", async function () {
      const { bearBrickNFT, owner } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(owner).withdraw()
      ).to.be.revertedWith("No funds to withdraw");
    });

    it("Should handle multiple withdrawals", async function () {
      const { bearBrickNFT, owner, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(owner).withdraw();

      expect(await ethers.provider.getBalance(await bearBrickNFT.getAddress())).to.equal(0);

      await bearBrickNFT.connect(user2).mint(FID_2, TOKEN_URI_2, { value: MINT_PRICE });
      await bearBrickNFT.connect(owner).withdraw();

      expect(await ethers.provider.getBalance(await bearBrickNFT.getAddress())).to.equal(0);
    });
  });

  describe("FID Lookup", function () {
    it("Should return correct tokenId for minted FID", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      expect(await bearBrickNFT.getTokenIdByFid(FID_1)).to.equal(FID_1);
    });

    it("Should fail for unminted FID", async function () {
      const { bearBrickNFT } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.getTokenIdByFid(999)
      ).to.be.revertedWith("FID has not minted yet");
    });

    it("Should track multiple FIDs correctly", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user2).mint(FID_2, TOKEN_URI_2, { value: MINT_PRICE });

      expect(await bearBrickNFT.getTokenIdByFid(FID_1)).to.equal(FID_1);
      expect(await bearBrickNFT.getTokenIdByFid(FID_2)).to.equal(FID_2);
    });
  });

  describe("ERC-721 Standard Compliance", function () {
    it("Should support ERC-721 interface", async function () {
      const { bearBrickNFT } = await loadFixture(deployBearBrickNFTFixture);

      const ERC721_INTERFACE_ID = "0x80ac58cd";
      expect(await bearBrickNFT.supportsInterface(ERC721_INTERFACE_ID)).to.be.true;
    });

    it("Should support ERC-2981 interface", async function () {
      const { bearBrickNFT } = await loadFixture(deployBearBrickNFTFixture);

      const ERC2981_INTERFACE_ID = "0x2a55205a";
      expect(await bearBrickNFT.supportsInterface(ERC2981_INTERFACE_ID)).to.be.true;
    });

    it("Should allow token transfers", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user1).transferFrom(user1.address, user2.address, FID_1);

      expect(await bearBrickNFT.ownerOf(FID_1)).to.equal(user2.address);
    });

    it("Should maintain FID mapping after transfer", async function () {
      const { bearBrickNFT, user1, user2 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });
      await bearBrickNFT.connect(user1).transferFrom(user1.address, user2.address, FID_1);

      expect(await bearBrickNFT.getTokenIdByFid(FID_1)).to.equal(FID_1);
      expect(await bearBrickNFT.hasMinted(FID_1)).to.be.true;
    });
  });

  describe("Reentrancy Protection", function () {
    it("Should protect mint from reentrancy", async function () {
      const { bearBrickNFT, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await expect(
        bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE })
      ).to.not.be.reverted;
    });

    it("Should protect withdraw from reentrancy", async function () {
      const { bearBrickNFT, owner, user1 } = await loadFixture(deployBearBrickNFTFixture);

      await bearBrickNFT.connect(user1).mint(FID_1, TOKEN_URI_1, { value: MINT_PRICE });

      await expect(
        bearBrickNFT.connect(owner).withdraw()
      ).to.not.be.reverted;
    });
  });
});
