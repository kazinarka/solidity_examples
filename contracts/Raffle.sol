pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract Raffle is VRFConsumerBase, IERC721Receiver {

    bytes32 internal immutable keyHash;
    uint256 internal immutable fee;
    address public immutable owner;
    uint256 public immutable slotPrice;
    uint256 public immutable numSlotsAvailable;
    address public immutable nftContract;
    uint256 public immutable nftID;

    uint256 public randomResult = 0;
    bool public randomResultRequested = false;
    uint256 public numSlotsFilled = 0;
    address[] public slotOwners;
    mapping(address => uint256) public addressToSlotsOwned;
    bool public nftOwned = false;

    event SlotsClaimed(address indexed claimee, uint256 numClaimed);
    event SlotsRefunded(address indexed refunder, uint256 numRefunded);
    event RaffleWon(address indexed winner);

    constructor(
        address _owner,
        address _nftContract,
        address _ChainlinkVRFCoordinator,
        address _ChainlinkLINKToken,
        bytes32 _ChainlinkKeyHash,
        uint256 _ChainlinkFee,
        uint256 _nftID,
        uint256 _slotPrice,
        uint256 _numSlotsAvailable
    ) VRFConsumerBase(
        _ChainlinkVRFCoordinator,
        _ChainlinkLINKToken
    ) {
        owner = _owner;
        keyHash = _ChainlinkKeyHash;
        fee = _ChainlinkFee;
        nftContract = _nftContract;
        nftID = _nftID;
        slotPrice = _slotPrice;
        numSlotsAvailable = _numSlotsAvailable;
    }

    function purchaseSlot(uint256 _numSlots) payable external {
        require(_numSlots > 0, "Cannot purchase 0 slots.");
        require(nftOwned == true, "Contract does not own raffleable NFT.");
        require(numSlotsFilled < numSlotsAvailable, "All raffle slots are filled.");
        require(randomResultRequested == false, "Cannot purchase slot after winner has been chosen.");
        require(msg.value == _numSlots * slotPrice, "Insufficient ETH provided to purchase slots.");
        require(_numSlots <= numSlotsAvailable - numSlotsFilled, "Requesting to purchase too many slots.");

        for (uint256 i = 0; i < _numSlots; i++) {
            slotOwners.push(msg.sender);
        }

        numSlotsFilled = numSlotsFilled + _numSlots;
        addressToSlotsOwned[msg.sender] = addressToSlotsOwned[msg.sender] + _numSlots;

        emit SlotsClaimed(msg.sender, _numSlots);
    }

    function refundSlot(uint256 _numSlots) external {
        require(nftOwned == true, "Contract does not own raffleable NFT.");
        require(randomResultRequested == false, "Cannot refund slot after winner has been chosen.");
        require(addressToSlotsOwned[msg.sender] >= _numSlots, "Address does not own number of requested slots.");

        uint256 idx = 0;
        uint256 numToDelete = _numSlots;

        while (idx < slotOwners.length && numToDelete > 0) {
            if (slotOwners[idx] != msg.sender) {
                idx++;
            } else {
                slotOwners[idx] = slotOwners[slotOwners.length - 1];
                slotOwners.pop();
                numToDelete--;
            }
        }

        payable(msg.sender).transfer(_numSlots * slotPrice);
        numSlotsFilled = numSlotsFilled - _numSlots;
        addressToSlotsOwned[msg.sender] = addressToSlotsOwned[msg.sender] - _numSlots;

        emit SlotsRefunded(msg.sender, _numSlots);
    }

    function collectRandomWinner() external returns (bytes32 requestId) {
        require(numSlotsFilled > 0, "No slots are filled");
        require(nftOwned == true, "Contract does not own raffleable NFT.");
        require(msg.sender == owner, "Only owner can call winner collection.");
        require(randomResultRequested == false, "Cannot collect winner twice.");

        randomResultRequested = true;

        return requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        randomResult = randomness;
    }

    function disburseWinner() external {
        require(nftOwned == true, "Cannot disurbse NFT to winner without holding NFT.");
        require(randomResultRequested == true, "Cannot disburse to winner without having collected one.");
        require(randomResult != 0, "Please wait for Chainlink VRF to update the winner first.");

        payable(owner).transfer(address(this).balance);

        address winner = slotOwners[randomResult % numSlotsFilled];

        IERC721(nftContract).safeTransferFrom(address(this), winner, nftID);

        nftOwned = false;

        emit RaffleWon(winner);
    }

    function deleteRaffle() external {
        require(msg.sender == owner, "Only owner can delete raffle.");
        require(nftOwned == true, "Cannot cancel raffle without raffleable NFT.");
        require(randomResultRequested == false, "Cannot delete raffle after collecting winner.");

        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, nftID);

        nftOwned = false;

        for (uint256 i = numSlotsFilled - 1; i >= 0; i--) {
            payable(slotOwners[i]).transfer(slotPrice);
            slotOwners.pop();
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        require(from == nftContract, "Raffle not initiated with this NFT contract.");
        require(tokenId == nftID, "Raffle not initiated with this NFT ID.");

        nftOwned = true;

        return 0x150b7a02;
    }
}
