import { cn } from '../../lib/utils'

export default function Card({
    children,
    className = '',
    hover = false,
    padding = true,
    glass = false,
    ...props
}) {
    return (
        <div
            className={cn(
                'rounded-2xl border border-surface-border',
                glass ? 'glass' : 'bg-surface-dark',
                padding && 'p-6',
                hover && 'hover-lift cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardHeader({ children, className = '' }) {
    return (
        <div className={cn('flex items-center justify-between mb-4', className)}>
            {children}
        </div>
    )
}

export function CardTitle({ children, className = '' }) {
    return (
        <h3 className={cn('text-lg font-semibold text-text-primary', className)}>
            {children}
        </h3>
    )
}

export function CardContent({ children, className = '' }) {
    return (
        <div className={cn('text-text-secondary', className)}>
            {children}
        </div>
    )
}
