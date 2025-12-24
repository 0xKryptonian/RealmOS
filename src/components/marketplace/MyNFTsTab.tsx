'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Badge } from '../ui/badge';
import { Tag } from 'lucide-react';
import { toast } from 'sonner';
import { ListNFTModal } from './ListNFTModal';
import { PROFILE_NFT, GAME_NFT, ACHIEVEMENT_NFT, HEDERA_NETWORK } from '@/lib/constants';

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

  const mirrorBaseUrl = useMemo(() => {
    const urls = {
      mainnet: 'https://mainnet-public.mirrornode.hedera.com/api/v1',
      testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
    } as const;
    const net = (HEDERA_NETWORK as unknown as keyof typeof urls) || 'testnet';
    return urls[net] || urls.testnet;
  }, []);

  const fetchMyNFTs = useCallback(async () => {
    if (!userAccountId) return;
    setLoading(true);
    try {
      const tokenIds = [PROFILE_NFT, GAME_NFT, ACHIEVEMENT_NFT];

      // Fetch NFTs for each collection concurrently
      const results = await Promise.all(
        tokenIds.map(async (tokenId) => {
          const url = `${mirrorBaseUrl}/accounts/${userAccountId}/nfts?limit=100&order=desc&token.id=${tokenId}`;
          const res = await fetch(url, { cache: 'no-store' });
          if (!res.ok) return [] as any[];
          const data = await res.json();
          return (data.nfts || []).map((n: any) => ({ ...n, _collectionTokenId: tokenId }));
        })
      );

      const flat: any[] = results.flat();

      // Optionally fetch per-NFT metadata (may be base64/hex encoded). We try to fetch individual NFT to get metadata if missing.
      const enriched: NFT[] = await Promise.all(
        flat.map(async (nft) => {
          let meta: any = undefined;
          if (!nft.metadata) {
            try {
              const infoRes = await fetch(`${mirrorBaseUrl}/tokens/${nft.token_id}/nfts/${nft.serial_number}`, { cache: 'no-store' });
              if (infoRes.ok) {
                const info = await infoRes.json();
                const decoded = decodeNFTMetadata(info.metadata);
                meta = await resolveIpfsMetadata(decoded);
              }
            } catch { }
          } else {
            const decoded = decodeNFTMetadata(nft.metadata);
            meta = await resolveIpfsMetadata(decoded);
          }

          return {
            id: `${nft.token_id}-${nft.serial_number}`,
            tokenId: nft.token_id,
            serialNumber: String(nft.serial_number),
            metadata: meta || {},
            category: mapCollectionToCategory(nft._collectionTokenId),
            owner: nft.account_id,
            listings: [],
          } as NFT;
        })
      );

      setNfts(enriched);
    } catch (error) {
      console.error('Error fetching NFTs from Mirror Node:', error);
      toast.error('Failed to load your NFTs');
    } finally {
      setLoading(false);
    }
  }, [userAccountId, mirrorBaseUrl]);

  useEffect(() => {
    if (userAccountId) {
      fetchMyNFTs();
    }
  }, [userAccountId, fetchMyNFTs]);



  function decodeNFTMetadata(raw?: string): any {
    if (!raw) return undefined;
    try {
      let decoded: string;
      if (raw.startsWith('\\x')) {
        // hex -> utf8
        const hex = raw.slice(2);
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
        decoded = new TextDecoder().decode(bytes);
      } else {
        // base64 -> utf8
        const binary = typeof atob !== 'undefined' ? atob(raw) : '';
        const bytes = new Uint8Array(binary.split('').map((c) => c.charCodeAt(0)));
        decoded = new TextDecoder().decode(bytes);
      }
      try {
        return JSON.parse(decoded);
      } catch {
        // Not JSON. Could be a plain ipfs:// pointer.
        return decoded;
      }
    } catch {
      return undefined;
    }
  }

  async function resolveIpfsMetadata(meta: any): Promise<any> {
    try {
      if (typeof meta === 'string' && meta.startsWith('ipfs://')) {
        const url = `https://ipfs.io/ipfs/${meta.slice(7)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          return json;
        }
        return { image: meta };
      }
      return meta;
    } catch {
      return meta;
    }
  }

  function mapCollectionToCategory(tokenId: string): string {
    switch (tokenId) {
      case PROFILE_NFT: return 'PROFILE';
      case GAME_NFT: return 'GAME_ASSET';
      case ACHIEVEMENT_NFT: return 'ACHIEVEMENT';
      default: return 'NFT';
    }
  }

  const handleListNFT = (nft: NFT) => {
    setSelectedNFT(nft);
    setShowListModal(true);
  };

  // No cancel listing in UI until we wire on-chain cancel flow

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  // On-chain only: we don't infer/track listing status here

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
          return (
            <Card key={nft.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
              <CardHeader className="p-0">
                <div className="relative aspect-square overflow-hidden rounded-t-lg">
                  <img
                    src={getImageFromMetadata(nft.metadata)}
                    alt={nft.metadata?.name || 'NFT'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {nft.rarity && (
                    <Badge className={`absolute top-2 right-2 ${getRarityColor(nft.rarity)}`}>
                      {nft.rarity}
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
              </CardContent>

              <CardFooter className="p-4 pt-0 flex gap-2">
                <Button
                  className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
                  onClick={() => handleListNFT(nft)}
                >
                  List for Sale
                </Button>
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

function normalizeImageUrl(src?: string): string {
  if (!src || src.trim() === '') return '/nft/minigame.png';
  if (src.startsWith('hfs:')) return '/nft/minigame.png';
  if (src.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${src.slice(7)}`;
  return src;
}

function getImageFromMetadata(meta: any): string {
  if (!meta) return '/nft/minigame.png';
  // After resolveIpfsMetadata, meta should be the actual JSON. If it is still a string, treat it as direct image
  const candidate = typeof meta === 'string'
    ? meta
    : meta.image || meta.image_url || meta.imageURI || meta.imageUri;
  return normalizeImageUrl(candidate);
}
