// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Token {
    string public name = "Zap Token";
    string public symbol = "ZAP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    // Track balances
    mapping(address => uint256) public balanceOf;
    // Send tokens

    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        return true;
    }

    constructor() {
        totalSupply = 5000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }
}
