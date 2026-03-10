import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import imageCompression from 'browser-image-compression'

const AuthContext = createContext({})

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id)
            else setLoading(false)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id) // runs asynchronously
                } else {
                    setProfile(null)
                    setLoading(false)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    const fetchProfile = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (!error && data) {
                setProfile(data)
                return data
            }
            return null
        } catch (err) {
            console.error('Error fetching profile:', err)
            return null
        } finally {
            setLoading(false)
        }
    }

    const signUp = async (email, password, fullName, studentId, role) => {
        console.log('[AUTH] Calling Supabase signUp...')

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SUPABASE_SIGNUP_HANG')), 8000)
        })

        const reqPromise = supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    student_id: studentId,
                    role: role || 'student',
                },
            },
        })

        const { data, error } = await Promise.race([reqPromise, timeoutPromise])
        console.log('[AUTH] Supabase signUp returned:', { data, error })
        return { data, error }
    }

    const signIn = async (email, password) => {
        console.log('[AUTH] Calling Supabase signIn...')

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SUPABASE_SIGNIN_HANG')), 8000)
        })

        const reqPromise = supabase.auth.signInWithPassword({ email, password })

        const result = await Promise.race([reqPromise, timeoutPromise])
        console.log('[AUTH] Supabase signIn returned:', result)
        return result
    }

    const signOut = async () => {
        // Unconditionally clear local state so dev setups or stale sessions can log out
        setUser(null)
        setProfile(null)
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    const resetPassword = async (email) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
    }

    const updateProfile = async (updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single()

        if (!error && data) {
            setProfile(data)
        }

        return { data, error }
    }

    // Dev mode: bypass Supabase auth for UI testing
    const devLogin = (role) => {
        const mockProfiles = {
            student: { id: 'dev-student', full_name: 'Sara Al-Habsi', student_id: '21F1234', role: 'student', avatar_url: null },
            club_admin: { id: 'dev-club-admin', full_name: 'Noor Al-Busaidi', student_id: '20F0001', role: 'club_admin', avatar_url: null },
            system_admin: { id: 'dev-sys-admin', full_name: 'Dr. Ahmed Al-Siyabi', student_id: null, role: 'system_admin', avatar_url: null },
        }
        setUser({ id: mockProfiles[role].id, email: `${role}@dev.nashark` })
        setProfile(mockProfiles[role])
        setLoading(false)
    }

    const uploadAvatar = async (file) => {
        if (!user) throw new Error('User not authenticated')

        // 1. Validate file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('File size exceeds 2MB limit')
        }

        // 2. Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
        if (!allowedTypes.includes(file.type)) {
            throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.')
        }

        try {
            // 3. Compress Image (Max 400x400)
            const options = {
                maxSizeMB: 1, // Keep under 1MB even if 2MB is allowed
                maxWidthOrHeight: 400,
                useWebWorker: true,
                fileType: file.type // Keep original type or convert to webp if preferred
            }
            const compressedFile = await imageCompression(file, options)

            // 4. Delete old avatar if it exists
            if (profile?.avatar_url) {
                try {
                    // Extract path from public URL: https://.../avatars/{userId}/...
                    const urlObj = new URL(profile.avatar_url)
                    const pathParts = urlObj.pathname.split('/avatars/')
                    if (pathParts.length > 1) {
                        const oldFilePath = pathParts[1]
                        await supabase.storage.from('avatars').remove([oldFilePath])
                    }
                } catch (delErr) {
                    console.warn('Failed to delete old avatar:', delErr)
                    // Don't block upload if delete fails
                }
            }

            // 5. Upload new avatar
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Supabase storage needs a File object, browser-image-compression might return a Blob
            const finalFile = new File([compressedFile], fileName, { type: file.type })

            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, finalFile, {
                    cacheControl: '3600',
                    upsert: false // We use unique names based on timestamp
                })

            if (uploadError) throw uploadError

            // 6. Get public URL
            const { data: publicUrlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            const newAvatarUrl = publicUrlData.publicUrl

            // 7. Update profile
            const { data: updateData, error: updateError } = await updateProfile({
                avatar_url: newAvatarUrl
            })

            if (updateError) throw updateError

            return { data: updateData, error: null }
        } catch (error) {
            console.error('Error uploading avatar:', error)
            return { data: null, error }
        }
    }

    const value = {
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        fetchProfile,
        devLogin,
        uploadAvatar,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
