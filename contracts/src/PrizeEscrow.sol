// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PrizeEscrow
 * @dev Escrow contract for tournament prizes
 * Holds prize pools and distributes to winners automatically
 */
contract PrizeEscrow {
    address public owner;
    
    struct Tournament {
        uint256 tournamentId;
        address organizer;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        TournamentStatus status;
        uint256 participantCount;
        bool prizesDistributed;
    }
    
    struct Prize {
        uint256 position;
        uint256 amount;
        address winner;
        bool claimed;
    }
    
    enum TournamentStatus { UPCOMING, ACTIVE, COMPLETED, CANCELLED }
    
    mapping(uint256 => Tournament) public tournaments;
    mapping(uint256 => Prize[]) public tournamentPrizes;
    mapping(uint256 => mapping(address => bool)) public participants;
    mapping(address => uint256) public pendingWithdrawals;
    
    uint256 private tournamentCounter;
    
    event TournamentCreated(
        uint256 indexed tournamentId,
        address indexed organizer,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime
    );
    
    event TournamentStarted(uint256 indexed tournamentId);
    event TournamentCompleted(uint256 indexed tournamentId);
    event TournamentCancelled(uint256 indexed tournamentId);
    
    event ParticipantRegistered(
        uint256 indexed tournamentId,
        address indexed participant
    );
    
    event PrizeDistributed(
        uint256 indexed tournamentId,
        uint256 position,
        address indexed winner,
        uint256 amount
    );
    
    event PrizeClaimed(
        uint256 indexed tournamentId,
        address indexed winner,
        uint256 amount
    );
    
    event RefundIssued(
        uint256 indexed tournamentId,
        address indexed organizer,
        uint256 amount
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier onlyOrganizer(uint256 _tournamentId) {
        require(
            msg.sender == tournaments[_tournamentId].organizer,
            "Only organizer"
        );
        _;
    }
    
    modifier tournamentExists(uint256 _tournamentId) {
        require(_tournamentId < tournamentCounter, "Tournament does not exist");
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new tournament with prize pool
     */
    function createTournament(
        uint256 _startTime,
        uint256 _endTime
    ) external payable returns (uint256) {
        require(msg.value > 0, "Prize pool must be greater than 0");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_endTime > _startTime, "End time must be after start time");
        
        uint256 tournamentId = tournamentCounter++;
        
        tournaments[tournamentId] = Tournament({
            tournamentId: tournamentId,
            organizer: msg.sender,
            prizePool: msg.value,
            startTime: _startTime,
            endTime: _endTime,
            status: TournamentStatus.UPCOMING,
            participantCount: 0,
            prizesDistributed: false
        });
        
        emit TournamentCreated(
            tournamentId,
            msg.sender,
            msg.value,
            _startTime,
            _endTime
        );
        
        return tournamentId;
    }
    
    /**
     * @dev Add additional funds to prize pool
     */
    function addToPrizePool(uint256 _tournamentId) 
        external 
        payable 
        tournamentExists(_tournamentId) 
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(
            tournament.status == TournamentStatus.UPCOMING ||
            tournament.status == TournamentStatus.ACTIVE,
            "Tournament not active"
        );
        require(msg.value > 0, "Amount must be greater than 0");
        
        tournament.prizePool += msg.value;
    }
    
    /**
     * @dev Register participant for tournament
     */
    function registerParticipant(uint256 _tournamentId, address _participant) 
        external 
        tournamentExists(_tournamentId)
        onlyOrganizer(_tournamentId)
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(
            tournament.status == TournamentStatus.UPCOMING,
            "Registration closed"
        );
        require(!participants[_tournamentId][_participant], "Already registered");
        
        participants[_tournamentId][_participant] = true;
        tournament.participantCount++;
        
        emit ParticipantRegistered(_tournamentId, _participant);
    }
    
    /**
     * @dev Start tournament
     */
    function startTournament(uint256 _tournamentId) 
        external 
        tournamentExists(_tournamentId)
        onlyOrganizer(_tournamentId)
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.UPCOMING, "Already started");
        require(block.timestamp >= tournament.startTime, "Too early");
        
        tournament.status = TournamentStatus.ACTIVE;
        
        emit TournamentStarted(_tournamentId);
    }
    
    /**
     * @dev Set prize distribution (positions and amounts)
     */
    function setPrizeDistribution(
        uint256 _tournamentId,
        uint256[] calldata _positions,
        uint256[] calldata _amounts
    ) 
        external 
        tournamentExists(_tournamentId)
        onlyOrganizer(_tournamentId)
    {
        require(_positions.length == _amounts.length, "Length mismatch");
        
        Tournament storage tournament = tournaments[_tournamentId];
        require(
            tournament.status == TournamentStatus.UPCOMING ||
            tournament.status == TournamentStatus.ACTIVE,
            "Tournament ended"
        );
        
        uint256 totalPrizes = 0;
        for (uint256 i = 0; i < _amounts.length; i++) {
            totalPrizes += _amounts[i];
        }
        
        require(totalPrizes <= tournament.prizePool, "Exceeds prize pool");
        
        // Clear existing prizes
        delete tournamentPrizes[_tournamentId];
        
        // Set new prizes
        for (uint256 i = 0; i < _positions.length; i++) {
            tournamentPrizes[_tournamentId].push(Prize({
                position: _positions[i],
                amount: _amounts[i],
                winner: address(0),
                claimed: false
            }));
        }
    }
    
    /**
     * @dev Complete tournament and set winners
     */
    function completeTournament(
        uint256 _tournamentId,
        address[] calldata _winners
    ) 
        external 
        tournamentExists(_tournamentId)
        onlyOrganizer(_tournamentId)
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.ACTIVE, "Not active");
        require(block.timestamp >= tournament.endTime, "Not ended yet");
        
        Prize[] storage prizes = tournamentPrizes[_tournamentId];
        require(_winners.length == prizes.length, "Winners count mismatch");
        
        // Set winners
        for (uint256 i = 0; i < _winners.length; i++) {
            require(
                participants[_tournamentId][_winners[i]],
                "Winner not participant"
            );
            prizes[i].winner = _winners[i];
        }
        
        tournament.status = TournamentStatus.COMPLETED;
        
        emit TournamentCompleted(_tournamentId);
    }
    
    /**
     * @dev Distribute prizes to winners
     */
    function distributePrizes(uint256 _tournamentId) 
        external 
        tournamentExists(_tournamentId)
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.COMPLETED, "Not completed");
        require(!tournament.prizesDistributed, "Already distributed");
        
        Prize[] storage prizes = tournamentPrizes[_tournamentId];
        
        for (uint256 i = 0; i < prizes.length; i++) {
            Prize storage prize = prizes[i];
            if (prize.winner != address(0) && !prize.claimed) {
                pendingWithdrawals[prize.winner] += prize.amount;
                
                emit PrizeDistributed(
                    _tournamentId,
                    prize.position,
                    prize.winner,
                    prize.amount
                );
            }
        }
        
        tournament.prizesDistributed = true;
    }
    
    /**
     * @dev Claim prize (winner can claim directly)
     */
    function claimPrize(uint256 _tournamentId) external tournamentExists(_tournamentId) {
        Tournament storage tournament = tournaments[_tournamentId];
        require(tournament.status == TournamentStatus.COMPLETED, "Not completed");
        
        Prize[] storage prizes = tournamentPrizes[_tournamentId];
        
        uint256 totalClaim = 0;
        for (uint256 i = 0; i < prizes.length; i++) {
            Prize storage prize = prizes[i];
            if (prize.winner == msg.sender && !prize.claimed) {
                prize.claimed = true;
                totalClaim += prize.amount;
                
                emit PrizeClaimed(_tournamentId, msg.sender, prize.amount);
            }
        }
        
        require(totalClaim > 0, "No prize to claim");
        
        (bool success, ) = payable(msg.sender).call{value: totalClaim}("");
        require(success, "Transfer failed");
    }
    
    /**
     * @dev Cancel tournament and refund prize pool
     */
    function cancelTournament(uint256 _tournamentId) 
        external 
        tournamentExists(_tournamentId)
        onlyOrganizer(_tournamentId)
    {
        Tournament storage tournament = tournaments[_tournamentId];
        require(
            tournament.status == TournamentStatus.UPCOMING ||
            tournament.status == TournamentStatus.ACTIVE,
            "Cannot cancel"
        );
        
        tournament.status = TournamentStatus.CANCELLED;
        
        // Refund organizer
        uint256 refundAmount = tournament.prizePool;
        tournament.prizePool = 0;
        
        (bool success, ) = payable(tournament.organizer).call{value: refundAmount}("");
        require(success, "Refund failed");
        
        emit TournamentCancelled(_tournamentId);
        emit RefundIssued(_tournamentId, tournament.organizer, refundAmount);
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
    }
    
    /**
     * @dev Get tournament details
     */
    function getTournament(uint256 _tournamentId) 
        external 
        view 
        returns (Tournament memory) 
    {
        return tournaments[_tournamentId];
    }
    
    /**
     * @dev Get tournament prizes
     */
    function getTournamentPrizes(uint256 _tournamentId) 
        external 
        view 
        returns (Prize[] memory) 
    {
        return tournamentPrizes[_tournamentId];
    }
    
    /**
     * @dev Check if address is participant
     */
    function isParticipant(uint256 _tournamentId, address _participant) 
        external 
        view 
        returns (bool) 
    {
        return participants[_tournamentId][_participant];
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
