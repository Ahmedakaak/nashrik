import { supabase } from '../supabase'

// ===== ANNOUNCEMENTS API =====

export async function getClubAnnouncements(clubId) {
    const { data, error } = await supabase
        .from('announcements')
        .select('*, author:profiles(id, full_name, full_name_ar)')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function createAnnouncement(announcementData) {
    const { data, error } = await supabase
        .from('announcements')
        .insert(announcementData)
        .select('*, author:profiles(id, full_name, full_name_ar)')
        .single()

    if (error) throw error
    return data
}

const notFoundOrUnauthorizedError = new Error('Announcement not found or you do not have permission to modify it')

export async function updateAnnouncement(id, updates, clubId) {
    let query = supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)

    if (clubId) query = query.eq('club_id', clubId)

    const { data, error } = await query
        .select('*, author:profiles(id, full_name, full_name_ar)')
        .maybeSingle()

    if (error) throw error
    if (!data) throw notFoundOrUnauthorizedError
    return data
}

export async function deleteAnnouncement(id, clubId) {
    let query = supabase
        .from('announcements')
        .delete()
        .eq('id', id)

    if (clubId) query = query.eq('club_id', clubId)

    const { data, error } = await query
        .select('id')
        .maybeSingle()

    if (error) throw error
    if (!data) throw notFoundOrUnauthorizedError
}
