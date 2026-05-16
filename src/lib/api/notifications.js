import { supabase } from '../supabase'

// ===== NOTIFICATIONS API =====

export async function getNotifications(userId) {
    const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function getUnreadCount(userId) {
    const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false)

    if (error) throw error
    return count || 0
}

export async function markAsRead(id) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id)

    if (error) throw error
}

export async function markAllAsRead(userId) {
    const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)

    if (error) throw error
}

export async function deleteNotification(id) {
    console.log('[notifications] deleteNotification requested', { id })

    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)

    if (error) {
        console.error('[notifications] deleteNotification failed', { id, error })
        throw error
    }

    console.log('[notifications] deleteNotification resolved', { id })
}

export async function clearAllNotifications(userId) {
    const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)

    if (error) throw error
}

// Subscribe to real-time notifications
export function subscribeToNotifications(userId, callback) {
    return supabase
        .channel(`notifications:${userId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
        }, (payload) => callback(payload.new))
        .subscribe()
}
