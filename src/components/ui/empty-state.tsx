import { LucideIcon, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EmptyStateProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    actionLabel?: string;
    actionHref?: string;
}

export function EmptyState({
    icon: Icon = Ghost,
    title = "No Data Found",
    description = "It's quiet here... too quiet.",
    actionLabel,
    actionHref
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-white/5 rounded-2xl border border-white/5 border-dashed">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-400 max-w-sm mb-6">{description}</p>

            {actionLabel && actionHref && (
                <Button asChild variant="outline">
                    <Link href={actionHref}>
                        {actionLabel}
                    </Link>
                </Button>
            )}
        </div>
    );
}
