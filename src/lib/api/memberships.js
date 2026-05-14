import { supabase } from '../supabase'

// ===== CLUB MEMBERSHIPS API =====

export async function getMyMemberships(userId) {
    const { data, error } = await supabase
        .from('club_memberships')
        .select('*, club:clubs(*)')
        .eq('user_id', userId)
        .order('joined_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function getMembershipStatus(clubId, userId) {
    const { data, error } = await supabase
        .from('club_memberships')
        .select('id, status')
        .eq('club_id', clubId)
        .eq('user_id', userId)
        .maybeSingle()

    if (error) throw error
    return data
}

export async function joinClub(clubId, userId) {
    const { data, error } = await supabase
        .from('club_memberships')
        .insert({ club_id: clubId, user_id: userId, status: 'pending' })
        .select()
        .single()

    if (error) throw error
    return data
}

export async function leaveClub(clubId, userId) {
    const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('club_id', clubId)
        .eq('user_id', userId)

    if (error) throw error
}

export async function getClubMembers(clubId) {
    const { data, error } = await supabase
        .from('club_memberships')
        .select('*, profile:profiles(id, full_name, full_name_ar, email, student_id, avatar_url)')
        .eq('club_id', clubId)
        .order('joined_at', { ascending: false })

    if (error) throw error
    return data || []
}

export async function updateMemberStatus(membershipId, status) {
    const { data, error } = await supabase
        .from('club_memberships')
        .update({ status })
        .eq('id', membershipId)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteMembership(membershipId) {
    const { error } = await supabase
        .from('club_memberships')
        .delete()
        .eq('id', membershipId)

    if (error) throw error
}
