import { supabase } from '../supabase'

// ===== SYSTEM ADMIN API =====

export async function getAllUsers(filters = {}) {
    let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

    if (filters.role) query = query.eq('role', filters.role)
    if (filters.status) query = query.eq('status', filters.status)
    if (filters.search) query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`)

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function updateUserRole(userId, role) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateUserStatus(userId, status) {
    const { data, error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function getPendingClubs() {
    const { data, error } = await supabase
        .from('clubs')
        .select('*, admin:profiles(id, full_name, full_name_ar, email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

// ===== PLATFORM STATS (aggregations) =====

export async function getPlatformStats() {
    // Run all counts in parallel
    const [usersRes, eventsRes, clubsRes, pendingRes, regsRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
        supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('event_registrations').select('*', { count: 'exact', head: true }),
    ])

    return {
        totalUsers: usersRes.count || 0,
        activeEvents: eventsRes.count || 0,
        totalClubs: clubsRes.count || 0,
        pendingApprovals: pendingRes.count || 0,
        totalRegistrations: regsRes.count || 0,
    }
}

export async function getUsersByRole() {
    const { data, error } = await supabase
        .from('profiles')
        .select('role')

    if (error) throw error

    const counts = {}
    ;(data || []).forEach(u => {
        counts[u.role] = (counts[u.role] || 0) + 1
    })

    return [
        { role: 'Students', role_ar: 'طلاب', count: counts.student || 0 },
        { role: 'Club Admins', role_ar: 'مدراء أندية', count: counts.club_admin || 0 },
        { role: 'System Admins', role_ar: 'مدراء النظام', count: counts.system_admin || 0 },
    ]
}

export async function getActivityTimeline() {
    const days = Array.from({ length: 30 }, (_, index) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - index))
        return date.toISOString().slice(0, 10)
    })
    const since = `${days[0]}T00:00:00.000Z`
    const timeline = days.reduce((acc, date) => {
        acc[date] = { date, users: 0, registrations: 0, memberships: 0 }
        return acc
    }, {})

    const [usersRes, registrationsRes, membershipsRes] = await Promise.all([
        supabase.from('profiles').select('created_at').gte('created_at', since),
        supabase.from('event_registrations').select('created_at').gte('created_at', since),
        supabase.from('club_memberships').select('created_at').gte('created_at', since),
    ])

    if (usersRes.error) throw usersRes.error
    if (registrationsRes.error) throw registrationsRes.error
    if (membershipsRes.error) throw membershipsRes.error

    ;(usersRes.data || []).forEach(item => {
        const date = item.created_at?.slice(0, 10)
        if (timeline[date]) timeline[date].users += 1
    })
    ;(registrationsRes.data || []).forEach(item => {
        const date = item.created_at?.slice(0, 10)
        if (timeline[date]) timeline[date].registrations += 1
    })
    ;(membershipsRes.data || []).forEach(item => {
        const date = item.created_at?.slice(0, 10)
        if (timeline[date]) timeline[date].memberships += 1
    })

    return days.map(date => timeline[date])
}

export async function getRecentUsers(limit = 5) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data || []
}

export async function createSystemAlert(title, title_ar, message, message_ar) {
    const { error } = await supabase.rpc('create_system_alert', {
        p_title: title,
        p_title_ar: title_ar,
        p_message: message,
        p_message_ar: message_ar
    })
    
    if (error) throw error
}
