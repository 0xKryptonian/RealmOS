'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, UserPlus, MessageSquare, Gamepad2, Search,
  Check, X, MoreVertical, Trash2, UserMinus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Friend {
  accountId: string;
  username: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  currentGame?: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  createdAt: Date;
}

const mockFriends: Friend[] = [
  {
    accountId: '0.0.111',
    username: 'ChessMaster',
    isOnline: true,
    lastSeen: new Date(),
    currentGame: 'Chess',
  },
  {
    accountId: '0.0.222',
    username: 'TetrisKing',
    isOnline: true,
    lastSeen: new Date(),
    currentGame: 'Tetris',
  },
  {
    accountId: '0.0.333',
    username: 'SnakeChamp',
    isOnline: false,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const mockRequests: FriendRequest[] = [
  {
    id: '1',
    senderId: '0.0.444',
    senderUsername: 'NewPlayer123',
    createdAt: new Date(Date.now() - 30 * 60 * 1000),
  },
];

export default function FriendsList() {
  const [friends, setFriends] = useState(mockFriends);
  const [requests, setRequests] = useState(mockRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [addFriendInput, setAddFriendInput] = useState('');

  const handleAcceptRequest = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast.success('Friend request accepted!');
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(requests.filter(r => r.id !== requestId));
    toast.success('Friend request rejected');
  };

  const handleSendRequest = () => {
    if (!addFriendInput.trim()) return;
    toast.success(`Friend request sent to ${addFriendInput}`);
    setAddFriendInput('');
  };

  const handleRemoveFriend = (accountId: string) => {
    setFriends(friends.filter(f => f.accountId !== accountId));
    toast.success('Friend removed');
  };

  const handleMessage = (friend: Friend) => {
    toast.success(`Opening chat with ${friend.username}`);
  };

  const handleInviteToGame = (friend: Friend) => {
    toast.success(`Game invitation sent to ${friend.username}`);
  };

  const filteredFriends = friends.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const onlineFriends = filteredFriends.filter(f => f.isOnline);
  const offlineFriends = filteredFriends.filter(f => !f.isOnline);

  return (
    <div className="space-y-6">
      {/* Friend Requests */}
      {requests.length > 0 && (
        <Card className="bg-white/5 backdrop-blur-sm border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-[#98ee2c]" />
              Friend Requests ({requests.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg"
              >
                <div>
                  <div className="text-white font-semibold">{request.senderUsername}</div>
                  <div className="text-xs text-gray-400 font-mono">{request.senderId}</div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAcceptRequest(request.id)}
                    className="bg-[#98ee2c] text-black hover:bg-[#7bc922]"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectRequest(request.id)}
                    className="border-white/10 text-white hover:bg-white/5"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Add Friend */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Add Friend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={addFriendInput}
              onChange={(e) => setAddFriendInput(e.target.value)}
              placeholder="Enter account ID or username"
              className="bg-white/5 border-white/10 text-white"
              onKeyPress={(e) => e.key === 'Enter' && handleSendRequest()}
            />
            <Button
              onClick={handleSendRequest}
              className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Friends List */}
      <Card className="bg-white/5 backdrop-blur-sm border-white/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#98ee2c]" />
              Friends ({friends.length})
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search friends..."
                className="pl-9 bg-white/5 border-white/10 text-white w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Online Friends */}
          {onlineFriends.length > 0 && (
            <div className="mb-6">
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                Online ({onlineFriends.length})
              </div>
              <div className="space-y-2">
                {onlineFriends.map((friend) => (
                  <div
                    key={friend.accountId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center">
                          <span className="text-black font-bold">
                            {friend.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">{friend.username}</div>
                        {friend.currentGame && (
                          <div className="text-xs text-[#98ee2c] flex items-center gap-1">
                            <Gamepad2 className="w-3 h-3" />
                            Playing {friend.currentGame}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMessage(friend)}
                        className="border-white/10 text-white hover:bg-white/5"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleInviteToGame(friend)}
                        className="bg-[#98ee2c] text-black hover:bg-[#7bc922]"
                      >
                        <Gamepad2 className="w-4 h-4" />
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-[#1a1a1a] border-gray-800">
                          <DropdownMenuItem
                            onClick={() => handleRemoveFriend(friend.accountId)}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            <UserMinus className="w-4 h-4 mr-2" />
                            Remove Friend
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Friends */}
          {offlineFriends.length > 0 && (
            <div>
              <div className="text-sm text-gray-400 mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                Offline ({offlineFriends.length})
              </div>
              <div className="space-y-2">
                {offlineFriends.map((friend) => (
                  <div
                    key={friend.accountId}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg opacity-60 hover:opacity-100 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-400 font-bold">
                            {friend.username[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-gray-500 rounded-full border-2 border-black" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">{friend.username}</div>
                        <div className="text-xs text-gray-400">
                          Last seen {getTimeAgo(friend.lastSeen)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-400 hover:text-white"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-[#1a1a1a] border-gray-800">
                        <DropdownMenuItem
                          onClick={() => handleRemoveFriend(friend.accountId)}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                        >
                          <UserMinus className="w-4 h-4 mr-2" />
                          Remove Friend
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredFriends.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              {searchQuery ? 'No friends found' : 'No friends yet. Add some friends to get started!'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function getTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}
