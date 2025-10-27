'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tag, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { ListNFTModal } from './ListNFTModal';

interface NFT {
  id: string;
  tokenId: string;
  serialNumber: string;
  metadata: any;
  category: string;
  rarity?: string;
  owner: string;
  listings: any[];
}

interface MyNFTsTabProps {
  userAccountId?: string;
}

export function MyNFTsTab({ userAccountId }: MyNFTsTabProps) {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [showListModal, setShowListModal] = useState(false);

  useEffect(() => {
    if (userAccountId) {
      fetchMyNFTs();
    }
  }, [userAccountId]);

  const fetchMyNFTs = async () => {
    if (!userAccountId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/profile/nfts?accountId=${userAccountId}`);
      if (!response.ok) throw new Error('Failed to fetch NFTs');

      const data = await response.json();
      setNfts(data.nfts || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      toast.error('Failed to load your NFTs');
    } finally {
      setLoading(false);
    }
  };

  const handleListNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowListModal(true);
  };

  const handleCancelListing = async (listingId: string) => {
    try {
      toast.loading('Cancelling listing...', { id: 'cancel' });

      const response = await fetch('/api/marketplace/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to cancel listing');
      }

      toast.success('Listing cancelled', { id: 'cancel' });
      fetchMyNFTs();
    } catch (error: any) {
      console.error('Cancel listing error:', error);
      toast.error(error.message || 'Failed to cancel listing', { id: 'cancel' });
    }
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const isListed = (nft: NFT) => {
    return nft.listings?.some(l => l.status === 'ACTIVE');
  };

  const getActiveListing = (nft: NFT) => {
    return nft.listings?.find(l => l.status === 'ACTIVE');
  };

  if (!userAccountId) {
    return (
      <div className="text-center py-12">
        <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">Connect your wallet</h3>
        <p className="text-gray-400">Connect your wallet to view your NFTs</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse bg-white/5 border-white/10">
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
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold mb-2 text-white">No NFTs yet</h3>
        <p className="text-gray-400">
          Earn NFTs by playing games and completing achievements
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts.map((nft) => {
          const listed = isListed(nft);
          const listing = getActiveListing(nft);

          return (
            <Card key={nft.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  {nft.metadata?.image ? (
                    <img
                      src={nft.metadata.image}
                      alt={nft.metadata?.name || 'NFT'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#98ee2c]/20 to-[#7bc922]/20 flex items-center justify-center">
                      <Tag className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  {nft.rarity && (
                    <Badge className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
                    </Badge>
                  )}
                  {listed && (
                    <Badge className="absolute top-2 left-2 bg-[#98ee2c] text-black">
                      Listed
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold truncate text-white">
                      {nft.metadata?.name || `NFT #${nft.serialNumber}`}
                    </h3>
                    <p className="text-sm text-gray-400">
                      {nft.category}
                    </p>
                  </div>
                </div>

                {listed && listing && (
                  <div className="mt-4 p-2 bg-white/5 rounded">
                    <p className="text-xs text-gray-400">Listed for</p>
                    <p className="font-bold text-[#98ee2c]">
                      {listing.price} {listing.currency}
                    </p>
                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 pt-0 flex gap-2">
                {listed ? (
                  <Button
                    variant="outline"
                    className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10"
                    onClick={() => handleCancelListing(listing.id)}
                  >
                    Cancel Listing
                  </Button>
                ) : (
                  <Button
                    className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                    onClick={() => handleListNFT(nft)}
                  >
                    List for Sale
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {selectedNFT && (
        <ListNFTModal
          open={showListModal}
          onClose={() => {
            setShowListModal(false);
            setSelectedNFT(null);
          }}
          nft={selectedNFT}
          onSuccess={fetchMyNFTs}
        />
      )}
    </>
  );
}
