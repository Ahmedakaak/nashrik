import {
    BookOpen,
    Briefcase,
    Cpu,
    Globe2,
    HandshakeIcon,
    HeartPulse,
    Leaf,
    Palette,
    Trophy,
} from 'lucide-react'

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
    { value: 'academic', label: 'Academic', labelAr: 'أكاديمي', icon: BookOpen },
    { value: 'sports', label: 'Sports', labelAr: 'رياضي', icon: Trophy },
    { value: 'cultural', label: 'Cultural', labelAr: 'ثقافي', icon: Globe2 },
    { value: 'community', label: 'Community', labelAr: 'مجتمعي', icon: HandshakeIcon },
    { value: 'arts', label: 'Arts & Creative', labelAr: 'الفنون والإبداع', icon: Palette },
    { value: 'technology', label: 'Technology & Gaming', labelAr: 'التقنية والألعاب', icon: Cpu },
    { value: 'health', label: 'Health & Wellness', labelAr: 'الصحة واللياقة', icon: HeartPulse },
    { value: 'volunteer', label: 'Volunteering & Social Impact', labelAr: 'التطوع والأثر الاجتماعي', icon: Leaf },
    { value: 'career', label: 'Career & Professional', labelAr: 'المسار المهني', icon: Briefcase },
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
    arts: { bg: 'bg-pink-500/15', text: 'text-pink-400', border: 'border-pink-500/30' },
    technology: { bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    health: { bg: 'bg-emerald-500/15', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    volunteer: { bg: 'bg-teal-500/15', text: 'text-teal-400', border: 'border-teal-500/30' },
    career: { bg: 'bg-amber-500/15', text: 'text-amber-400', border: 'border-amber-500/30' },
}

export const categoryIcons = Object.fromEntries(
    CLUB_CATEGORIES.map(({ value, icon }) => [value, icon])
)
