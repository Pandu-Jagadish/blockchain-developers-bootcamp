// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";
// making erc20 standard token
import "./Token.sol";
contract Exchange{
    address public feeAccount;
    uint256 public feePercent;

    mapping(address => mapping(address=>uint256))public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;

    
    

    event Deposit(address token, address user,uint256 amount,uint256 balance);
    event Withdraw(address token, address user,uint256 amount,uint256 balance);
    
    // struct creates its own arbitrary datatypes like own model
    struct _Order{
        // Attributes of an order
        uint256 id;// unique identifier for order
        address user;// user who made the order
        address _tokenGet;//Address of the token they receive;
        uint256 _amountGet;// Amount they receive
        address _tokenGive;//Address of the token they give
        uint256 _amountGive;// Amount they give
        uint256 timestamp;// when the order is created
    }
    constructor(address _feeAccount,uint256 _feePercent){
        feeAccount=_feeAccount;
        feePercent=_feePercent;
    }
    //deposit tokens & withdraw tokens

    function depositToken(address _token,uint256 _amount)public{
        //transfer tokems to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        //update user balance
        tokens[_token][msg.sender]=tokens[_token][msg.sender]+_amount;

        //emit a event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token,uint256 _amount)public{
        //ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender]>=_amount);

        //transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);
        //update user balance
        tokens[_token][msg.sender]=tokens[_token][msg.sender]-_amount;

        //emit the event 
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }
    function balanceOf(address _token, address _user)public view returns(uint256){
        return tokens[_token][_user];
    }


    // make & cancel orders

    function makeOrder(address _tokenGet,uint256  _amountGet,address _tokenGive,uint256 _amountGive)public{
    //token Give (the token they want to spend)
    //token Get (the token they want to receive)
    orderCount=orderCount+1;

    orders[orderCount]=_Order(
        orderCount,
        msg.sender,
        _tokenGet,
        _amountGet,
        _tokenGive,
        _amountGive,
        block.timestamp //time stamp "epoch timming"
    );
    }
}