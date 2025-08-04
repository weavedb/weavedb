// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

import "zkjson/contracts/NORollup.sol";

interface VerifierDB {
  function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[16] calldata _pubSignals) view external returns (bool);
}

contract NORU is NORollup {
  uint constant SIZE_PATH = 4;
  uint constant SIZE_VAL = 8;
  address public verifierDB;

  constructor (address _verifierDB){
    verifierDB = _verifierDB;
  }
  
  function validateQuery(uint[] memory zkp) private view returns(uint[] memory){
    verify(zkp, VerifierDB.verifyProof.selector, verifierDB);
    return _validateQuery(zkp, SIZE_PATH, SIZE_VAL);    
  }

  function qInt (uint[] memory zkp) public view returns (int) {
    uint[] memory value = validateQuery(zkp);
    return _qInt(value);
  }

  function qFloat (uint[] memory zkp) public view returns (uint[3] memory) {
    uint[] memory value = validateQuery(zkp);
    return _qFloat(value);
  }

  function qRaw (uint[] memory zkp) public view returns (uint[] memory) {
    uint[] memory value = validateQuery(zkp);
    return _qRaw(value);
  }
  
  function qString (uint[] memory zkp) public view returns (string memory) {
    uint[] memory value = validateQuery(zkp);
    return _qString(value);
  }

  function qBool (uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(zkp);
    return _qBool(value);
  }
  
  function qNull (uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(zkp);
    return _qNull(value);
  }

  function qCond (uint[] memory cond, uint[] memory zkp) public view returns (bool) {
    uint[] memory value = validateQuery(zkp);
    return _qCond(value, cond);
  }

  function qCustom (uint[] memory path, uint[] memory zkp) public view returns (int) {
    uint[] memory value = validateQuery(zkp);
    return getInt(path, value);
  }
  
}
