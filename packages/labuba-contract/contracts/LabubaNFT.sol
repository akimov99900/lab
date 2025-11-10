// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract LabubaNFT is ERC721, ERC721URIStorage, ERC2981, Ownable, ReentrancyGuard {
    uint256 public constant MINT_PRICE = 0.00001 ether;
    uint96 public constant DEFAULT_ROYALTY_BPS = 200; // 2%

    mapping(uint256 => uint256) public fidToTokenId;
    mapping(uint256 => bool) public hasMinted;

    event NFTMinted(
        address indexed minter,
        uint256 indexed fid,
        uint256 indexed tokenId,
        string tokenURI
    );

    event TokenURIUpdated(
        uint256 indexed tokenId,
        string newTokenURI
    );

    event Withdrawal(
        address indexed owner,
        uint256 amount
    );

    event RoyaltyUpdated(
        address indexed receiver,
        uint96 feeNumerator
    );

    constructor(address initialOwner) ERC721("Labuba NFT", "LABUBA") Ownable(initialOwner) {
        _setDefaultRoyalty(initialOwner, DEFAULT_ROYALTY_BPS);
    }

    function mint(uint256 fid, string memory tokenURI_) external payable nonReentrant {
        require(msg.value == MINT_PRICE, "Incorrect payment amount");
        require(fid > 0, "FID must be greater than 0");
        require(!hasMinted[fid], "FID has already minted");

        uint256 tokenId = fid;
        hasMinted[fid] = true;
        fidToTokenId[fid] = tokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        emit NFTMinted(msg.sender, fid, tokenId, tokenURI_);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI_) external {
        require(ownerOf(tokenId) == msg.sender, "Only token owner can update URI");
        _setTokenURI(tokenId, tokenURI_);
        emit TokenURIUpdated(tokenId, tokenURI_);
    }

    function setDefaultRoyalty(address receiver, uint96 feeNumerator) external onlyOwner {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");

        emit Withdrawal(owner(), balance);
    }

    function getTokenIdByFid(uint256 fid) external view returns (uint256) {
        require(hasMinted[fid], "FID has not minted yet");
        return fidToTokenId[fid];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
