"use client";

import { useHederaWallet } from '@/contexts/HederaWalletContext';
import { Button } from '@/components/ui/button';
import { Loader2, Wallet } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function HederaConnectButton() {
  const { accountId, isConnected, isConnecting, connect, disconnect } = useHederaWallet();

  if (isConnecting) {
    return (
      <Button disabled className="bg-[#98ee2c] text-black hover:bg-[#7bc922]">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    );
  }

  if (isConnected && accountId) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="bg-[#98ee2c] text-black hover:bg-[#7bc922]">
            <Wallet className="mr-2 h-4 w-4" />
            {accountId.substring(0, 4)}...{accountId.substring(accountId.length - 4)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#202020] border-gray-700 text-white">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem className="focus:bg-[#151515] focus:text-white">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Account ID</span>
              <span className="font-mono text-sm">{accountId}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-gray-700" />
          <DropdownMenuItem 
            onClick={disconnect}
            className="focus:bg-[#151515] focus:text-white cursor-pointer"
          >
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button 
      onClick={connect}
      className="bg-[#98ee2c] text-black hover:bg-[#7bc922]"
    >
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  );
}
