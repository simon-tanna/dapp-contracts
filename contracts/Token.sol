// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Token {
    string public name = "Zap Token";
    string public symbol = "ZAP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    // Track balances
    mapping(address => uint256) public balanceOf;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);

    // Send tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(_to != address(0), "ERC20: transfer to the zero address");
        require(
            balanceOf[msg.sender] >= _value,
            "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
        );
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    constructor() {
        totalSupply = 5000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }
}
