import { format, formatDistanceToNow, isAfter, isBefore, parseISO } from 'date-fns'
import { ar } from 'date-fns/locale'

export const formatDate = (date, formatStr = 'PPP', locale = 'en') => {
    const d = typeof date === 'string' ? parseISO(date) : date
    return format(d, formatStr, { locale: locale === 'ar' ? ar : undefined })
}

export const formatRelativeTime = (date, locale = 'en') => {
    const d = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'ar' ? ar : undefined })
}

export const isUpcoming = (date) => {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isAfter(d, new Date())
}

export const isPast = (date) => {
    const d = typeof date === 'string' ? parseISO(date) : date
    return isBefore(d, new Date())
}

export const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
}

export const getInitials = (name) => {
    if (!name) return '?'
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

export const getStatusColor = (status) => {
    const colors = {
        draft: 'bg-gray-500/20 text-gray-400',
        published: 'bg-brand-400/20 text-brand-400',
        cancelled: 'bg-status-error/20 text-status-error',
        completed: 'bg-status-info/20 text-status-info',
        pending: 'bg-status-warning/20 text-status-warning',
        approved: 'bg-brand-400/20 text-brand-400',
        rejected: 'bg-status-error/20 text-status-error',
    }
    return colors[status] || 'bg-gray-500/20 text-gray-400'
}

export const getCategoryIcon = (category) => {
    const icons = {
        academic: '📚',
        sports: '⚽',
        cultural: '🎭',
        community: '🤝',
    }
    return icons[category] || '📌'
}

export const generateId = () => {
    return crypto.randomUUID?.() || Math.random().toString(36).substring(2, 15)
}

export const debounce = (fn, delay = 300) => {
    let timer
    return (...args) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
    }
}

export const cn = (...classes) => {
    return classes.filter(Boolean).join(' ')
}
