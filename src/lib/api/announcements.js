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

export async function updateAnnouncement(id, updates) {
    const { data, error } = await supabase
        .from('announcements')
        .update(updates)
        .eq('id', id)
        .select('*, author:profiles(id, full_name, full_name_ar)')
        .single()

    if (error) throw error
    return data
}

export async function deleteAnnouncement(id) {
    const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

    if (error) throw error
}
