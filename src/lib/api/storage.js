import { supabase } from '../supabase'

// ===== STORAGE / IMAGE UPLOAD API =====

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

/**
 * Upload a file to a Supabase storage bucket.
 * @param {'avatars'|'clubs'|'events'} bucket - The bucket name
 * @param {File} file - The file to upload
 * @param {string} folder - Folder path inside the bucket (e.g., user id or club id)
 * @returns {string} The public URL of the uploaded file
 */
export async function uploadImage(bucket, file, folder) {
    const ext = file.name.split('.').pop()
    const fileName = `${folder}/${crypto.randomUUID()}.${ext}`

    const { error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        })

    if (error) throw error

    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName)

    return publicUrl
}

/**
 * Delete a file from a Supabase storage bucket.
 * @param {'avatars'|'clubs'|'events'} bucket
 * @param {string} fileUrl - The full public URL of the file
 */
export async function deleteImage(bucket, fileUrl) {
    if (!fileUrl) return

    // Extract path from full URL
    // URL format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const prefix = `${SUPABASE_URL}/storage/v1/object/public/${bucket}/`
    const filePath = fileUrl.replace(prefix, '')

    if (!filePath) return

    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath])

    if (error) throw error
}

/**
 * Upload an avatar for the current user and update their profile.
 * @param {string} userId
 * @param {File} file
 * @returns {string} The public URL
 */
export async function uploadAvatar(userId, file) {
    const url = await uploadImage('avatars', file, userId)

    // Update the profile with the new avatar URL
    const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', userId)

    if (error) throw error
    return url
}

/**
 * Upload a club logo or cover image.
 * @param {string} clubId
 * @param {File} file
 * @param {'logo'|'cover'} type
 * @returns {string} The public URL
 */
export async function uploadClubImage(clubId, file, type = 'logo') {
    const url = await uploadImage('clubs', file, `${clubId}/${type}`)

    const updateField = type === 'cover' ? 'cover_url' : 'logo_url'
    const { error } = await supabase
        .from('clubs')
        .update({ [updateField]: url })
        .eq('id', clubId)

    if (error) throw error
    return url
}

/**
 * Upload an event cover image.
 * @param {string} eventId
 * @param {File} file
 * @returns {string} The public URL
 */
export async function uploadEventCover(eventId, file) {
    const url = await uploadImage('events', file, eventId)

    const { error } = await supabase
        .from('events')
        .update({ cover_url: url })
        .eq('id', eventId)

    if (error) throw error
    return url
}
