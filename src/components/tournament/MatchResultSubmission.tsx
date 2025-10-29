'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trophy, Upload, Check } from 'lucide-react';
import { toast } from 'sonner';

interface MatchResultSubmissionProps {
  matchId: string;
  player1: {
    accountId: string;
    name: string;
  };
  player2: {
    accountId: string;
    name: string;
  };
  onSubmit: (result: { winnerId: string; player1Score: number; player2Score: number }) => void;
}

export default function MatchResultSubmission({
  matchId,
  player1,
  player2,
  onSubmit,
}: MatchResultSubmissionProps) {
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);

    if (isNaN(p1Score) || isNaN(p2Score)) {
      toast.error('Please enter valid scores');
      return;
    }

    if (p1Score === p2Score) {
      toast.error('Scores cannot be tied');
      return;
    }

    setSubmitting(true);
    try {
      const winnerId = p1Score > p2Score ? player1.accountId : player2.accountId;
      
      await onSubmit({
        winnerId,
        player1Score: p1Score,
        player2Score: p2Score,
      });

      toast.success('Match result submitted successfully!');
      setPlayer1Score('');
      setPlayer2Score('');
    } catch (error) {
      toast.error('Failed to submit result');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur-sm border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#98ee2c]" />
          Submit Match Result
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player 1 Score */}
        <div className="space-y-2">
          <Label className="text-white">{player1.name}</Label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center">
              <span className="text-black font-bold">{player1.name[0]}</span>
            </div>
            <Input
              type="number"
              value={player1Score}
              onChange={(e) => setPlayer1Score(e.target.value)}
              placeholder="Score"
              className="bg-white/5 border-white/10 text-white"
              min="0"
            />
          </div>
        </div>

        {/* VS Divider */}
        <div className="text-center text-gray-400 font-semibold">VS</div>

        {/* Player 2 Score */}
        <div className="space-y-2">
          <Label className="text-white">{player2.name}</Label>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#98ee2c] to-[#7bc922] flex items-center justify-center">
              <span className="text-black font-bold">{player2.name[0]}</span>
            </div>
            <Input
              type="number"
              value={player2Score}
              onChange={(e) => setPlayer2Score(e.target.value)}
              placeholder="Score"
              className="bg-white/5 border-white/10 text-white"
              min="0"
            />
          </div>
        </div>

        {/* Winner Preview */}
        {player1Score && player2Score && parseInt(player1Score) !== parseInt(player2Score) && (
          <div className="p-3 bg-[#98ee2c]/10 border border-[#98ee2c]/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Winner:</span>
              <Badge className="bg-[#98ee2c] text-black">
                <Check className="w-3 h-3 mr-1" />
                {parseInt(player1Score) > parseInt(player2Score) ? player1.name : player2.name}
              </Badge>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={submitting || !player1Score || !player2Score}
          className="w-full bg-gradient-to-r from-[#98ee2c] to-[#7bc922] text-black font-semibold hover:opacity-90"
        >
          <Upload className="w-4 h-4 mr-2" />
          {submitting ? 'Submitting...' : 'Submit Result'}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          Results will be verified and recorded on-chain
        </p>
      </CardContent>
    </Card>
  );
}
