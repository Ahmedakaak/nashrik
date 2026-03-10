import { cn } from '../../lib/utils'

const variants = {
    primary: 'bg-brand-400 hover:bg-brand-500 text-white shadow-lg shadow-brand-400/20',
    secondary: 'bg-surface-card hover:bg-surface-border text-text-primary border border-surface-border',
    outline: 'border border-brand-400 text-brand-400 hover:bg-brand-400/10',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-white/5',
    danger: 'bg-status-error/10 text-status-error hover:bg-status-error/20 border border-status-error/20',
}

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
    xl: 'px-8 py-4 text-lg',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    disabled = false,
    loading = false,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    ...props
}) {
    return (
        <button
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 cursor-pointer',
                'focus:outline-none focus:ring-2 focus:ring-brand-400/50 focus:ring-offset-2 focus:ring-offset-surface-darker',
                'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',
                'active:scale-[0.98]',
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className
            )}
            disabled={disabled || loading}
            {...props}
        >
            {loading && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {!loading && Icon && iconPosition === 'left' && <Icon size={18} />}
            {children}
            {!loading && Icon && iconPosition === 'right' && <Icon size={18} />}
        </button>
    )
}
