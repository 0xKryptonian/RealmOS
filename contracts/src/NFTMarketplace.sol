// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NFTMarketplace
 * @dev Decentralized NFT marketplace for RealmOS
 * Supports fixed-price sales, auctions, and offers
 */
contract NFTMarketplace {
    // State variables
    address public owner;
    uint256 public platformFeePercentage = 250; // 2.5% (basis points)
    uint256 public constant PERCENTAGE_BASE = 10000;
    
    uint256 private listingCounter;
    uint256 private offerCounter;
    
    // Structs
    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        address paymentToken; // address(0) for HBAR
        ListingType listingType;
        ListingStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        uint256 royaltyPercentage; // basis points
        address royaltyRecipient;
    }
    
    struct Offer {
        uint256 offerId;
        uint256 listingId;
        address buyer;
        uint256 offerPrice;
        uint256 createdAt;
        uint256 expiresAt;
        OfferStatus status;
    }
    
    struct AuctionBid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
    }
    
    enum ListingType { FIXED_PRICE, AUCTION }
    enum ListingStatus { ACTIVE, SOLD, CANCELLED, EXPIRED }
    enum OfferStatus { PENDING, ACCEPTED, REJECTED, CANCELLED }
    
    // Mappings
    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Offer) public offers;
    mapping(uint256 => AuctionBid[]) public auctionBids;
    mapping(address => uint256[]) public userListings;
    mapping(address => uint256) public pendingWithdrawals;
    
    // Events
    event ListingCreated(
        uint256 indexed listingId,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price,
        ListingType listingType
    );
    
    event ListingSold(
        uint256 indexed listingId,
        address indexed seller,
        address indexed buyer,
        uint256 price
    );
    
    event ListingCancelled(uint256 indexed listingId);
    
    event OfferCreated(
        uint256 indexed offerId,
        uint256 indexed listingId,
        address indexed buyer,
        uint256 offerPrice
    );
    
    event OfferAccepted(uint256 indexed offerId, uint256 indexed listingId);
    event OfferRejected(uint256 indexed offerId);
    
    event BidPlaced(
        uint256 indexed listingId,
        address indexed bidder,
        uint256 amount
    );
    
    event PlatformFeeUpdated(uint256 newFee);
    event WithdrawalProcessed(address indexed user, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier listingExists(uint256 _listingId) {
        require(_listingId < listingCounter, "Listing does not exist");
        _;
    }
    
    modifier listingActive(uint256 _listingId) {
        require(listings[_listingId].status == ListingStatus.ACTIVE, "Listing not active");
        require(
            listings[_listingId].expiresAt == 0 || 
            block.timestamp < listings[_listingId].expiresAt,
            "Listing expired"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new NFT listing
     */
    function createListing(
        address _nftContract,
        uint256 _tokenId,
        uint256 _price,
        address _paymentToken,
        ListingType _listingType,
        uint256 _expiresAt,
        uint256 _royaltyPercentage,
        address _royaltyRecipient
    ) external returns (uint256) {
        require(_price > 0, "Price must be greater than 0");
        require(_royaltyPercentage <= 1000, "Royalty too high"); // Max 10%
        
        uint256 listingId = listingCounter++;
        
        listings[listingId] = Listing({
            listingId: listingId,
            seller: msg.sender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            price: _price,
            paymentToken: _paymentToken,
            listingType: _listingType,
            status: ListingStatus.ACTIVE,
            createdAt: block.timestamp,
            expiresAt: _expiresAt,
            royaltyPercentage: _royaltyPercentage,
            royaltyRecipient: _royaltyRecipient
        });
        
        userListings[msg.sender].push(listingId);
        
        emit ListingCreated(
            listingId,
            msg.sender,
            _nftContract,
            _tokenId,
            _price,
            _listingType
        );
        
        return listingId;
    }
    
    /**
     * @dev Purchase NFT at fixed price
     */
    function purchaseNFT(uint256 _listingId) 
        external 
        payable 
        listingExists(_listingId) 
        listingActive(_listingId) 
    {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.FIXED_PRICE, "Not fixed price");
        require(msg.sender != listing.seller, "Cannot buy own listing");
        
        uint256 price = listing.price;
        
        if (listing.paymentToken == address(0)) {
            require(msg.value >= price, "Insufficient payment");
        }
        
        // Calculate fees
        uint256 platformFee = (price * platformFeePercentage) / PERCENTAGE_BASE;
        uint256 royaltyFee = 0;
        
        if (listing.royaltyRecipient != address(0)) {
            royaltyFee = (price * listing.royaltyPercentage) / PERCENTAGE_BASE;
        }
        
        uint256 sellerProceeds = price - platformFee - royaltyFee;
        
        // Update listing status
        listing.status = ListingStatus.SOLD;
        
        // Distribute funds
        pendingWithdrawals[owner] += platformFee;
        
        if (royaltyFee > 0) {
            pendingWithdrawals[listing.royaltyRecipient] += royaltyFee;
        }
        
        pendingWithdrawals[listing.seller] += sellerProceeds;
        
        emit ListingSold(_listingId, listing.seller, msg.sender, price);
    }
    
    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 _listingId) 
        external 
        listingExists(_listingId) 
    {
        Listing storage listing = listings[_listingId];
        require(msg.sender == listing.seller, "Not seller");
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        
        listing.status = ListingStatus.CANCELLED;
        
        emit ListingCancelled(_listingId);
    }
    
    /**
     * @dev Make an offer on a listing
     */
    function makeOffer(uint256 _listingId, uint256 _offerPrice, uint256 _expiresAt) 
        external 
        payable
        listingExists(_listingId) 
        listingActive(_listingId) 
        returns (uint256) 
    {
        require(_offerPrice > 0, "Offer must be greater than 0");
        require(msg.value >= _offerPrice, "Insufficient funds");
        
        uint256 offerId = offerCounter++;
        
        offers[offerId] = Offer({
            offerId: offerId,
            listingId: _listingId,
            buyer: msg.sender,
            offerPrice: _offerPrice,
            createdAt: block.timestamp,
            expiresAt: _expiresAt,
            status: OfferStatus.PENDING
        });
        
        emit OfferCreated(offerId, _listingId, msg.sender, _offerPrice);
        
        return offerId;
    }
    
    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        require(offer.status == OfferStatus.PENDING, "Offer not pending");
        
        Listing storage listing = listings[offer.listingId];
        require(msg.sender == listing.seller, "Not seller");
        require(listing.status == ListingStatus.ACTIVE, "Listing not active");
        
        // Calculate fees
        uint256 price = offer.offerPrice;
        uint256 platformFee = (price * platformFeePercentage) / PERCENTAGE_BASE;
        uint256 royaltyFee = 0;
        
        if (listing.royaltyRecipient != address(0)) {
            royaltyFee = (price * listing.royaltyPercentage) / PERCENTAGE_BASE;
        }
        
        uint256 sellerProceeds = price - platformFee - royaltyFee;
        
        // Update statuses
        offer.status = OfferStatus.ACCEPTED;
        listing.status = ListingStatus.SOLD;
        
        // Distribute funds
        pendingWithdrawals[owner] += platformFee;
        
        if (royaltyFee > 0) {
            pendingWithdrawals[listing.royaltyRecipient] += royaltyFee;
        }
        
        pendingWithdrawals[listing.seller] += sellerProceeds;
        
        emit OfferAccepted(_offerId, offer.listingId);
        emit ListingSold(offer.listingId, listing.seller, offer.buyer, price);
    }
    
    /**
     * @dev Reject an offer
     */
    function rejectOffer(uint256 _offerId) external {
        Offer storage offer = offers[_offerId];
        Listing storage listing = listings[offer.listingId];
        
        require(msg.sender == listing.seller, "Not seller");
        require(offer.status == OfferStatus.PENDING, "Offer not pending");
        
        offer.status = OfferStatus.REJECTED;
        
        // Refund buyer
        pendingWithdrawals[offer.buyer] += offer.offerPrice;
        
        emit OfferRejected(_offerId);
    }
    
    /**
     * @dev Place bid on auction
     */
    function placeBid(uint256 _listingId) 
        external 
        payable 
        listingExists(_listingId) 
        listingActive(_listingId) 
    {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.AUCTION, "Not auction");
        require(msg.sender != listing.seller, "Cannot bid on own auction");
        
        AuctionBid[] storage bids = auctionBids[_listingId];
        
        uint256 minBid = listing.price;
        if (bids.length > 0) {
            minBid = bids[bids.length - 1].amount + (listing.price / 20); // 5% increment
        }
        
        require(msg.value >= minBid, "Bid too low");
        
        // Refund previous bidder
        if (bids.length > 0) {
            AuctionBid memory lastBid = bids[bids.length - 1];
            pendingWithdrawals[lastBid.bidder] += lastBid.amount;
        }
        
        bids.push(AuctionBid({
            bidder: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp
        }));
        
        emit BidPlaced(_listingId, msg.sender, msg.value);
    }
    
    /**
     * @dev End auction and transfer NFT to highest bidder
     */
    function endAuction(uint256 _listingId) external listingExists(_listingId) {
        Listing storage listing = listings[_listingId];
        require(listing.listingType == ListingType.AUCTION, "Not auction");
        require(
            msg.sender == listing.seller || msg.sender == owner,
            "Not authorized"
        );
        require(
            listing.expiresAt > 0 && block.timestamp >= listing.expiresAt,
            "Auction not ended"
        );
        
        AuctionBid[] storage bids = auctionBids[_listingId];
        require(bids.length > 0, "No bids");
        
        AuctionBid memory winningBid = bids[bids.length - 1];
        
        // Calculate fees
        uint256 price = winningBid.amount;
        uint256 platformFee = (price * platformFeePercentage) / PERCENTAGE_BASE;
        uint256 royaltyFee = 0;
        
        if (listing.royaltyRecipient != address(0)) {
            royaltyFee = (price * listing.royaltyPercentage) / PERCENTAGE_BASE;
        }
        
        uint256 sellerProceeds = price - platformFee - royaltyFee;
        
        // Update status
        listing.status = ListingStatus.SOLD;
        
        // Distribute funds
        pendingWithdrawals[owner] += platformFee;
        
        if (royaltyFee > 0) {
            pendingWithdrawals[listing.royaltyRecipient] += royaltyFee;
        }
        
        pendingWithdrawals[listing.seller] += sellerProceeds;
        
        emit ListingSold(_listingId, listing.seller, winningBid.bidder, price);
    }
    
    /**
     * @dev Withdraw pending funds
     */
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");
        
        pendingWithdrawals[msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit WithdrawalProcessed(msg.sender, amount);
    }
    
    /**
     * @dev Update platform fee (owner only)
     */
    function updatePlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _newFee;
        emit PlatformFeeUpdated(_newFee);
    }
    
    /**
     * @dev Get listing details
     */
    function getListing(uint256 _listingId) 
        external 
        view 
        returns (Listing memory) 
    {
        return listings[_listingId];
    }
    
    /**
     * @dev Get user's listings
     */
    function getUserListings(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userListings[_user];
    }
    
    /**
     * @dev Get auction bids
     */
    function getAuctionBids(uint256 _listingId) 
        external 
        view 
        returns (AuctionBid[] memory) 
    {
        return auctionBids[_listingId];
    }
    
    /**
     * @dev Get pending withdrawal amount
     */
    function getPendingWithdrawal(address _user) 
        external 
        view 
        returns (uint256) 
    {
        return pendingWithdrawals[_user];
    }
}
