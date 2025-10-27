'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ListNFTModalProps {
  open: boolean;
  onClose: () => void;
  nft: {
    id: string;
    tokenId: string;
    serialNumber: string;
    metadata: any;
    category: string;
  };
  onSuccess: () => void;
}

export function ListNFTModal({ open, onClose, nft, onSuccess }: ListNFTModalProps) {
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('HBAR');
  const [listingType, setListingType] = useState('FIXED_PRICE');
  const [duration, setDuration] = useState('7'); // days

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    setLoading(true);

    try {
      const expiresAt = listingType === 'AUCTION' 
        ? Date.now() + parseInt(duration) * 24 * 60 * 60 * 1000
        : 0;

      const response = await fetch('/api/marketplace/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nftId: nft.id,
          price: parseFloat(price),
          currency,
          listingType,
          expiresAt: expiresAt > 0 ? new Date(expiresAt).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create listing');
      }

      toast.success('NFT listed successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('List NFT error:', error);
      toast.error(error.message || 'Failed to list NFT');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-black border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">List NFT for Sale</DialogTitle>
          <DialogDescription className="text-gray-400">
            {nft.metadata?.name || `NFT #${nft.serialNumber}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price" className="text-white">Price</Label>
            <div className="flex gap-2">
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="flex-1 bg-white/5 border-white/10 text-white"
                required
              />
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-[120px] bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HBAR">HBAR</SelectItem>
                  <SelectItem value="REALM">REALM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="listingType" className="text-white">Listing Type</Label>
            <Select value={listingType} onValueChange={setListingType}>
              <SelectTrigger className="bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FIXED_PRICE">Fixed Price</SelectItem>
                <SelectItem value="AUCTION">Auction</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {listingType === 'AUCTION' && (
            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Auction Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day</SelectItem>
                  <SelectItem value="3">3 Days</SelectItem>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="14">14 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="bg-white/5 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Platform Fee (2.5%)</span>
              <span className="text-white">
                {price ? (parseFloat(price) * 0.025).toFixed(2) : '0.00'} {currency}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Creator Royalty (5%)</span>
              <span className="text-white">
                {price ? (parseFloat(price) * 0.05).toFixed(2) : '0.00'} {currency}
              </span>
            </div>
            <div className="border-t border-white/10 pt-2 flex justify-between font-semibold">
              <span className="text-white">You'll Receive</span>
              <span className="text-[#98ee2c]">
                {price ? (parseFloat(price) * 0.925).toFixed(2) : '0.00'} {currency}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="border-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Listing...
                </>
              ) : (
                'List NFT'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
