export default function LoadingSpinner({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'h-5 w-5',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    }

    return (
        <div className={`flex items-center justify-center ${className}`}>
            <div className={`${sizes[size]} relative`}>
                <div className={`${sizes[size]} rounded-full border-2 border-surface-border`} />
                <div className={`${sizes[size]} rounded-full border-2 border-transparent border-t-brand-400 animate-spin absolute inset-0`} />
            </div>
        </div>
    )
}

export function PageLoader() {
    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
                <LoadingSpinner size="lg" />
                <p className="text-text-secondary animate-pulse">Loading...</p>
            </div>
        </div>
    )
}

export function SkeletonLoader({ className = '', count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`shimmer-bg rounded-xl ${className}`} />
            ))}
        </>
    )
}

export function CardSkeleton() {
    return (
        <div className="bg-surface-dark rounded-2xl border border-surface-border p-6 space-y-4">
            <div className="shimmer-bg h-40 rounded-xl" />
            <div className="shimmer-bg h-4 w-3/4 rounded" />
            <div className="shimmer-bg h-3 w-1/2 rounded" />
            <div className="flex gap-2">
                <div className="shimmer-bg h-6 w-16 rounded-full" />
                <div className="shimmer-bg h-6 w-20 rounded-full" />
            </div>
        </div>
    )
}
