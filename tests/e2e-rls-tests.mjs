/**
 * Nashrik — End-to-End RLS Policy Validation
 * 
 * Creates fresh test accounts (or reuses existing ones), authenticates
 * as each role (student, club_admin, system_admin) and systematically
 * tests every Supabase table operation to verify RLS enforcement.
 * 
 * Usage: node tests/e2e-rls-tests.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Load .env ──────────────────────────────────────────────────────
const envPath = resolve(__dirname, '..', '.env')
const envContent = readFileSync(envPath, 'utf-8')
const env = {}
envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const [key, ...rest] = trimmed.split('=')
    env[key.trim()] = rest.join('=').trim()
})

const SUPABASE_URL = env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env')
    process.exit(1)
}

// ── Test accounts ──────────────────────────────────────────────────
const TEST_PASSWORD = 'TestPass123!'
const ACCOUNTS = {
    student:      { email: 'e2e-student@test.nashark',  password: TEST_PASSWORD, role: 'student',      fullName: 'E2E Student' },
    club_admin:   { email: 'e2e-clubadmin@test.nashark', password: TEST_PASSWORD, role: 'club_admin',   fullName: 'E2E Club Admin' },
    system_admin: { email: 'e2e-sysadmin@test.nashark',  password: TEST_PASSWORD, role: 'system_admin', fullName: 'E2E System Admin' },
}

// ── Helpers ─────────────────────────────────────────────────────────
let passed = 0
let failed = 0
const results = []

function log(icon, role, test, detail = '') {
    const msg = `  ${icon} [${role}] ${test}${detail ? ' — ' + detail : ''}`
    console.log(msg)
    results.push({ icon, role, test, detail, pass: icon === '✅' })
}
function pass(role, test, detail) { passed++; log('✅', role, test, detail) }
function fail(role, test, detail) { failed++; log('❌', role, test, detail) }

// Create an anon client for signup
function anonClient() {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: false, autoRefreshToken: false },
    })
}

// Sign up (or sign in if already exists)
async function getAuthenticatedClient(role) {
    const { email, password, fullName } = ACCOUNTS[role]
    const desiredRole = ACCOUNTS[role].role

    const client = anonClient()

    // Try sign in first
    const { data: signinData, error: signinErr } = await client.auth.signInWithPassword({ email, password })
    if (!signinErr && signinData?.user) {
        return { client, userId: signinData.user.id }
    }

    // Sign up
    console.log(`  📝 Creating test account: ${email} (${desiredRole})`)
    const { data: signupData, error: signupErr } = await client.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, student_id: `E2E-${role}`, role: desiredRole },
        },
    })

    if (signupErr) {
        console.error(`  ❌ Signup failed for ${role}: ${signupErr.message}`)
        return null
    }

    // For Supabase projects with email confirmation disabled, the user is auto-confirmed
    // Try signing in again
    const { data: retryData, error: retryErr } = await client.auth.signInWithPassword({ email, password })
    if (retryErr) {
        console.error(`  ❌ Post-signup sign-in failed for ${role}: ${retryErr.message}`)
        console.error(`     (If email confirmation is enabled, disable it in Supabase dashboard → Auth → Settings)`)
        return null
    }

    return { client, userId: retryData.user.id }
}

// ── Discover existing data to test against ──────────────────────────
async function discoverData(adminClient) {
    const data = { clubs: [], events: [], clubWithAdmin: null }

    // Find an approved club
    const { data: clubs } = await adminClient.from('clubs').select('id, name, admin_id, status').limit(10)
    data.clubs = clubs || []

    // Find a club with an admin (for club_admin tests)
    data.clubWithAdmin = (clubs || []).find(c => c.admin_id && c.status === 'approved')

    // Find published events
    const { data: events } = await adminClient.from('events').select('id, title, club_id, status').eq('status', 'published').limit(5)
    data.events = events || []

    return data
}

// ── Test Suites ─────────────────────────────────────────────────────

async function testProfiles(client, role, userId, allUserIds) {
    console.log(`\n  ── profiles ──`)

    // SELECT: Everyone can read all profiles
    {
        const { data, error } = await client.from('profiles').select('id, full_name, role').limit(10)
        if (!error && data?.length > 0) pass(role, 'SELECT profiles', `got ${data.length} rows`)
        else fail(role, 'SELECT profiles', error?.message)
    }

    // UPDATE own profile
    {
        const { error } = await client.from('profiles')
            .update({ full_name_ar: 'اختبار' })
            .eq('id', userId)

        if (!error) pass(role, 'UPDATE own profile')
        else fail(role, 'UPDATE own profile', error.message)

        // Revert
        await client.from('profiles').update({ full_name_ar: null }).eq('id', userId)
    }

    // UPDATE someone else's profile
    const otherId = allUserIds.find(id => id !== userId)
    if (otherId) {
        if (role !== 'system_admin') {
            const { data, error } = await client.from('profiles')
                .update({ full_name_ar: 'هاكر' })
                .eq('id', otherId)
                .select()

            if (!error && (!data || data.length === 0)) pass(role, 'UPDATE other profile BLOCKED')
            else if (error) pass(role, 'UPDATE other profile BLOCKED', error.message)
            else fail(role, 'UPDATE other profile BLOCKED', 'Should not be allowed')
        } else {
            const { data, error } = await client.from('profiles')
                .update({ full_name_ar: 'مدير' })
                .eq('id', otherId)
                .select()

            if (!error && data?.length > 0) pass(role, 'UPDATE other profile (admin)')
            else fail(role, 'UPDATE other profile (admin)', error?.message)

            // Revert
            await client.from('profiles').update({ full_name_ar: null }).eq('id', otherId)
        }
    }
}

async function testClubs(client, role, discoveredData) {
    console.log(`\n  ── clubs ──`)

    // SELECT approved clubs
    {
        const { data, error } = await client.from('clubs')
            .select('id, name, status')
            .eq('status', 'approved')

        if (!error && data?.length >= 0) pass(role, 'SELECT approved clubs', `got ${data.length}`)
        else fail(role, 'SELECT approved clubs', error?.message)
    }

    // SELECT pending clubs
    {
        const { data, error } = await client.from('clubs')
            .select('id, name, status')
            .eq('status', 'pending')

        if (role === 'student') {
            if (!error && (!data || data.length === 0)) pass(role, 'SELECT pending clubs HIDDEN')
            else if (data?.length > 0) fail(role, 'SELECT pending clubs HIDDEN', `saw ${data.length} pending clubs`)
            else pass(role, 'SELECT pending clubs HIDDEN')
        } else if (role === 'system_admin') {
            if (!error) pass(role, 'SELECT pending clubs (admin)', `got ${data?.length || 0}`)
            else fail(role, 'SELECT pending clubs (admin)', error?.message)
        } else {
            // club_admin: can see own clubs any status
            if (!error) pass(role, 'SELECT pending clubs', `got ${data?.length || 0}`)
            else fail(role, 'SELECT pending clubs', error?.message)
        }
    }

    // INSERT: Any authenticated user can create a club
    {
        const { data, error } = await client.from('clubs')
            .insert({
                name: `E2E Test Club (${role})`,
                category: 'academic',
                description: 'Created by E2E test',
                status: 'pending',
            })
            .select()
            .single()

        if (!error && data) {
            pass(role, 'INSERT club')
            // Clean up (only admin can delete, or we leave it)
            if (role === 'system_admin') {
                await client.from('clubs').delete().eq('id', data.id)
            }
        } else {
            fail(role, 'INSERT club', error?.message)
        }
    }

    // UPDATE: student can't update any club, club_admin can update own
    if (role === 'student' && discoveredData.clubWithAdmin) {
        const { data, error } = await client.from('clubs')
            .update({ description: 'Hacked' })
            .eq('id', discoveredData.clubWithAdmin.id)
            .select()

        if (!error && (!data || data.length === 0)) pass(role, 'UPDATE club BLOCKED')
        else if (error) pass(role, 'UPDATE club BLOCKED', error.message)
        else fail(role, 'UPDATE club BLOCKED', 'Should not be allowed')
    }

    // System admin: UPDATE any club
    if (role === 'system_admin' && discoveredData.clubs.length > 0) {
        const targetClub = discoveredData.clubs[0]
        const origDesc = targetClub.description
        const { data, error } = await client.from('clubs')
            .update({ description: 'Admin test update' })
            .eq('id', targetClub.id)
            .select()

        if (!error && data?.length > 0) pass(role, 'UPDATE any club (admin)')
        else fail(role, 'UPDATE any club (admin)', error?.message)

        // Revert
        await client.from('clubs').update({ description: origDesc || null }).eq('id', targetClub.id)
    }
}

async function testEvents(client, role, discoveredData) {
    console.log(`\n  ── events ──`)

    // SELECT published events
    {
        const { data, error } = await client.from('events')
            .select('id, title, status')
            .eq('status', 'published')

        if (!error && data?.length >= 0) pass(role, 'SELECT published events', `got ${data.length}`)
        else fail(role, 'SELECT published events', error?.message)
    }

    // Student should NOT be able to insert events
    if (role === 'student' && discoveredData.clubs.length > 0) {
        const { data, error } = await client.from('events')
            .insert({
                title: 'Unauthorized Event',
                club_id: discoveredData.clubs[0].id,
                date: new Date().toISOString(),
                category: 'academic',
                status: 'draft',
            })
            .select()

        if (error) pass(role, 'INSERT event BLOCKED', error.message)
        else fail(role, 'INSERT event BLOCKED', 'Should not be allowed')
    }

    // System admin: UPDATE any event
    if (role === 'system_admin' && discoveredData.events.length > 0) {
        const ev = discoveredData.events[0]
        const { data, error } = await client.from('events')
            .update({ is_featured: !ev.is_featured })
            .eq('id', ev.id)
            .select()

        if (!error && data?.length > 0) pass(role, 'UPDATE any event (admin)')
        else fail(role, 'UPDATE any event (admin)', error?.message)

        // Revert
        await client.from('events').update({ is_featured: ev.is_featured }).eq('id', ev.id)
    }
}

async function testRegistrations(client, role, userId, discoveredData) {
    console.log(`\n  ── event_registrations ──`)

    // SELECT own registrations
    {
        const { data, error } = await client.from('event_registrations')
            .select('id, event_id, status')
            .eq('user_id', userId)

        if (!error) pass(role, 'SELECT own registrations', `got ${data?.length || 0}`)
        else fail(role, 'SELECT own registrations', error.message)
    }

    // Student: Register for an event, then cancel
    if (role === 'student' && discoveredData.events.length > 0) {
        const eventId = discoveredData.events[0].id
        const { data, error } = await client.from('event_registrations')
            .insert({ event_id: eventId, user_id: userId, status: 'confirmed' })
            .select()
            .single()

        if (!error && data) {
            pass(role, 'INSERT registration')
            const { error: delErr } = await client.from('event_registrations')
                .delete().eq('id', data.id)
            if (!delErr) pass(role, 'DELETE registration (cancel)')
            else fail(role, 'DELETE registration (cancel)', delErr.message)
        } else {
            // Might fail if already registered
            if (error?.message?.includes('duplicate')) pass(role, 'INSERT registration (already exists)')
            else fail(role, 'INSERT registration', error?.message)
        }
    }

    // System admin: SELECT all registrations
    if (role === 'system_admin') {
        const { data, error } = await client.from('event_registrations')
            .select('id, event_id, user_id')
            .limit(10)

        if (!error) pass(role, 'SELECT all registrations (admin)', `got ${data?.length || 0}`)
        else fail(role, 'SELECT all registrations (admin)', error.message)
    }
}

async function testMemberships(client, role, userId, discoveredData) {
    console.log(`\n  ── club_memberships ──`)

    // SELECT own memberships
    {
        const { data, error } = await client.from('club_memberships')
            .select('id, club_id, status')
            .eq('user_id', userId)

        if (!error) pass(role, 'SELECT own memberships', `got ${data?.length || 0}`)
        else fail(role, 'SELECT own memberships', error.message)
    }

    // Student: Join a club, then leave
    if (role === 'student' && discoveredData.clubs.filter(c => c.status === 'approved').length > 0) {
        const club = discoveredData.clubs.find(c => c.status === 'approved')
        const { data, error } = await client.from('club_memberships')
            .insert({ club_id: club.id, user_id: userId, status: 'pending' })
            .select()
            .single()

        if (!error && data) {
            pass(role, 'INSERT membership (join club)')
            const { error: delErr } = await client.from('club_memberships')
                .delete().eq('id', data.id)
            if (!delErr) pass(role, 'DELETE membership (leave club)')
            else fail(role, 'DELETE membership (leave club)', delErr.message)
        } else {
            if (error?.message?.includes('duplicate')) pass(role, 'INSERT membership (already member)')
            else fail(role, 'INSERT membership', error?.message)
        }
    }

    // System admin: SELECT all memberships
    if (role === 'system_admin') {
        const { data, error } = await client.from('club_memberships')
            .select('id, club_id, user_id, status')
            .limit(10)

        if (!error) pass(role, 'SELECT all memberships (admin)', `got ${data?.length || 0}`)
        else fail(role, 'SELECT all memberships (admin)', error.message)
    }
}

async function testAnnouncements(client, role, userId, discoveredData) {
    console.log(`\n  ── announcements ──`)

    // Everyone can SELECT announcements
    {
        const { data, error } = await client.from('announcements')
            .select('id, title, club_id')
            .limit(5)

        if (!error) pass(role, 'SELECT announcements', `got ${data?.length || 0}`)
        else fail(role, 'SELECT announcements', error?.message)
    }

    // Student should NOT be able to insert announcements
    if (role === 'student' && discoveredData.clubs.length > 0) {
        const { error } = await client.from('announcements')
            .insert({
                club_id: discoveredData.clubs[0].id,
                title: 'Unauthorized',
                content: 'Should fail',
                author_id: userId,
            })
            .select()

        if (error) pass(role, 'INSERT announcement BLOCKED', error.message)
        else fail(role, 'INSERT announcement BLOCKED', 'Should not be allowed')
    }

    // System admin: INSERT announcement for any club
    if (role === 'system_admin' && discoveredData.clubs.length > 0) {
        const club = discoveredData.clubs.find(c => c.status === 'approved') || discoveredData.clubs[0]
        const { data, error } = await client.from('announcements')
            .insert({
                club_id: club.id,
                title: 'E2E Admin Announcement',
                content: 'Testing admin insert',
                author_id: userId,
            })
            .select()
            .single()

        if (!error && data) {
            pass(role, 'INSERT announcement (admin)')
            await client.from('announcements').delete().eq('id', data.id)
        } else {
            fail(role, 'INSERT announcement (admin)', error?.message)
        }
    }
}

async function testNotifications(client, role, userId) {
    console.log(`\n  ── notifications ──`)

    // SELECT own notifications
    {
        const { data, error } = await client.from('notifications')
            .select('id, title, read')
            .eq('user_id', userId)
            .limit(5)

        if (!error) pass(role, 'SELECT own notifications', `got ${data?.length || 0}`)
        else fail(role, 'SELECT own notifications', error.message)
    }

    // System admin: INSERT notification for another user
    if (role === 'system_admin') {
        // Get any other user
        const { data: users } = await client.from('profiles').select('id').neq('id', userId).limit(1)
        if (users?.length > 0) {
            const targetUserId = users[0].id
            const { data, error } = await client.from('notifications')
                .insert({
                    user_id: targetUserId,
                    type: 'system',
                    title: 'E2E Test Notification',
                    message: 'Test from admin',
                })
                .select()
                .single()

            if (!error && data) {
                pass(role, 'INSERT notification for user')
                // Clean up is tricky since admin might not own it — leave it
            } else {
                fail(role, 'INSERT notification for user', error?.message)
            }
        }
    }

    // Non-admin should NOT insert notifications for others
    if (role === 'student') {
        const { data: users } = await client.from('profiles').select('id').neq('id', userId).limit(1)
        if (users?.length > 0) {
            const { error } = await client.from('notifications')
                .insert({
                    user_id: users[0].id,
                    type: 'system',
                    title: 'Unauthorized notification',
                    message: 'Should fail',
                })
                .select()

            if (error) pass(role, 'INSERT notification for others BLOCKED', error.message)
            else fail(role, 'INSERT notification for others BLOCKED', 'Should not be allowed')
        }
    }
}

async function testComments(client, role, userId, discoveredData) {
    console.log(`\n  ── event_comments ──`)

    if (discoveredData.events.length === 0) {
        pass(role, 'SKIP comments', 'No events to test against')
        return
    }

    const eventId = discoveredData.events[0].id

    // SELECT comments
    {
        const { data, error } = await client.from('event_comments')
            .select('id, content, user_id')
            .eq('event_id', eventId)
            .limit(5)

        if (!error) pass(role, 'SELECT event comments', `got ${data?.length || 0}`)
        else fail(role, 'SELECT event comments', error?.message)
    }

    // INSERT a comment
    {
        const { data, error } = await client.from('event_comments')
            .insert({ event_id: eventId, user_id: userId, content: `E2E test comment (${role})` })
            .select()
            .single()

        if (!error && data) {
            pass(role, 'INSERT comment')
            // DELETE own comment
            const { error: delErr } = await client.from('event_comments').delete().eq('id', data.id)
            if (!delErr) pass(role, 'DELETE own comment')
            else fail(role, 'DELETE own comment', delErr.message)
        } else {
            fail(role, 'INSERT comment', error?.message)
        }
    }
}

// ── Trigger Tests ──────────────────────────────────────────────────
async function testTriggers(client, role, userId, discoveredData) {
    if (role !== 'student' || discoveredData.events.length === 0) return

    console.log(`\n  ── triggers (registration count) ──`)

    const eventId = discoveredData.events[0].id

    // Get current count
    const { data: before } = await client.from('events')
        .select('registered_count')
        .eq('id', eventId)
        .single()

    const beforeCount = before?.registered_count || 0

    // Register
    const { data: reg, error: regErr } = await client.from('event_registrations')
        .insert({ event_id: eventId, user_id: userId, status: 'confirmed' })
        .select()
        .single()

    if (regErr) {
        if (regErr.message?.includes('duplicate')) pass(role, 'TRIGGER test (already registered)')
        else fail(role, 'TRIGGER register', regErr.message)
        return
    }

    // Wait for trigger
    await new Promise(r => setTimeout(r, 500))

    // Check count incremented
    const { data: after } = await client.from('events')
        .select('registered_count')
        .eq('id', eventId)
        .single()

    if (after && after.registered_count === beforeCount + 1) {
        pass(role, 'TRIGGER registered_count +1')
    } else {
        fail(role, 'TRIGGER registered_count +1', `expected ${beforeCount + 1}, got ${after?.registered_count}`)
    }

    // Cancel (delete)
    await client.from('event_registrations').delete().eq('id', reg.id)
    await new Promise(r => setTimeout(r, 500))

    const { data: afterDel } = await client.from('events')
        .select('registered_count')
        .eq('id', eventId)
        .single()

    if (afterDel && afterDel.registered_count === beforeCount) {
        pass(role, 'TRIGGER registered_count -1 (cancel)')
    } else {
        fail(role, 'TRIGGER registered_count -1', `expected ${beforeCount}, got ${afterDel?.registered_count}`)
    }
}

// ── Main Runner ─────────────────────────────────────────────────────

async function runAllTests() {
    console.log('╔══════════════════════════════════════════════════════════╗')
    console.log('║    Nashrik — End-to-End RLS Policy Validation           ║')
    console.log('╚══════════════════════════════════════════════════════════╝')
    console.log(`\n🔗 Supabase: ${SUPABASE_URL}\n`)

    const roles = ['student', 'club_admin', 'system_admin']
    const userIds = {}

    // ── Step 1: Authenticate all roles ──────────────────────────────
    console.log('🔑 Authenticating test accounts...\n')
    for (const role of roles) {
        const result = await getAuthenticatedClient(role)
        if (!result) {
            fail(role, 'AUTH', 'Could not sign in or create account')
            continue
        }
        userIds[role] = { client: result.client, userId: result.userId }
        pass(role, 'AUTH', `Signed in as ${ACCOUNTS[role].email} (${result.userId.substring(0, 8)}...)`)
    }

    // Check if we have at least the student and system_admin
    if (!userIds.student || !userIds.system_admin) {
        console.error('\n❌ Cannot proceed without student and system_admin accounts')
        process.exit(1)
    }

    // ── Step 2: Discover existing data ──────────────────────────────
    console.log('\n📊 Discovering existing data...')
    const adminClient = userIds.system_admin.client
    const discoveredData = await discoverData(adminClient)
    console.log(`   Found ${discoveredData.clubs.length} clubs, ${discoveredData.events.length} events`)
    if (discoveredData.clubWithAdmin) {
        console.log(`   Club with admin: "${discoveredData.clubWithAdmin.name}" (admin: ${discoveredData.clubWithAdmin.admin_id?.substring(0, 8)}...)`)
    }

    // ── Step 3: Run all test suites ─────────────────────────────────
    const allUserIdsList = Object.values(userIds).map(u => u.userId)

    for (const role of roles) {
        if (!userIds[role]) continue

        console.log(`\n${'═'.repeat(56)}`)
        console.log(`  🔑 Role: ${role.toUpperCase()}`)
        console.log(`${'═'.repeat(56)}`)

        const { client, userId } = userIds[role]

        await testProfiles(client, role, userId, allUserIdsList)
        await testClubs(client, role, discoveredData)
        await testEvents(client, role, discoveredData)
        await testRegistrations(client, role, userId, discoveredData)
        await testMemberships(client, role, userId, discoveredData)
        await testAnnouncements(client, role, userId, discoveredData)
        await testNotifications(client, role, userId)
        await testComments(client, role, userId, discoveredData)
        await testTriggers(client, role, userId, discoveredData)
    }

    // Sign out all
    for (const role of roles) {
        if (userIds[role]) await userIds[role].client.auth.signOut()
    }

    // ── Summary ─────────────────────────────────────────────────────
    console.log(`\n${'═'.repeat(56)}`)
    console.log(`  📊 RESULTS SUMMARY`)
    console.log(`${'═'.repeat(56)}`)
    console.log(`  ✅ Passed:  ${passed}`)
    console.log(`  ❌ Failed:  ${failed}`)
    console.log(`  📝 Total:   ${passed + failed}`)
    console.log(`${'═'.repeat(56)}\n`)

    if (failed > 0) {
        console.log('⚠️  Some tests FAILED — review the output above.\n')
        process.exit(1)
    } else {
        console.log('🎉 All RLS policies validated successfully!\n')
        process.exit(0)
    }
}

runAllTests().catch(err => {
    console.error('💥 Unhandled error:', err)
    process.exit(1)
})
