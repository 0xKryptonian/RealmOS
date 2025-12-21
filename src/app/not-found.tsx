import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Ghost, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20" />
                <Ghost className="w-24 h-24 text-blue-400 relative z-10 animate-bounce" />
            </div>

            <h1 className="text-6xl font-black mb-2 text-white tracking-tight">
                404
            </h1>

            <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Sector Not Found
            </h2>

            <p className="text-gray-400 mb-8 max-w-md">
                The coordinates you entered point to an uncharted region of the Hedera Verse. Turn back before you drift too far.
            </p>

            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 gap-2">
                <Link href="/">
                    <Home className="w-4 h-4" />
                    Return to Base
                </Link>
            </Button>
        </div>
    );
}
