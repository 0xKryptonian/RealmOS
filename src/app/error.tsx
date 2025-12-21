'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
            <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6 animate-pulse">
                <AlertCircle className="w-12 h-12 text-red-500" />
            </div>

            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                System Malfunction
            </h1>

            <p className="text-gray-400 mb-8 max-w-md">
                Our AI agents encountered an unexpected anomaly. The neural link has been disrupted.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Button
                    onClick={reset}
                    className="bg-red-500 hover:bg-red-600 text-white gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Reboot System
                </Button>
                <Button
                    variant="outline"
                    onClick={() => window.location.href = '/'}
                    className="border-gray-700 hover:bg-gray-800 text-gray-300"
                >
                    Return to Hub
                </Button>
            </div>

            {error.digest && (
                <p className="mt-12 text-xs font-mono text-gray-600">
                    Error Digest: {error.digest}
                </p>
            )}
        </div>
    );
}
