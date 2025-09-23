/// SPDX-License-Identifier: MIT
pragma solidity >=0.7.0 <0.9.0;

import "zkjson/contracts/ZKIPFS.sol";

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract ZKNFT is ERC721URIStorage, ZKIPFS {
  uint256 private _nextTokenId;
  constructor(address _verifierIPFS) ERC721("ZKNFT", "ZKNFT") {
    verifierIPFS = _verifierIPFS;
  }

  function mint(address to, string memory tokenURI)
    public
    returns (uint256)
  {
    uint256 tokenId = _nextTokenId++;
    _mint(to, tokenId);
    _setTokenURI(tokenId, tokenURI);

    return tokenId;
  }
  
  function _verify (uint tokenId, uint[] memory path, uint[] memory zkp) private view returns (uint[] memory) {
    return validateQuery(tokenURI(tokenId), path, zkp);
  }

  function qString (uint tokenId, uint[] memory path, uint[] memory zkp) public view returns (string memory) {
    return _qString(_verify(tokenId, path, zkp));
  }
  
  function qInt (uint tokenId, uint[] memory path, uint[] memory zkp) public view returns (int) {
    return _qInt(_verify(tokenId, path, zkp));
  }

  function qFloat (uint tokenId, uint[] memory path, uint[] memory zkp) public view returns (uint[3] memory) {
    return _qFloat(_verify(tokenId, path, zkp));
  }

  function qBool (uint tokenId, uint[] memory path, uint[] memory zkp) public view returns (bool) {
    return _qBool(_verify(tokenId, path, zkp));
  }

  function qNull (uint tokenId, uint[] memory path, uint[] memory zkp) public view returns (bool) {
    return _qNull(_verify(tokenId, path, zkp));
  }  

  function qRaw (uint tokenId, uint[] memory path, uint[] memory zkp) internal view returns (uint[] memory) {
    return _qRaw(_verify(tokenId, path, zkp));
  }

  function qCustom (uint tokenId, uint[] memory path, uint[] memory path2, uint[] memory zkp) public view returns (int) {
    return getInt(path2, qRaw(tokenId, path, zkp));
  }
  
  function qCond (uint tokenId, uint[] memory path, uint[] memory cond, uint[] memory zkp) public view returns (bool) {
    return _qCond(_verify(tokenId, path, zkp), cond);
  }  
  
}
