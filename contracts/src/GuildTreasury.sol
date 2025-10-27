// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GuildTreasury
 * @dev Multi-signature treasury for gaming guilds
 * Supports deposits, withdrawals, and guild management
 */
contract GuildTreasury {
    address public owner;
    
    struct Guild {
        uint256 guildId;
        string name;
        address founder;
        uint256 balance;
        uint256 memberCount;
        bool isActive;
        uint256 createdAt;
        uint256 requiredSignatures;
    }
    
    struct Member {
        address memberAddress;
        MemberRole role;
        uint256 joinedAt;
        uint256 contribution;
        bool isActive;
    }
    
    struct Proposal {
        uint256 proposalId;
        uint256 guildId;
        ProposalType proposalType;
        address proposer;
        address target;
        uint256 amount;
        string description;
        uint256 createdAt;
        uint256 expiresAt;
        ProposalStatus status;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }
    
    enum MemberRole { MEMBER, ADMIN, FOUNDER }
    enum ProposalType { WITHDRAWAL, ADD_MEMBER, REMOVE_MEMBER, CHANGE_ROLE }
    enum ProposalStatus { PENDING, APPROVED, REJECTED, EXECUTED, CANCELLED }
    
    mapping(uint256 => Guild) public guilds;
    mapping(uint256 => mapping(address => Member)) public guildMembers;
    mapping(uint256 => address[]) public guildMemberList;
    mapping(uint256 => Proposal) public proposals;
    mapping(address => uint256[]) public userGuilds;
    
    uint256 private guildCounter;
    uint256 private proposalCounter;
    
    event GuildCreated(
        uint256 indexed guildId,
        string name,
        address indexed founder
    );
    
    event MemberAdded(
        uint256 indexed guildId,
        address indexed member,
        MemberRole role
    );
    
    event MemberRemoved(uint256 indexed guildId, address indexed member);
    
    event DepositMade(
        uint256 indexed guildId,
        address indexed depositor,
        uint256 amount
    );
    
    event ProposalCreated(
        uint256 indexed proposalId,
        uint256 indexed guildId,
        ProposalType proposalType,
        address indexed proposer
    );
    
    event ProposalApproved(
        uint256 indexed proposalId,
        address indexed approver
    );
    
    event ProposalExecuted(uint256 indexed proposalId);
    
    event WithdrawalExecuted(
        uint256 indexed guildId,
        address indexed recipient,
        uint256 amount
    );
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    modifier guildExists(uint256 _guildId) {
        require(_guildId < guildCounter, "Guild does not exist");
        require(guilds[_guildId].isActive, "Guild not active");
        _;
    }
    
    modifier onlyGuildMember(uint256 _guildId) {
        require(
            guildMembers[_guildId][msg.sender].isActive,
            "Not guild member"
        );
        _;
    }
    
    modifier onlyGuildAdmin(uint256 _guildId) {
        Member memory member = guildMembers[_guildId][msg.sender];
        require(member.isActive, "Not guild member");
        require(
            member.role == MemberRole.ADMIN || member.role == MemberRole.FOUNDER,
            "Not admin"
        );
        _;
    }
    
    constructor() {
        owner = msg.sender;
    }
    
    /**
     * @dev Create a new guild
     */
    function createGuild(
        string calldata _name,
        uint256 _requiredSignatures
    ) external returns (uint256) {
        require(bytes(_name).length > 0, "Name required");
        require(_requiredSignatures > 0, "Invalid signature count");
        
        uint256 guildId = guildCounter++;
        
        guilds[guildId] = Guild({
            guildId: guildId,
            name: _name,
            founder: msg.sender,
            balance: 0,
            memberCount: 1,
            isActive: true,
            createdAt: block.timestamp,
            requiredSignatures: _requiredSignatures
        });
        
        // Add founder as first member
        guildMembers[guildId][msg.sender] = Member({
            memberAddress: msg.sender,
            role: MemberRole.FOUNDER,
            joinedAt: block.timestamp,
            contribution: 0,
            isActive: true
        });
        
        guildMemberList[guildId].push(msg.sender);
        userGuilds[msg.sender].push(guildId);
        
        emit GuildCreated(guildId, _name, msg.sender);
        emit MemberAdded(guildId, msg.sender, MemberRole.FOUNDER);
        
        return guildId;
    }
    
    /**
     * @dev Deposit funds to guild treasury
     */
    function deposit(uint256 _guildId) 
        external 
        payable 
        guildExists(_guildId)
        onlyGuildMember(_guildId)
    {
        require(msg.value > 0, "Amount must be greater than 0");
        
        Guild storage guild = guilds[_guildId];
        guild.balance += msg.value;
        
        Member storage member = guildMembers[_guildId][msg.sender];
        member.contribution += msg.value;
        
        emit DepositMade(_guildId, msg.sender, msg.value);
    }
    
    /**
     * @dev Create withdrawal proposal
     */
    function proposeWithdrawal(
        uint256 _guildId,
        address _recipient,
        uint256 _amount,
        string calldata _description
    ) 
        external 
        guildExists(_guildId)
        onlyGuildAdmin(_guildId)
        returns (uint256)
    {
        require(_amount > 0, "Amount must be greater than 0");
        require(_amount <= guilds[_guildId].balance, "Insufficient balance");
        
        uint256 proposalId = proposalCounter++;
        
        Proposal storage proposal = proposals[proposalId];
        proposal.proposalId = proposalId;
        proposal.guildId = _guildId;
        proposal.proposalType = ProposalType.WITHDRAWAL;
        proposal.proposer = msg.sender;
        proposal.target = _recipient;
        proposal.amount = _amount;
        proposal.description = _description;
        proposal.createdAt = block.timestamp;
        proposal.expiresAt = block.timestamp + 7 days;
        proposal.status = ProposalStatus.PENDING;
        proposal.approvalCount = 0;
        
        emit ProposalCreated(
            proposalId,
            _guildId,
            ProposalType.WITHDRAWAL,
            msg.sender
        );
        
        return proposalId;
    }
    
    /**
     * @dev Approve a proposal
     */
    function approveProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.PENDING, "Not pending");
        require(block.timestamp < proposal.expiresAt, "Proposal expired");
        
        uint256 guildId = proposal.guildId;
        Member memory member = guildMembers[guildId][msg.sender];
        
        require(member.isActive, "Not guild member");
        require(
            member.role == MemberRole.ADMIN || member.role == MemberRole.FOUNDER,
            "Not admin"
        );
        require(!proposal.approvals[msg.sender], "Already approved");
        
        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        
        emit ProposalApproved(_proposalId, msg.sender);
        
        // Auto-execute if enough approvals
        if (proposal.approvalCount >= guilds[guildId].requiredSignatures) {
            executeProposal(_proposalId);
        }
    }
    
    /**
     * @dev Execute approved proposal
     */
    function executeProposal(uint256 _proposalId) public {
        Proposal storage proposal = proposals[_proposalId];
        require(proposal.status == ProposalStatus.PENDING, "Not pending");
        
        uint256 guildId = proposal.guildId;
        Guild storage guild = guilds[guildId];
        
        require(
            proposal.approvalCount >= guild.requiredSignatures,
            "Not enough approvals"
        );
        
        proposal.status = ProposalStatus.EXECUTED;
        
        if (proposal.proposalType == ProposalType.WITHDRAWAL) {
            require(guild.balance >= proposal.amount, "Insufficient balance");
            
            guild.balance -= proposal.amount;
            
            (bool success, ) = payable(proposal.target).call{value: proposal.amount}("");
            require(success, "Transfer failed");
            
            emit WithdrawalExecuted(guildId, proposal.target, proposal.amount);
        }
        
        emit ProposalExecuted(_proposalId);
    }
    
    /**
     * @dev Add member to guild
     */
    function addMember(
        uint256 _guildId,
        address _member,
        MemberRole _role
    ) 
        external 
        guildExists(_guildId)
        onlyGuildAdmin(_guildId)
    {
        require(!guildMembers[_guildId][_member].isActive, "Already member");
        
        guildMembers[_guildId][_member] = Member({
            memberAddress: _member,
            role: _role,
            joinedAt: block.timestamp,
            contribution: 0,
            isActive: true
        });
        
        guildMemberList[_guildId].push(_member);
        userGuilds[_member].push(_guildId);
        
        guilds[_guildId].memberCount++;
        
        emit MemberAdded(_guildId, _member, _role);
    }
    
    /**
     * @dev Remove member from guild
     */
    function removeMember(uint256 _guildId, address _member) 
        external 
        guildExists(_guildId)
        onlyGuildAdmin(_guildId)
    {
        Member storage member = guildMembers[_guildId][_member];
        require(member.isActive, "Not active member");
        require(member.role != MemberRole.FOUNDER, "Cannot remove founder");
        
        member.isActive = false;
        guilds[_guildId].memberCount--;
        
        emit MemberRemoved(_guildId, _member);
    }
    
    /**
     * @dev Get guild details
     */
    function getGuild(uint256 _guildId) 
        external 
        view 
        returns (Guild memory) 
    {
        return guilds[_guildId];
    }
    
    /**
     * @dev Get guild members
     */
    function getGuildMembers(uint256 _guildId) 
        external 
        view 
        returns (address[] memory) 
    {
        return guildMemberList[_guildId];
    }
    
    /**
     * @dev Get member details
     */
    function getMember(uint256 _guildId, address _member) 
        external 
        view 
        returns (Member memory) 
    {
        return guildMembers[_guildId][_member];
    }
    
    /**
     * @dev Get user's guilds
     */
    function getUserGuilds(address _user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userGuilds[_user];
    }
    
    /**
     * @dev Check if proposal is approved by address
     */
    function hasApproved(uint256 _proposalId, address _approver) 
        external 
        view 
        returns (bool) 
    {
        return proposals[_proposalId].approvals[_approver];
    }
}
