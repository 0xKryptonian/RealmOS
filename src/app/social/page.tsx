'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MessageSquare, Trophy, Bell } from 'lucide-react';
import { useDAppConnector } from '@/components/client-providers';
import { toast } from 'sonner';
import FriendsList from '@/components/social/FriendsList';
import CoopChallenges from '@/components/social/CoopChallenges';

export default function SocialPage() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [selectedTab, setSelectedTab] = useState('friends');
  const [friendsCount, setFriendsCount] = useState(0);
  const [messagesCount, setMessagesCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userAccountId) {
      fetchSocialStats();
    }
  }, [userAccountId]);

  const fetchSocialStats = async () => {
    try {
      setLoading(true);
      const [friendsRes, messagesRes] = await Promise.all([
        fetch(`/api/social/friends?userId=${userAccountId}&status=ACCEPTED`),
        fetch(`/api/social/messages?userId=${userAccountId}&limit=100`),
      ]);

      const friendsData = await friendsRes.json();
      const messagesData = await messagesRes.json();

      setFriendsCount(friendsData.friendships?.length || 0);
      setMessagesCount(messagesData.messages?.filter((m: any) => !m.isRead && m.receiverId === userAccountId).length || 0);
    } catch (error) {
      console.error('Error fetching social stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-full mb-6">
            <Users className="h-4 w-4 text-[#98ee2c] mr-2" />
            <span className="text-[#98ee2c] text-sm font-medium">
              Connect with Players
            </span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Social Hub
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 max-w-2xl">
            Connect with friends, join co-op challenges, and build your gaming community
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Friends</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : friendsCount}</p>
                </div>
                <Users className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Online</p>
                  <p className="text-3xl font-bold text-[#98ee2c]">{loading ? '...' : Math.floor(friendsCount * 0.3)}</p>
                </div>
                <div className="w-8 h-8 bg-green-500 rounded-full" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Messages</p>
                  <p className="text-3xl font-bold text-white">{loading ? '...' : messagesCount}</p>
                </div>
                <MessageSquare className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 backdrop-blur-sm border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Challenges</p>
                  <p className="text-3xl font-bold text-white">5</p>
                </div>
                <Trophy className="w-8 h-8 text-[#98ee2c]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-white/5 border border-white/10 mb-8">
            <TabsTrigger
              value="friends"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </TabsTrigger>
            <TabsTrigger
              value="challenges"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Co-op
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="data-[state=active]:bg-[#98ee2c]/10 data-[state=active]:text-[#98ee2c]"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="friends">
            <FriendsList />
          </TabsContent>

          <TabsContent value="messages">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-12 text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Messages Coming Soon</h3>
                <p className="text-gray-400">Direct messaging feature will be available soon!</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="challenges">
            <CoopChallenges />
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">No New Notifications</h3>
                <p className="text-gray-400">You&apos;re all caught up!</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
