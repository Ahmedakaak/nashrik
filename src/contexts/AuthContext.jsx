import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import imageCompression from 'browser-image-compression'

/**
 * Context to hold authentication state and methods.
 * Defaults to an empty object.
 */
const AuthContext = createContext({})

/**
 * Provider component that wraps the application to supply authentication data.
 * Manages the current user session, extended profile, and an overall loading state.
 *
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.children - Child components to render within the provider.
 */
export const AuthProvider = ({ children }) => {
    // Raw user object directly from Supabase Auth (handles session tokens)
    const [user, setUser] = useState(null)
    // Custom user profile data retrieved from the database 'profiles' table (e.g., full name, role)
    const [profile, setProfile] = useState(null)
    // Global loading state flag to prevent UI flashing and blank screens before session resolves
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Step 1: Immediately check if there is an active session cached in local storage
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null)
            if (session?.user) fetchProfile(session.user.id) // Fetch extra info if session exists
            else setLoading(false) // Finish loading if no user is found
        })

        // Step 2: Set up an event listener for auth state changes (login, token refresh, logout)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user ?? null)
                if (session?.user) {
                    fetchProfile(session.user.id) // Retrieve extra profile fields asynchronously
                } else {
                    setProfile(null) // Scrape sensitive data upon logout
                    setLoading(false)
                }
            }
        )

        // Step 3: Prevent memory leaks by unsubscribing when the provider unmounts
        return () => subscription.unsubscribe()
    }, [])

    /**
     * Fetches detailed profile information for the given user from the 'profiles' database table.
     * Useful for retrieving application-specific data such as 'role' and 'student_id'.
     *
     * @param {string} userId - The unique Supabase Auth user ID.
     * @returns {Promise<Object|null>} The profile record object, or null if retrieval failed.
     */
    const fetchProfile = async (userId) => {
        try {
            // Query the 'profiles' table for the row matching the current user ID
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single() // Expects exactly one row to be returned

            if (!error && data) {
                setProfile(data) // Update the global profile state context
                return data
            }
            return null
        } catch (err) {
            console.error('Error fetching profile:', err)
            return null
        } finally {
            // Always complete the loading cycle regardless of success or failure
            setLoading(false)
        }
    }

    /**
     * Registers a new user. Appends custom user metadata (full name, student ID, role), 
     * which Supabase uses down the pipeline to automatically construct a profile row via a Postgres trigger.
     */
    const signUp = async (email, password, fullName, studentId, role) => {
        console.log('[AUTH] Calling Supabase signUp...')

        // Implement a manual 8-second timeout guard to prevent the application from hanging indefinitely
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
                    role: role || 'student', // Provide a fallback default role of 'student'
                },
            },
        })

        // Race the network request against the local timeout threshold
        const { data, error } = await Promise.race([reqPromise, timeoutPromise])
        console.log('[AUTH] Supabase signUp returned:', { data, error })
        return { data, error }
    }

    /**
     * Authenticates an existing user utilizing their email and password credentials.
     */
    const signIn = async (email, password) => {
        console.log('[AUTH] Calling Supabase signIn...')

        // Incorporate the equivalent 8-second timeout mechanism here
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('SUPABASE_SIGNIN_HANG')), 8000)
        })

        const reqPromise = supabase.auth.signInWithPassword({ email, password })

        const result = await Promise.race([reqPromise, timeoutPromise])
        console.log('[AUTH] Supabase signIn returned:', result)
        return result
    }

    /**
     * Ends the authenticated session for the current user.
     */
    const signOut = async () => {
        // Unconditionally clear local React state immediately so the user experiences an instant logout
        setUser(null)
        setProfile(null)
        // Make call to invalidate the server session and clear the local storage tokens
        const { error } = await supabase.auth.signOut()
        return { error }
    }

    /**
     * Sends a password reset email to the designated user.
     * Includes a callback URL to redirect them back to the application's unique reset password page.
     */
    const resetPassword = async (email) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
        })
    }

    /**
     * Mutates specific payload fields of the current user's profile within the database.
     * Continues to keep the local React state consistently in sync with the new database values.
     *
     * @param {Object} updates - A key-value mapping of profile properties to overwrite.
     */
    const updateProfile = async (updates) => {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single() // Return the freshly updated row

        if (!error && data) {
            setProfile(data) // Inject changes locally without needing to fully re-fetch
        }

        return { data, error }
    }

    /**
     * Developer utility function: Completely bypasses authentic Supabase processes to establish an immediate, simulated sign-in state 
     * utilizing hardcoded dummy profiles. Useful for accelerating UI testing across varying access levels.
     * 
     * @param {string} role - The target system role to mimic ('student', 'club_admin', 'system_admin').
     */
    const devLogin = (role) => {
        const mockProfiles = {
            student: { id: 'dev-student', full_name: 'Sara Al-Habsi', student_id: '21F1234', role: 'student', avatar_url: null },
            club_admin: { id: 'dev-club-admin', full_name: 'Noor Al-Busaidi', student_id: '20F0001', role: 'club_admin', avatar_url: null },
            system_admin: { id: 'dev-sys-admin', full_name: 'Dr. Ahmed Al-Siyabi', student_id: null, role: 'system_admin', avatar_url: null },
        }
        setUser({ id: mockProfiles[role].id, email: `${role}@dev.nashark` }) // Populate fake user session
        setProfile(mockProfiles[role]) // Populate fake database profile records
        setLoading(false)
    }

    /**
     * Conducts end-to-end operation for updating the account profile picture. This entails preliminary validations, 
     * on-the-fly image compression, garbage-collecting the previous avatar to conserve storage quotas, 
     * transmitting the new blob, and ultimately registering the URL to the updated database profile segment.
     *
     * @param {File} file - The raw image file object sourced dynamically from a user file input action.
     * @returns {Promise<Object>} An object containing the resultant { data, error } state parameters.
     */
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

/**
 * Custom hook utility to fluently consume the `AuthContext` state from inner nested React layout components.
 * Will explicitly crash fast if executed erroneously outside the scope border of the overarching `AuthProvider`.
 *
 * @returns {Object} The complete dictionary representing authentication bindings (e.g., user context, signIn, signUp).
 */
export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
