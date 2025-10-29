"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  HederaSessionEvent, 
  HederaJsonRpcMethod,
  DAppConnector,
  HederaChainId,
  SignAndExecuteTransactionParams
} from '@hashgraph/hedera-wallet-connect';
import { AccountId, LedgerId } from '@hashgraph/sdk';

interface HederaWalletContextType {
  accountId: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (params: SignAndExecuteTransactionParams) => Promise<any>;
  network: 'testnet' | 'mainnet';
}

const HederaWalletContext = createContext<HederaWalletContextType | undefined>(undefined);

interface HederaWalletProviderProps {
  children: ReactNode;
}

export function HederaWalletProvider({ children }: HederaWalletProviderProps) {
  const [accountId, setAccountId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [dAppConnector, setDAppConnector] = useState<DAppConnector | null>(null);
  const network = (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') as 'testnet' | 'mainnet';

  // Initialize DAppConnector
  useEffect(() => {
    const initConnector = async () => {
      try {
        const metadata = {
          name: 'RealmOS',
          description: 'Agentic Gaming Platform on Hedera',
          url: typeof window !== 'undefined' ? window.location.origin : 'https://hederaverse.io',
          icons: ['https://hederaverse.io/icon.png'],
        };

        const connector = new DAppConnector(
          metadata,
          LedgerId.TESTNET,
          process.env.NEXT_PUBLIC_WALLET_CONNECT_ID || '',
          Object.values(HederaJsonRpcMethod),
          [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged],
          [HederaChainId.Testnet]
        );

        await connector.init();
        setDAppConnector(connector);

        // Check for existing session
        const sessions = connector.walletConnectClient?.session.getAll();
        if (sessions && sessions.length > 0) {
          const session = sessions[0];
          const hederaAccountId = session.namespaces?.hedera?.accounts?.[0];
          if (hederaAccountId) {
            const accountIdStr = hederaAccountId.split(':')[2];
            setAccountId(accountIdStr);
            setIsConnected(true);
          }
        }
      } catch (error) {
        console.error('Failed to initialize DAppConnector:', error);
      }
    };

    initConnector();
  }, []);

  const connect = async () => {
    if (!dAppConnector) {
      console.error('DAppConnector not initialized');
      return;
    }

    try {
      setIsConnecting(true);
      
      // Open connection modal
      await dAppConnector.openModal();

      // Wait for session to be established
      const checkSession = setInterval(() => {
        const sessions = dAppConnector.walletConnectClient?.session.getAll();
        if (sessions && sessions.length > 0) {
          clearInterval(checkSession);
          const session = sessions[0];
          const hederaAccountId = session.namespaces?.hedera?.accounts?.[0];
          if (hederaAccountId) {
            const accountIdStr = hederaAccountId.split(':')[2];
            setAccountId(accountIdStr);
            setIsConnected(true);
            setIsConnecting(false);

            // Save to localStorage
            if (typeof window !== 'undefined') {
              localStorage.setItem('hedera_account_id', accountIdStr);
            }
          }
        }
      }, 500);

      // Timeout after 30 seconds
      setTimeout(() => {
        clearInterval(checkSession);
        setIsConnecting(false);
      }, 30000);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    if (!dAppConnector) return;

    try {
      await dAppConnector.disconnectAll();
      setAccountId(null);
      setIsConnected(false);

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hedera_account_id');
      }
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    }
  };

  const signTransaction = async (params: SignAndExecuteTransactionParams) => {
    if (!dAppConnector || !isConnected) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await dAppConnector.signAndExecuteTransaction(params);
      return result;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  };

  const value: HederaWalletContextType = {
    accountId,
    isConnected,
    isConnecting,
    connect,
    disconnect,
    signTransaction,
    network,
  };

  return (
    <HederaWalletContext.Provider value={value}>
      {children}
    </HederaWalletContext.Provider>
  );
}

export function useHederaWallet() {
  const context = useContext(HederaWalletContext);
  if (context === undefined) {
    throw new Error('useHederaWallet must be used within a HederaWalletProvider');
  }
  return context;
}
