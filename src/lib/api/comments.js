import { supabase } from '../supabase'

// ===== EVENT COMMENTS API =====

export async function getEventComments(eventId) {
    const { data, error } = await supabase
        .from('event_comments')
        .select('*, user:profiles(id, full_name, full_name_ar, role, avatar_url)')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
}

export async function addComment(eventId, userId, content) {
    const { data, error } = await supabase
        .from('event_comments')
        .insert({ event_id: eventId, user_id: userId, content })
        .select('*, user:profiles(id, full_name, full_name_ar, role, avatar_url)')
        .single()

    if (error) throw error
    return data
}

export async function deleteComment(id) {
    const { error } = await supabase
        .from('event_comments')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function togglePinComment(id, isPinned) {
    const { data, error } = await supabase
        .from('event_comments')
        .update({ is_pinned: isPinned })
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export function subscribeToEventComments(eventId, callback) {
    return supabase
        .channel(`comments:${eventId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'event_comments',
            filter: `event_id=eq.${eventId}`,
        }, (payload) => callback(payload))
        .subscribe()
}
