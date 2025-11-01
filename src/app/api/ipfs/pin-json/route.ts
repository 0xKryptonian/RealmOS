import { NextRequest, NextResponse } from 'next/server';

// Pins JSON to IPFS via Pinata if credentials are provided.
// Supported auth:
// - PINATA_JWT (recommended)
// - PINATA_API_KEY + PINATA_SECRET_API_KEY
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { json } = body as { json: unknown };

    if (json == null) {
      return NextResponse.json({ error: 'json is required' }, { status: 400 });
    }

    const pinataJwt = process.env.PINATA_JWT;
    const pinataApiKey = process.env.PINATA_API_KEY;
    const pinataSecret = process.env.PINATA_SECRET_API_KEY;

    if (!pinataJwt && !(pinataApiKey && pinataSecret)) {
      return NextResponse.json({
        error: 'Pinata credentials missing. Provide PINATA_JWT or PINATA_API_KEY + PINATA_SECRET_API_KEY.',
      }, { status: 400 });
    }

    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (pinataJwt) {
      headers.Authorization = `Bearer ${pinataJwt}`;
    } else {
      headers.pinata_api_key = pinataApiKey!;
      headers.pinata_secret_api_key = pinataSecret!;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ pinataContent: json }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Pinata failed: ${res.status} ${text}` }, { status: 500 });
    }

    const data = await res.json();
    const cid = data?.IpfsHash || data?.ipfsHash || data?.hash || data?.cid;
    if (!cid) {
      return NextResponse.json({ error: 'Pinata response missing CID' }, { status: 500 });
    }

    return NextResponse.json({ success: true, cid, url: `ipfs://${cid}` });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to pin JSON' }, { status: 500 });
  }
}
