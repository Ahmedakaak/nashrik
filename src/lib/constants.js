export const ROLES = {
    STUDENT: 'student',
    CLUB_ADMIN: 'club_admin',
    SYSTEM_ADMIN: 'system_admin',
}

export const EVENT_STATUSES = {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed',
}

export const CLUB_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
}

export const CLUB_CATEGORIES = [
    { value: 'academic', label: 'Academic', labelAr: 'أكاديمي', icon: '📚' },
    { value: 'sports', label: 'Sports', labelAr: 'رياضي', icon: '⚽' },
    { value: 'cultural', label: 'Cultural', labelAr: 'ثقافي', icon: '🎭' },
    { value: 'community', label: 'Community', labelAr: 'مجتمعي', icon: '🤝' },
]

export const MEMBER_STATUSES = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
}

export const NOTIFICATION_TYPES = {
    EVENT: 'event',
    CLUB: 'club',
    SYSTEM: 'system',
    REMINDER: 'reminder',
}

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024 // 5MB
export const ITEMS_PER_PAGE = 12
export const QR_REFRESH_INTERVAL = 30000 // 30 seconds

// Category color palette (UI constants)
export const categoryColors = {
    academic: { bg: 'bg-blue-500/15', text: 'text-blue-400', border: 'border-blue-500/30' },
    sports: { bg: 'bg-orange-500/15', text: 'text-orange-400', border: 'border-orange-500/30' },
    cultural: { bg: 'bg-purple-500/15', text: 'text-purple-400', border: 'border-purple-500/30' },
    community: { bg: 'bg-green-500/15', text: 'text-green-400', border: 'border-green-500/30' },
}

export const categoryIcons = {
    academic: '📚',
    sports: '⚽',
    cultural: '🎭',
    community: '🤝',
}
