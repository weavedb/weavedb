// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC721 {
    function ownerOf(uint256 tokenId) external view returns (address owner);
}

contract ACL {
  address public contract_address;
  
  constructor(address addr) {
    contract_address = addr;
  }
  
  function isOwner(address addr, uint [] memory tokens) public view returns (bool) {
    IERC721 nft = IERC721(contract_address);
    bool is_owner = false;
    for(uint i = 0; i < tokens.length; i++){
      try nft.ownerOf(tokens[i]) returns (address owner) {
        if(addr == owner){
	  is_owner = true;
	  break;
	}
      } catch {}
    }
    return is_owner;
  }
  
}

