import { supabase } from '../supabase'
import { summarizeAttendance } from '../attendance'

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

export async function getAttendanceForEvents(eventIds = []) {
    if (!eventIds.length) return []

    const { data, error } = await supabase
        .from('event_registrations')
        .select('id, event_id, user_id, status, attended, attended_at, check_in_method, checked_in_by')
        .in('event_id', eventIds)

    if (error) throw error
    return data || []
}

export async function getAttendanceSummary(eventId) {
    const attendees = await getEventAttendees(eventId)
    return summarizeAttendance(attendees)
}

export async function findRegistrationByQrToken(eventId, qrToken) {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profile:profiles(id, full_name, full_name_ar, student_id, email)')
        .eq('event_id', eventId)
        .eq('qr_token', qrToken)
        .maybeSingle()

    if (error) throw error
    return data
}

export async function findRegistrationByScannedCode(scannedCode) {
    const token = scannedCode.trim()

    const { data: tokenMatch, error: tokenError } = await supabase
        .from('event_registrations')
        .select('*, profile:profiles(id, full_name, full_name_ar, student_id, email), event:events(id, title, title_ar)')
        .eq('qr_token', token)
        .maybeSingle()

    if (tokenError) throw tokenError
    if (tokenMatch) return tokenMatch

    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidPattern.test(token)) return null

    const { data: idMatch, error: idError } = await supabase
        .from('event_registrations')
        .select('*, profile:profiles(id, full_name, full_name_ar, student_id, email), event:events(id, title, title_ar)')
        .eq('id', token)
        .maybeSingle()

    if (idError) throw idError
    return idMatch
}

export async function markAttended(registrationId, method = 'qr') {
    const { data, error } = await supabase.rpc('mark_registration_attended', {
        p_registration_id: registrationId,
        p_method: method,
    })

    if (error) throw error
    return data
}

export async function markManualAttendance(eventId, studentId) {
    const { data, error } = await supabase
        .from('event_registrations')
        .select('*, profile:profiles(id, full_name, full_name_ar, student_id, email)')
        .eq('event_id', eventId)
        .eq('status', 'confirmed')

    if (error) throw error

    const registration = (data || []).find((record) =>
        record.profile?.student_id?.toLowerCase() === studentId.trim().toLowerCase()
    )

    if (!registration) return null
    return markAttended(registration.id, 'manual')
}
