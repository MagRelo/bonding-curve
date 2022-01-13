pragma solidity ^0.6.12;

import "./ContinuousToken.sol";
import '@openzeppelin/contracts/math/SafeMath.sol';


contract PriorityPricing is ContinuousToken {
    using SafeMath for uint;
    uint256 internal reserve;

    mapping(address => uint) public userLockedBalance;
  
    // "mlovan", "$mlovan", 10000 ether, 300000
    constructor(string memory _name,
        string memory _symbol,
        uint _initialSupply,
        uint32 _reserveRatio) public payable ContinuousToken(_name,
        _symbol,
        _initialSupply,
         _reserveRatio) {
        reserve = msg.value;
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].add(msg.value);
    }

    fallback() external payable { mint(); }

    receive() external payable {}

    function mint() public payable {
        uint purchaseAmount = msg.value;
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].add(msg.value);
        _continuousMint(purchaseAmount);
        reserve = reserve.add(purchaseAmount);
    }

    function burn(uint _amount) public {
        address ownerAddress = owner();
        uint refundAmount = _continuousBurn(_amount, ownerAddress);
        userLockedBalance[msg.sender] = userLockedBalance[msg.sender].sub(refundAmount);
        reserve = reserve.sub(refundAmount);
        msg.sender.transfer(refundAmount);
    }

    function reserveBalance() override public view returns (uint) {
        return reserve;
    }    
}