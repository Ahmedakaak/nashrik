import { supabase } from '../supabase'

// ===== CLUBS API =====

const CLUB_COVERS_BUCKET = 'club-covers'
const COVER_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_COVER_IMAGE_SIZE = 5 * 1024 * 1024

function validateCoverImage(file) {
    if (!file) throw new Error('Please select an image to upload.')
    if (!COVER_IMAGE_TYPES.includes(file.type)) throw new Error('Cover image must be a JPG, PNG, or WebP file.')
    if (file.size > MAX_COVER_IMAGE_SIZE) throw new Error('Cover image must be 5MB or smaller.')
}

function getFileExtension(file) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (extension) return extension
    if (file.type === 'image/png') return 'png'
    if (file.type === 'image/webp') return 'webp'
    return 'jpg'
}

export async function uploadClubCoverImage(file) {
    validateCoverImage(file)

    const filePath = `${crypto.randomUUID()}.${getFileExtension(file)}`
    const { error } = await supabase.storage
        .from(CLUB_COVERS_BUCKET)
        .upload(filePath, file, {
            cacheControl: '3600',
            contentType: file.type,
            upsert: false,
        })

    if (error) throw error

    const { data } = supabase.storage
        .from(CLUB_COVERS_BUCKET)
        .getPublicUrl(filePath)

    return data.publicUrl
}

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
