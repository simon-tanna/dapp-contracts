// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Token {
    string public name = "Zap Token";
    string public symbol = "ZAP";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    // Track balances
    mapping(address => uint256) public balanceOf;
    // First address the one that approves the second address to spend the tokens on its behalf. It records the allowance.
    mapping(address => mapping(address => uint256)) public allowance;

    // Events
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    // Send tokens
    function transfer(address _to, uint256 _value) public returns (bool success) {
        require(
            balanceOf[msg.sender] >= _value,
            "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
        );
        _transfer(msg.sender, _to, _value);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _value) internal {
        require(_to != address(0), "ERC20: transfer to the zero address");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(_from, _to, _value);
    }

    function approve(address _spender, uint256 _value) public returns (bool success) {
        require(_spender != address(0), "ERC20: approve to the zero address");
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require(
            _value <= balanceOf[_from],
            "VM Exception while processing transaction: revert ERC20: transfer amount exceeds balance"
        );
        require(
            _value <= allowance[_from][msg.sender],
            "VM Exception while processing transaction: revert ERC20: transfer amount exceeds allowance"
        );
        allowance[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);
        return true;
    }

    constructor() {
        totalSupply = 5000000 * (10 ** decimals);
        balanceOf[msg.sender] = totalSupply;
    }
}
