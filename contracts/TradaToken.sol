pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20.sol";

contract TradaToken is ERC20 {
    string name = "Trada Coupon";
    string symbol = "TDC";
    uint decimals = 18;

    address admin;

    constructor() public {
        admin = msg.sender;
        _mint(msg.sender, 10000000000000000000000000);
    }

    function mint(uint value) public {
        require(msg.sender == admin);
        _mint(admin, value);
    }
}