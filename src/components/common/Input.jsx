import { cn } from '../../lib/utils'
import { forwardRef } from 'react'

const Input = forwardRef(({
    label,
    error,
    icon: Icon,
    className = '',
    type = 'text',
    id,
    ...props
}, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={inputId} className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <Icon size={18} className="text-text-muted" />
                    </div>
                )}
                <input
                    ref={ref}
                    id={inputId}
                    type={type}
                    className={cn(
                        'w-full rounded-xl bg-surface-card border border-surface-border px-4 py-2.5',
                        'text-text-primary placeholder:text-text-muted',
                        'transition-all duration-200',
                        'focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                        Icon && 'ps-10',
                        error && 'border-status-error focus:border-status-error focus:ring-status-error/20',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-status-error mt-1">{error}</p>
            )}
        </div>
    )
})

Input.displayName = 'Input'
export default Input
