'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Filter, TrendingUp, Clock, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useDAppConnector } from '@/components/client-providers';

interface NFTListing {
  id: string;
  nft: {
    id: string;
    tokenId: string;
    serialNumber: string;
    metadata: any;
    category: string;
    rarity?: string;
  };
  price: string;
  currency: string;
  status: string;
  seller: {
    id: string;
    username?: string;
    hederaAccountId?: string;
  };
  createdAt: string;
}

export default function MarketplacePage() {
  const { userAccountId } = useDAppConnector() ?? {};
  const [listings, setListings] = useState<NFTListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchListings();
  }, [filter, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        status: 'ACTIVE',
        ...(filter !== 'all' && { category: filter }),
        sortBy,
      });

      const response = await fetch(`/api/marketplace/list?${params}`);
      if (!response.ok) throw new Error('Failed to fetch listings');

      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (listingId: string) => {
    if (!userAccountId) {
      toast.error('Please connect your wallet');
      return;
    }

    toast.info('Purchase feature coming soon!');
    // TODO: Implement purchase flow
  };

  const filteredListings = listings.filter((listing) =>
    searchQuery === '' ||
    listing.nft.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          NFT Marketplace
        </h1>
        <p className="text-muted-foreground">
          Trade game assets, achievements, and profile NFTs
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="PROFILE">Profile NFTs</SelectItem>
            <SelectItem value="GAME_ASSET">Game Assets</SelectItem>
            <SelectItem value="ACHIEVEMENT">Achievements</SelectItem>
            <SelectItem value="PRIZE">Tournament Prizes</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full md:w-[200px]">
            <TrendingUp className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Recently Listed</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="rarity">Rarity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-48 bg-muted rounded-lg" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No listings found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new items'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="group hover:shadow-lg transition-shadow">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      {listing.nft.metadata?.image ? (
                        <img
                          src={listing.nft.metadata.image}
                          alt={listing.nft.metadata?.name || 'NFT'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                          <Tag className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      {listing.nft.rarity && (
                        <Badge className={`absolute top-2 right-2 ${getRarityColor(listing.nft.rarity)}`}>
                          {listing.nft.rarity}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold truncate">
                          {listing.nft.metadata?.name || `NFT #${listing.nft.serialNumber}`}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {listing.nft.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Price</p>
                        <p className="font-bold text-lg">
                          {listing.price} {listing.currency}
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full"
                      onClick={() => handleBuy(listing.id)}
                      disabled={!userAccountId}
                    >
                      {userAccountId ? 'Buy Now' : 'Connect Wallet'}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Trending items coming soon</h3>
          </div>
        </TabsContent>

        <TabsContent value="new">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">New listings coming soon</h3>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
