pragma solidity ^0.8.0;

import "./Raffle.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract RaffleFactory {

    IERC20 public immutable LINKToken;
    uint256 public immutable ChainlinkFee;
    bytes32 public immutable ChainlinkKeyHash;
    address public immutable ChainlinkLINKToken;
    address public immutable ChainlinkVRFCoordinator;

    event RaffleCreated(
        address indexed waffle,
        address indexed owner,
        address indexed nftContract,
        uint256 nftID,
        uint256 slotPrice,
        uint256 numSlotsAvailable
    );

    constructor(
        uint256 _ChainlinkFee,
        bytes32 _ChainlinkKeyHash,
        address _ChainlinkLinkToken,
        address _ChainlinkVRFCoordinator
    ) {
        ChainlinkFee = _ChainlinkFee;
        ChainlinkKeyHash = _ChainlinkKeyHash;
        LINKToken = IERC20(_ChainlinkLinkToken);
        ChainlinkLINKToken = _ChainlinkLinkToken;
        ChainlinkVRFCoordinator = _ChainlinkVRFCoordinator;
    }

    function createRaffle(
        address _nftContract,
        uint256 _nftID,
        uint256 _slotPrice,
        uint256 _numSlotsAvailable
    ) external {
        require(_slotPrice > 0, "Price per slot must be above 0.");
        require(_numSlotsAvailable > 0, "Number of available slots must be above 0.");
        require(LINKToken.allowance(msg.sender, address(this)) >= ChainlinkFee, "Insufficient LINK allowance.");
        require(LINKToken.balanceOf(msg.sender) >= ChainlinkFee, "Insufficient LINK.");

        Raffle raffle = new Raffle(
            msg.sender,
            _nftContract,
            ChainlinkVRFCoordinator,
            ChainlinkLINKToken,
            ChainlinkKeyHash,
            ChainlinkFee,
            _nftID,
            _slotPrice,
            _numSlotsAvailable
        );

        LINKToken.transferFrom(msg.sender, address(raffle), ChainlinkFee);

        emit RaffleCreated(address(raffle), msg.sender, _nftContract, _nftID, _slotPrice, _numSlotsAvailable);
    }
}
