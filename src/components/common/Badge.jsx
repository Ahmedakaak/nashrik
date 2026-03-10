import { cn, getStatusColor } from '../../lib/utils'

export default function Badge({ children, variant = 'default', className = '' }) {
    const variants = {
        default: 'bg-surface-card text-text-secondary border border-surface-border',
        brand: 'bg-brand-400/15 text-brand-400 border border-brand-400/20',
        success: 'bg-status-success/15 text-status-success border border-status-success/20',
        warning: 'bg-status-warning/15 text-status-warning border border-status-warning/20',
        error: 'bg-status-error/15 text-status-error border border-status-error/20',
        info: 'bg-status-info/15 text-status-info border border-status-info/20',
    }

    return (
        <span className={cn(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
            variants[variant],
            className
        )}>
            {children}
        </span>
    )
}

export function StatusBadge({ status }) {
    const config = {
        draft: { label: 'Draft', variant: 'default' },
        published: { label: 'Published', variant: 'brand' },
        cancelled: { label: 'Cancelled', variant: 'error' },
        completed: { label: 'Completed', variant: 'info' },
        pending: { label: 'Pending', variant: 'warning' },
        approved: { label: 'Approved', variant: 'success' },
        rejected: { label: 'Rejected', variant: 'error' },
    }

    const { label, variant } = config[status] || config.draft

    return <Badge variant={variant}>{label}</Badge>
}
