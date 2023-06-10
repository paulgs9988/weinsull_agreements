// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

//import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

contract PaymentEscrow {
    uint256 public contractBalance;

    uint256 public agreementCounter;
    address private linkEthPriceFeed;
    address private ethUsdPriceFeed;
    address private linkUsdPriceFeed;

    struct Escrow {
        uint256 agreementID;
        address payable wagie;
        address payable bigMoney;
        address tokenAddress;
        uint256 amount;
        uint256 securityDepositAmount;
        uint256 totalDepositValueWei;
    }

    struct Payment {
        uint256 agreementID;
        uint256 numberOfPayments;
        uint256 premiumRate;
        uint256 securityDepositRate;
        uint256 paymentAmount;
        uint256 paymentPeriods;
        uint256 gracePeriod;
        uint256 paymentsMade;
        uint256 nextPaymentDue;
        bool delinquent;
    }

    mapping(uint256 => Escrow) public escrows;
    mapping(uint256 => Payment) public payments;

    constructor() {
        linkEthPriceFeed = 0x42585eD362B3f1BCa95c640FdFf35Ef899212734;
        linkUsdPriceFeed = 0xc59E3633BAAC79493d908e63626716e204A45EdF;
        ethUsdPriceFeed = 0x694AA1769357215DE4FAC081bf1f309aDC325306;
    }

    function initializeEscrow(
        address payable _wagie,
        address _tokenAddress,
        uint256 _amount
    ) external {
        uint256 agreementID = agreementCounter;
        escrows[agreementID] = Escrow({
            agreementID: agreementID,
            wagie: _wagie,
            bigMoney: payable(msg.sender),
            tokenAddress: _tokenAddress,
            amount: _amount,
            securityDepositAmount: 0,
            totalDepositValueWei: 0
        });

        // Transfer the tokens to the PaymentEscrow contract
        IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);

        // Set totalDepositValueWei
        escrows[agreementID].totalDepositValueWei =
            (_amount / 1000000000000000000) *
            uint256(getLatestPrice(linkEthPriceFeed));

        agreementCounter++;
    }

    function initializePayment(
        uint256 _escrowID,
        uint256 _numberOfPayments,
        uint256 _premiumRate,
        uint256 _securityDepositRate,
        uint256 _paymentPeriod,
        uint256 _gracePeriod
    ) external {
        require(
            msg.sender == escrows[_escrowID].bigMoney,
            "Only bigMoney can call this function"
        );

        uint256 installment = escrows[_escrowID].totalDepositValueWei /
            _numberOfPayments;
        uint256 premium = (installment * _premiumRate) / 100;
        uint256 security = (installment * _securityDepositRate) / 100;
        uint256 totalPayment = installment + premium + security;

        payments[_escrowID] = Payment({
            agreementID: _escrowID,
            numberOfPayments: _numberOfPayments,
            premiumRate: _premiumRate,
            securityDepositRate: _securityDepositRate,
            paymentAmount: totalPayment,
            paymentPeriods: _paymentPeriod,
            gracePeriod: _gracePeriod,
            paymentsMade: 0,
            nextPaymentDue: block.timestamp + _paymentPeriod,
            delinquent: false
        });
    }

    receive() external payable {}

    function depositSecurity(uint256 _agreementID) external payable {
        escrows[_agreementID].securityDepositAmount += msg.value;
    }

    fallback() external payable {
        // Fallback function to receive Ether
    }

    function deposit(uint256 _ether) public payable {
        payable(address(this)).transfer(_ether);
    }

    function makePayment(uint256 _agreementID) external payable {
        require(
            msg.sender == escrows[_agreementID].wagie,
            "Only wagie can call this function"
        );
        require(
            msg.value == payments[_agreementID].paymentAmount,
            "Incorrect payment amount"
        );
        require(
            payments[_agreementID].paymentsMade <
                payments[_agreementID].numberOfPayments,
            "All Payments Made"
        );
        require(
            escrows[_agreementID].amount > 0,
            "Please contact financier regarding an issue with Token Escrow Amount."
        );

        uint256 installment = escrows[_agreementID].totalDepositValueWei /
            payments[_agreementID].numberOfPayments;
        uint256 premium = (installment * payments[_agreementID].premiumRate) /
            100;
        uint256 security = (installment *
            payments[_agreementID].securityDepositRate) / 100;
        uint256 totalPayment = installment + premium + security;

        require(msg.value == totalPayment, "there is apparently a math error");

        escrows[_agreementID].bigMoney.transfer(installment + premium);
        payable(address(this)).transfer(security);
        escrows[_agreementID].securityDepositAmount += security;
        payments[_agreementID].paymentsMade++;

        if (
            payments[_agreementID].paymentsMade ==
            payments[_agreementID].numberOfPayments
        ) {
            IERC20(escrows[_agreementID].tokenAddress).transfer(
                escrows[_agreementID].wagie,
                escrows[_agreementID].amount
            );
            escrows[_agreementID].amount = 0;
            escrows[_agreementID].wagie.transfer(
                escrows[_agreementID].securityDepositAmount
            );
            escrows[_agreementID].securityDepositAmount = 0;
        } else {
            payments[_agreementID].nextPaymentDue =
                block.timestamp +
                payments[_agreementID].paymentPeriods;
        }
    }

    function checkDelinquency(uint256 _agreementID) public {
        require(
            payments[_agreementID].paymentsMade <
                payments[_agreementID].numberOfPayments,
            "All Payments Made"
        );
        if (
            block.timestamp >
            payments[_agreementID].nextPaymentDue +
                payments[_agreementID].gracePeriod
        ) {
            payments[_agreementID].delinquent = true;
        }
    }

    function terminateAgreement(uint256 _agreementID) external {
        require(
            payments[_agreementID].paymentsMade <
                payments[_agreementID].numberOfPayments,
            "All Payments Made"
        );
        require(escrows[_agreementID].amount > 0, "Agreement is empty");
        checkDelinquency(_agreementID);
        require(
            msg.sender == escrows[_agreementID].bigMoney,
            "Only bigMoney can call this function"
        );
        require(
            payments[_agreementID].delinquent,
            "Cannot terminate a non-delinquent agreement"
        );

        IERC20(escrows[_agreementID].tokenAddress).transfer(
            escrows[_agreementID].bigMoney,
            escrows[_agreementID].amount
        );
        escrows[_agreementID].amount = 0;
        escrows[_agreementID].bigMoney.transfer(
            escrows[_agreementID].securityDepositAmount
        );
        escrows[_agreementID].securityDepositAmount = 0;
    }

    function getLatestPrice(address priceFeed) public view returns (int) {
        AggregatorV3Interface feed = AggregatorV3Interface(priceFeed);
        (, int price, , , ) = feed.latestRoundData();
        return price;
    }

    function getAgreement(
        uint256 _agreementID
    ) public returns (Escrow memory, Payment memory) {
        checkDelinquency(_agreementID);
        return (escrows[_agreementID], payments[_agreementID]);
    }
}
