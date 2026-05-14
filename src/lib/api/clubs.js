import { supabase } from '../supabase'

// ===== CLUBS API =====

export async function getClubs(filters = {}) {
    let query = supabase
        .from('clubs')
        .select('*')
        .order('created_at', { ascending: false })

    if (filters.status) query = query.eq('status', filters.status)
    if (filters.category) query = query.eq('category', filters.category)
    if (filters.search) query = query.or(`name.ilike.%${filters.search}%,name_ar.ilike.%${filters.search}%`)

    const { data, error } = await query
    if (error) throw error
    return data || []
}

export async function getClubById(id) {
    const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export async function getClubByAdminId(userId) {
    const { data, error } = await supabase
        .from('clubs')
        .select('*')
        .eq('admin_id', userId)
        .single()

    if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
    return data
}

export async function createClub(clubData) {
    const { data, error } = await supabase
        .from('clubs')
        .insert(clubData)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function updateClub(id, updates) {
    const { data, error } = await supabase
        .from('clubs')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function deleteClub(id) {
    const { error } = await supabase
        .from('clubs')
        .delete()
        .eq('id', id)

    if (error) throw error
}
