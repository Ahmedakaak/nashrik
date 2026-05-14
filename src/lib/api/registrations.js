import { supabase } from '../supabase'

// ===== EVENT REGISTRATIONS API =====

export async function getMyRegistrations(userId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('*, event:events(*, club:clubs(id, name, name_ar, category))')
        .eq('user_id', userId)
        .order('registered_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function isRegistered(eventId, userId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .eq('status', 'confirmed')
        .maybeSingle()

    if (error) throw error
    return data
}

export async function registerForEvent(eventId, userId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .insert({ event_id: eventId, user_id: userId, status: 'confirmed' })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function cancelRegistration(eventId, userId) {
    const { error } = await supabase
        .from('event_registrations')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

    if (error) throw error
}

export async function getEventAttendees(eventId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profile:profiles(id, full_name, full_name_ar, student_id, email)')
        .eq('event_id', eventId)
        .order('registered_at', { ascending: true })

    if (error) throw error
    return data || []
}

export async function markAttended(registrationId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .update({ attended: true, attended_at: new Date().toISOString() })
        .eq('id', registrationId)
        .select()
        .single()

    if (error) throw error
    return data
}
