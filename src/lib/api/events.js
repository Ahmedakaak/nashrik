import { supabase } from '../supabase'

// ===== EVENTS API =====

export async function getEvents(filters = {}) {
    let query = supabase
        .from('events')
        .select('*, club:clubs(id, name, name_ar, category)')
        .order('date', { ascending: true })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.featured) query = query.eq('is_featured', true)
    if (filters.search) query = query.or(`title.ilike.%${filters.search}%,title_ar.ilike.%${filters.search}%`)
    if (filters.clubId) query = query.eq('club_id', filters.clubId)

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function getEventById(id) {
    const { data, error } = await supabase
        .from('events')
        .select('*, club:clubs(id, name, name_ar, category)')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function getEventsByClub(clubId) {
    const { data, error } = await supabase
        .from('events')
        .select('*, club:clubs(id, name, name_ar)')
        .eq('club_id', clubId)
        .order('date', { ascending: false })

    if (error) throw error
    return data || []
}

export async function createEvent(eventData) {
    const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select('*, club:clubs(id, name, name_ar)')
        .single()

    if (error) throw error
    return data
}

export async function updateEvent(id, updates) {
    const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', id)
        .select('*, club:clubs(id, name, name_ar)')
        .single()

    if (error) throw error
    return data
}

export async function deleteEvent(id) {
    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)

    if (error) throw error
}

export async function getAllEvents() {
    const { data, error } = await supabase
        .from('events')
        .select('*, club:clubs(id, name, name_ar, category)')
        .order('date', { ascending: false })

    if (error) throw error
    return data || []
}

// Subscribe to real-time event updates (e.g., registration counts)
export function subscribeToEvent(eventId, callback) {
    return supabase
        .channel(`event:${eventId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'events',
            filter: `id=eq.${eventId}`,
        }, (payload) => callback(payload.new))
        .subscribe()
}
