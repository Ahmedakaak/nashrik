import { cn } from '../../lib/utils'

export default function Select({
    label,
    error,
    options = [],
    className = '',
    placeholder = 'Select...',
    id,
    ...props
}) {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
        <div className="space-y-1.5">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-medium text-text-secondary">
                    {label}
                </label>
            )}
            <select
                id={selectId}
                className={cn(
                    'w-full rounded-xl bg-surface-card border border-surface-border px-4 py-2.5',
                    'text-text-primary',
                    'transition-all duration-200 appearance-none',
                    'focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20',
                    'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23A0A0A0%22%20stroke-width%3D%222%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%2F%3E%3C%2Fsvg%3E")]',
                    'bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]',
                    '[dir=rtl]:bg-[left_0.75rem_center]',
                    error && 'border-status-error',
                    className
                )}
                {...props}
            >
                <option value="" className="bg-surface-dark text-text-muted">{placeholder}</option>
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-surface-dark">
                        {opt.label}
                    </option>
                ))}
            </select>
            {error && (
                <p className="text-sm text-status-error mt-1">{error}</p>
            )}
        </div>
    )
}
