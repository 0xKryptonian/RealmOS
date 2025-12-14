import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HederaTokenService } from '../token';
import { HederaClient } from '../client';

// Mock Hedera SDK
vi.mock('@hashgraph/sdk', () => {
    const TokenIdMock = {
        toString: vi.fn(() => '0.0.123456'),
    };

    return {
        Client: { forTestnet: vi.fn() },
        TokenId: { fromString: vi.fn(() => TokenIdMock) },
        AccountId: { fromString: vi.fn((id) => ({ toString: () => id })) },
        TokenCreateTransaction: vi.fn(() => ({
            setTokenName: vi.fn().mockReturnThis(),
            setTokenSymbol: vi.fn().mockReturnThis(),
            setDecimals: vi.fn().mockReturnThis(),
            setInitialSupply: vi.fn().mockReturnThis(),
            setTreasuryAccountId: vi.fn().mockReturnThis(),
            setAdminKey: vi.fn().mockReturnThis(),
            setSupplyKey: vi.fn().mockReturnThis(),
            setTokenType: vi.fn().mockReturnThis(),
            setMaxTransactionFee: vi.fn().mockReturnThis(),
            setSupplyType: vi.fn().mockReturnThis(),
            setMaxSupply: vi.fn().mockReturnThis(),
            freezeWith: vi.fn().mockReturnThis(),
            execute: vi.fn().mockResolvedValue({
                getReceipt: vi.fn().mockResolvedValue({ tokenId: TokenIdMock })
            }),
        })),
        TokenMintTransaction: vi.fn(() => ({
            setTokenId: vi.fn().mockReturnThis(),
            setAmount: vi.fn().mockReturnThis(),
            freezeWith: vi.fn().mockReturnThis(),
            sign: vi.fn().mockResolvedValue({
                execute: vi.fn().mockResolvedValue({
                    getReceipt: vi.fn().mockResolvedValue({}),
                    transactionId: { toString: () => '0.0.123456@1234567890.000000000' }
                })
            }),
        })),
        TokenAssociateTransaction: vi.fn(() => ({
            setAccountId: vi.fn().mockReturnThis(),
            setTokenIds: vi.fn().mockReturnThis(),
            freezeWith: vi.fn().mockReturnThis(),
            sign: vi.fn().mockResolvedValue({
                execute: vi.fn().mockResolvedValue({
                    getReceipt: vi.fn().mockResolvedValue({})
                })
            }),
        })),
        TokenType: { FungibleCommon: 'FungibleCommon', NonFungibleUnique: 'NonFungibleUnique' },
        TokenSupplyType: { Finite: 'Finite', Infinite: 'Infinite' },
        Hbar: vi.fn(),
    };
});

// Mock HederaClient
vi.mock('../client', () => ({
    HederaClient: {
        getClient: vi.fn(),
        getOperatorId: vi.fn(() => '0.0.123'),
        getOperatorKey: vi.fn(() => 'mock-key'),
    }
}));

describe('HederaTokenService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createFungibleToken', () => {
        it('should create a fungible token successfully', async () => {
            const result = await HederaTokenService.createFungibleToken({
                name: 'Test Token',
                symbol: 'TEST',
                initialSupply: 1000
            });

            expect(result).toBeDefined();
            expect(result.toString()).toBe('0.0.123456');
            expect(HederaClient.getClient).toHaveBeenCalled();
        });
    });

    describe('mintFungibleToken', () => {
        it('should mint tokens successfully', async () => {
            const result = await HederaTokenService.mintFungibleToken({
                tokenId: {} as any, // Mock token ID
                amount: 100,
                supplyKey: {} as any // Mock key
            });

            expect(result).toBeDefined();
            expect(typeof result).toBe('string');
        });
    });
});
