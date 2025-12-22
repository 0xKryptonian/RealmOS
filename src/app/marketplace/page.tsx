'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, Filter, TrendingUp, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { useDAppConnector } from '../../components/client-providers';
import { MyNFTsTab } from '../../components/marketplace/MyNFTsTab';
import { ContractExecuteTransaction, ContractFunctionParameters, ContractId, Hbar, AccountId } from '@hashgraph/sdk';
import { NFT_MARKETPLACE, HEDERA_NETWORK, PROFILE_NFT, GAME_NFT, ACHIEVEMENT_NFT } from '@/lib/constants';

type Hex = string;
type ListingType = 0 | 1; // 0 = FIXED_PRICE, 1 = AUCTION

interface OnchainListing {
  id: string; // listingId as string
  listingId: number;
  seller: Hex; // evm address
  nftContract: Hex; // token evm address
  tokenSerial: number;
  priceTinybar: bigint;
  listingType: ListingType;
  createdAt?: number;
  status: 'ACTIVE' | 'SOLD' | 'CANCELLED';
  nft: {
    id: string;
    tokenId: string; // Mirror Node accepts evm address too
    serialNumber: string;
    metadata: any;
    category: string;
    rarity?: string;
  };
}

export default function MarketplacePage() {
  const dapp = useDAppConnector() ?? {} as any;
  const { userAccountId, dAppConnector } = dapp;
  const [listings, setListings] = useState<OnchainListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [searchQuery, setSearchQuery] = useState('');

  const mirrorBaseUrl = useMemo(() => {
    const urls = {
      mainnet: 'https://mainnet-public.mirrornode.hedera.com/api/v1',
      testnet: 'https://testnet.mirrornode.hedera.com/api/v1',
    } as const;
    const net = (HEDERA_NETWORK as unknown as keyof typeof urls) || 'testnet';
    return urls[net] || urls.testnet;
  }, []);

  useEffect(() => {
    fetchListings();
  }, [filter, sortBy]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      // 0) Resolve contract identifier to evm_address if available
      let contractKey: string = NFT_MARKETPLACE;
      try {
        const cRes = await fetch(`${mirrorBaseUrl}/contracts/${NFT_MARKETPLACE}`, { cache: 'no-store' });
        if (cRes.ok) {
          const cJson = await cRes.json();
          if (cJson?.evm_address) contractKey = cJson.evm_address;
        }
      } catch { }

      // 1) Pull recent logs for the marketplace contract
      const logsRes = await fetch(`${mirrorBaseUrl}/contracts/${contractKey}/results/logs?limit=500&order=desc`, { cache: 'no-store' });
      if (!logsRes.ok) throw new Error('Failed to load logs');
      const logsJson = await logsRes.json();
      const logs: any[] = logsJson.logs || [];

      // 2) Build state from events
      const created: Record<string, { seller: Hex; nft: Hex; serial: number; price: bigint; type: ListingType; ts?: number }> = {};
      const cancelled = new Set<string>();
      const sold = new Set<string>();

      for (const log of logs) {
        const topics: string[] = log.topics || [];
        const data: string = log.data || '';
        const consensusTs = log.consensus_timestamp ? Number(log.consensus_timestamp.split('.')[0]) : undefined;

        // ListingCancelled: topics length === 2, data empty
        if (topics.length === 2 && (!data || data === '0x' || data === '0x0')) {
          const listingId = hex32ToNumber(topics[1]).toString();
          if (!(listingId in created)) cancelled.add(listingId);
          continue;
        }

        // ListingSold: topics length === 4, data = price (32 bytes)
        if (topics.length === 4 && data && data.length >= 66) {
          const listingId = hex32ToNumber(topics[1]).toString();
          if (!(listingId in created)) sold.add(listingId);
          continue;
        }

        // ListingCreated: topics length === 3, data contains 4 slots
        if (topics.length === 3 && data && data.length >= 2 + 64 * 4) {
          const listingIdNum = hex32ToNumber(topics[1]);
          const seller = strip0x(topics[2]).slice(24); // last 20 bytes (40 hex chars)
          const [nftContract, tokenIdBN, priceBN, listingTypeBN] = decodeFourSlots(data);
          const serial = Number(tokenIdBN);
          const price = BigInt(priceBN.toString());
          const ltype = Number(listingTypeBN) as ListingType;
          const idStr = listingIdNum.toString();
          if (!cancelled.has(idStr) && !sold.has(idStr)) {
            created[idStr] = { seller: `0x${seller}` as Hex, nft: `0x${nftContract}` as Hex, serial, price, type: ltype, ts: consensusTs };
          }
        }
      }

      // 3) Convert to display listings and fetch metadata for each
      let list = await Promise.all(
        Object.entries(created).map(async ([id, v]) => {
          // Fetch NFT info using token evm address + serial
          const nftInfoRes = await fetch(`${mirrorBaseUrl}/tokens/${v.nft}/nfts/${v.serial}`, { cache: 'no-store' });
          let metadata: any = {};
          if (nftInfoRes.ok) {
            const info = await nftInfoRes.json();
            let decodedMeta = decodeNFTMetadata(info.metadata);
            metadata = await resolveIpfsMetadata(decodedMeta);
          }

          const tokenDetailRes = await fetch(`${mirrorBaseUrl}/tokens/${v.nft}`, { cache: 'no-store' });
          let category = 'NFT';
          if (tokenDetailRes.ok) {
            const tokenDetail = await tokenDetailRes.json();
            const entityId = tokenDetail.token_id as string | undefined;
            if (entityId) {
              if (entityId === PROFILE_NFT) category = 'PROFILE';
              else if (entityId === GAME_NFT) category = 'GAME_ASSET';
              else if (entityId === ACHIEVEMENT_NFT) category = 'ACHIEVEMENT';
            }
          }

          const priceHbar = Number(v.price) / 100_000_000;

          const listing: OnchainListing = {
            id,
            listingId: Number(id),
            seller: v.seller,
            nftContract: v.nft,
            tokenSerial: v.serial,
            priceTinybar: v.price,
            listingType: v.type,
            createdAt: v.ts,
            status: 'ACTIVE',
            nft: {
              id: `${v.nft}-${v.serial}`,
              tokenId: v.nft,
              serialNumber: String(v.serial),
              metadata,
              category,
            },
          };
          return listing;
        })
      );

      // 4) Apply filter/sort
      if (filter !== 'all') {
        list = list.filter((l) => l.nft.category === (
          filter === 'PROFILE' ? 'PROFILE' : filter === 'GAME_ASSET' ? 'GAME_ASSET' : filter === 'ACHIEVEMENT' ? 'ACHIEVEMENT' : filter
        ));
      }

      if (sortBy === 'recent') {
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      } else if (sortBy === 'price_low') {
        list.sort((a, b) => Number(a.priceTinybar - b.priceTinybar));
      } else if (sortBy === 'price_high') {
        list.sort((a, b) => Number(b.priceTinybar - a.priceTinybar));
      }

      setListings(list);
    } catch (error) {
      console.error('Error fetching listings on-chain:', error);
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

    const listing = listings.find(l => l.id === listingId);
    if (!listing) {
      toast.error('Listing not found');
      return;
    }

    try {
      toast.loading('Processing purchase on-chain...', { id: 'purchase' });

      // Execute marketplace contract purchase via wallet
      if (!dAppConnector || !dAppConnector.signers?.[0]) {
        throw new Error('Wallet connector not ready');
      }

      const signer = dAppConnector.signers[0];
      const contractIdStr = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT_ID || NFT_MARKETPLACE;
      const contractId = ContractId.fromString(contractIdStr);

      const priceNumber = Number(listing.priceTinybar) / 100_000_000;

      const execTx = await new ContractExecuteTransaction()
        .setContractId(contractId)
        .setGas(300000)
        .setPayableAmount(new Hbar(priceNumber))
        .setFunction('purchaseNFT', new ContractFunctionParameters().addUint256(Number(listingId)))
        .setNodeAccountIds([AccountId.fromString('0.0.3')])
        .freezeWithSigner(signer);

      const txBytes = Buffer.from(execTx.toBytes()).toString('base64');
      await dAppConnector.signAndExecuteTransaction({
        signerAccountId: userAccountId,
        transactionList: txBytes,
      });
      toast.success('Purchase successful!', {
        id: 'purchase',
        description: `You now own ${listing.nft.metadata?.name || 'this NFT'}`,
      });

      fetchListings();
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase', { id: 'purchase' });
    }
  };

  const filteredListings = listings.filter((listing) =>
    searchQuery === '' ||
    listing.nft.metadata?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function strip0x(h: string): string { return h.startsWith('0x') ? h.slice(2) : h; }
  function hex32ToNumber(topic: string): number { return Number(BigInt(topic)); }
  function decodeFourSlots(data: string): [string, bigint, bigint, bigint] {
    const hex = strip0x(data);
    const a = hex.slice(0, 64);
    const b = hex.slice(64, 128);
    const c = hex.slice(128, 192);
    const d = hex.slice(192, 256);
    const addr = a.slice(24); // last 20 bytes (40 hex chars)
    return [addr, BigInt('0x' + b), BigInt('0x' + c), BigInt('0x' + d)];
  }
  function decodeNFTMetadata(raw?: string): any {
    if (!raw) return {};
    try {
      let decoded: string;
      if (raw.startsWith('\\x')) {
        const hex = raw.slice(2);
        const bytes = new Uint8Array(hex.match(/.{1,2}/g)!.map((b) => parseInt(b, 16)));
        decoded = new TextDecoder().decode(bytes);
      } else {
        const binary = typeof atob !== 'undefined' ? atob(raw) : '';
        const bytes = new Uint8Array(binary.split('').map((c) => c.charCodeAt(0)));
        decoded = new TextDecoder().decode(bytes);
      }
      try { return JSON.parse(decoded); } catch { return decoded; }
    } catch { return {}; }
  }

  async function resolveIpfsMetadata(meta: any): Promise<any> {
    try {
      // If metadata itself is an ipfs pointer to a JSON file, fetch and return that JSON
      if (typeof meta === 'string' && meta.startsWith('ipfs://')) {
        const url = `https://ipfs.io/ipfs/${meta.slice(7)}`;
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          return json;
        }
        return { image: meta }; // fallback: treat it as direct image/meta pointer
      }
      return meta;
    } catch {
      return meta;
    }
  }

  function normalizeImageUrl(src?: string): string {
    if (!src || src.trim() === '') return '/nft/minigame.png';
    if (src.startsWith('hfs:')) return '/nft/minigame.png';
    if (src.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${src.slice(7)}`;
    return src;
  }

  function getImageFromMetadata(meta: any): string {
    if (!meta) return '/nft/minigame.png';
    const candidate = typeof meta === 'string'
      ? meta
      : meta.image || meta.image_url || meta.imageURI || meta.imageUri;
    return normalizeImageUrl(candidate);
  }

  const getRarityColor = (rarity?: string) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'epic': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'rare': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] bg-clip-text text-transparent">
              Marketplace
            </span>
          </h1>
          <p className="text-gray-400 text-lg">
            Trade game assets, achievements, and profile NFTs
          </p>
        </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search NFTs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500"
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
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="my-nfts">My NFTs</TabsTrigger>

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
              <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No listings found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new items'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={getImageFromMetadata(listing.nft.metadata)}
                        alt={listing.nft.metadata?.name || 'NFT'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
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
                        <h3 className="font-semibold truncate text-white">
                          {listing.nft.metadata?.name || `NFT #${listing.nft.serialNumber}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {listing.nft.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-bold text-lg text-[#98ee2c]">
                          {(Number(listing.priceTinybar) / 100_000_000).toFixed(2)} HBAR
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
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

        <TabsContent value="my-nfts" className="mt-6">
          <MyNFTsTab userAccountId={userAccountId || undefined} />
        </TabsContent>

        <TabsContent value="trending" className="mt-6">
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
              <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No listings found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new items'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={getImageFromMetadata(listing.nft.metadata)}
                        alt={listing.nft.metadata?.name || 'NFT'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
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
                        <h3 className="font-semibold truncate text-white">
                          {listing.nft.metadata?.name || `NFT #${listing.nft.serialNumber}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {listing.nft.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-bold text-lg text-[#98ee2c]">
                          {(Number(listing.priceTinybar) / 100_000_000).toFixed(2)} HBAR
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
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

        <TabsContent value="new" className="mt-6">
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
              <Tag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2 text-white">No listings found</h3>
              <p className="text-gray-400">
                {searchQuery ? 'Try adjusting your search' : 'Check back later for new items'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredListings.map((listing) => (
                <Card key={listing.id} className="bg-white/5 backdrop-blur-sm border-white/10 group hover:border-[#98ee2c]/30 transition-all">
                  <CardHeader className="p-0">
                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                      <img
                        src={getImageFromMetadata(listing.nft.metadata)}
                        alt={listing.nft.metadata?.name || 'NFT'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
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
                        <h3 className="font-semibold truncate text-white">
                          {listing.nft.metadata?.name || `NFT #${listing.nft.serialNumber}`}
                        </h3>
                        <p className="text-sm text-gray-400">
                          {listing.nft.category}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-bold text-lg text-[#98ee2c]">
                          {(Number(listing.priceTinybar) / 100_000_000).toFixed(2)} HBAR
                        </p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="p-4 pt-0">
                    <Button
                      className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
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
      </Tabs>
      </div>
    </div>
  );
}
