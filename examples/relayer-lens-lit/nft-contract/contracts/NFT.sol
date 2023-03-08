// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract NFT is ERC721URIStorage {
    using Strings for uint256;
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;  

    constructor() ERC721("NFT", "NFT") {}

    function mint() public returns (uint256) {
      uint256 newId = _tokenIds.current();
      _mint(msg.sender, newId);
      _tokenIds.increment();
      return newId;
    }

    function getTokenURI(uint256 tokenId) public pure returns (string memory){
      bytes memory dataURI = abi.encodePacked(
        '{',
	  '"name": "NFT #', tokenId.toString(), '"',
        '}'
      );
      return string(
        abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(dataURI)
        )
      );
  }
}

