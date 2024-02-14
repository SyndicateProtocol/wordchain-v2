// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/utils/Base64.sol";
import "openzeppelin-contracts/contracts/utils/Strings.sol";
import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "solmate/tokens/ERC721.sol";

contract Wordchain is ERC721, Ownable {
    uint256 private currentTokenId = 0;
    mapping(uint256 => string) public messages; // Mapping tokenId to messages for better storage management

    mapping(address authorizedMinter => bool authorized) public authorizedMinters;

    event AuthorizedMinterSet(address indexed minter, bool authorized);

    modifier onlyAuthorizedMinter() {
        require(authorizedMinters[msg.sender], "Wordchain: Caller is not an authorized minter");
        _;
    }

    constructor() ERC721("Wordchain", "WRDCHAIN") Ownable(msg.sender) {
        // The deployer is set as an authorized minter, allowing them to set up
        // owner mints manually via the contract as needed
        authorizedMinters[msg.sender] = true;
        emit AuthorizedMinterSet(msg.sender, true);

        // Authorize Syndicate's API-based wallet pool as a minter on Base
        // Mainnet
        authorizeBaseMainnetSyndicateAPI();
    }

    function mint(address to, string calldata message) onlyAuthorizedMinter public {
       require(bytes(message).length > 0, "Wordchain: Message cannot be empty");

        // mint the token
        ++currentTokenId;
        messages[currentTokenId] = message;
        _mint(to, currentTokenId);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(currentTokenId >= tokenId, "ERC721Metadata: URI query for nonexistent token");
        string memory message = messages[tokenId];

        // Dynamic SVG generation based on tokenId
        string memory svg = generateSVG(tokenId, message);

        // Base64 encode the SVG image
        string memory base64EncodedSvg = Base64.encode(bytes(svg));

        // Construct the tokenURI with embedded SVG
        string memory json = Base64.encode(bytes(abi.encodePacked('{"name": "Wordchain #', Strings.toString(tokenId), '", "description": "A unique wordchain token.", "image": "data:image/svg+xml;base64,', base64EncodedSvg, '"}')));
        return string(abi.encodePacked('data:application/json;base64,', json));
    }

   function generateSVG(uint256 tokenId, string memory message) internal pure returns (string memory svg) {
        // Dynamic colors for gradient based on tokenId
        string memory startColor = _toHexString((tokenId * 466321) % 16777215);
        string memory endColor = _toHexString((tokenId * 782641) % 16777215);
        string memory textColor = "white"; // Fixed text color for contrast
        string memory fontSize = Strings.toString(16 + (tokenId % 10)); // Font size varies between 16 and 25

        svg = string(abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">',
            '<defs>',
                '<linearGradient id="grad', Strings.toString(tokenId), '" x1="0%" y1="0%" x2="100%" y2="100%">',
                    '<stop offset="0%" style="stop-color:#', startColor, ';stop-opacity:1" />',
                    '<stop offset="100%" style="stop-color:#', endColor, ';stop-opacity:1" />',
                '</linearGradient>',
            '</defs>',
            '<rect width="100%" height="100%" fill="url(#grad', Strings.toString(tokenId), ')" />',
            // Additional graphic element (circle)
            '<circle cx="200" cy="200" r="80" stroke="black" stroke-width="4" fill="transparent" />',
            '<text x="200" y="220" font-family="\'Courier New\', monospace" font-size="', fontSize, 
            '" fill="', textColor, '" text-anchor="middle" dominant-baseline="middle">',
            message, '</text>',
            '</svg>'
        ));
        return svg;
    }

    function _toHexString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "00";
        }
        uint256 temp = value;
        uint256 length = 0;
        while (temp != 0) {
            length++;
            temp >>= 8;
        }
        return Strings.toHexString(value, length);
    }

    // Only the owner can set authorized minters. True = authorized, false =
    // unauthorized
    function setAuthorizedMinter(address minter, bool authorized) public onlyOwner {
        authorizedMinters[minter] = authorized;

        emit AuthorizedMinterSet(minter, authorized);
    }

       // These addresses are for Base Mainnet only.
    function authorizeBaseMainnetSyndicateAPI() internal {
        authorizedMinters[0x3D0263e0101DE2E9070737Df30236867485A5208] = true;
        authorizedMinters[0x98407Cb54D8dc219d8BF04C9018B512dDbB96caB] = true;
        authorizedMinters[0xF43A72c1a41b7361728C83699f69b5280161F0A5] = true;
        authorizedMinters[0x94702712BA81C0D065665B8b0312D87B190EbA37] = true;
        authorizedMinters[0x10FD71C6a3eF8F75d65ab9F3d77c364C321Faeb5] = true;

        emit AuthorizedMinterSet(0x3D0263e0101DE2E9070737Df30236867485A5208, true);
        emit AuthorizedMinterSet(0x98407Cb54D8dc219d8BF04C9018B512dDbB96caB, true);
        emit AuthorizedMinterSet(0xF43A72c1a41b7361728C83699f69b5280161F0A5, true);
        emit AuthorizedMinterSet(0x94702712BA81C0D065665B8b0312D87B190EbA37, true);
        emit AuthorizedMinterSet(0x10FD71C6a3eF8F75d65ab9F3d77c364C321Faeb5, true);
    }
}
