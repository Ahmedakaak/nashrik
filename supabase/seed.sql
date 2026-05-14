-- ============================================
-- Nashark (نشارك) - Local Seed Data
-- Run this to populate your local Supabase instance
-- ============================================

-- 1. Create Users (passwords are 'password123')
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student@dev.nashark', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sara Al-Habsi","student_id":"21F1234","role":"student"}', NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'club_admin@dev.nashark', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Noor Al-Busaidi","student_id":"20F0001","role":"club_admin"}', NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'system_admin@dev.nashark', crypt('password123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Dr. Ahmed Al-Siyabi","student_id":"","role":"system_admin"}', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Note: Identities are required for Supabase login to work properly
INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', format('{"sub":"%s","email":"%s"}', '11111111-1111-1111-1111-111111111111', 'student@dev.nashark')::jsonb, 'email', NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', format('{"sub":"%s","email":"%s"}', '22222222-2222-2222-2222-222222222222', 'club_admin@dev.nashark')::jsonb, 'email', NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', format('{"sub":"%s","email":"%s"}', '33333333-3333-3333-3333-333333333333', 'system_admin@dev.nashark')::jsonb, 'email', NOW(), NOW(), NOW())
ON CONFLICT (provider_id, provider) DO NOTHING;

-- Note: The `handle_new_user` trigger will have automatically created the rows in the `profiles` table!

-- 2. Create Clubs
INSERT INTO clubs (id, name, name_ar, description, description_ar, category, admin_id, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Tech Innovators Society', 'جمعية المبتكرين التقنيين', 'A club for students passionate about coding, AI, and modern web development.', 'نادي للطلاب الشغوفين بالبرمجة والذكاء الاصطناعي.', 'academic', '22222222-2222-2222-2222-222222222222', 'approved'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'UTAS Photography', 'نادي التصوير الضوئي', 'Capturing the best moments around the campus.', 'توثيق أجمل اللحظات في الحرم الجامعي.', 'cultural', NULL, 'approved'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Future Leaders', 'قادة المستقبل', 'Developing leadership skills for tomorrow.', 'تطوير المهارات القيادية للغد.', 'community', NULL, 'pending')
ON CONFLICT (id) DO NOTHING;

-- 3. Create Events
INSERT INTO events (id, title, title_ar, description, description_ar, club_id, date, end_date, location, location_ar, category, status, is_featured, max_capacity)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'Intro to React & Tailwind', 'مقدمة في ريآكت وتيلويند', 'Learn the basics of building modern web interfaces.', 'تعلم أساسيات بناء واجهات الويب الحديثة.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days 2 hours', 'IT Lab 4', 'مختبر تقنية المعلومات 4', 'academic', 'published', true, 30),
  ('10000000-0000-0000-0000-000000000002', 'Campus Photo Walk', 'جولة التصوير الجامعية', 'Join us for a golden hour photo walk around the campus.', 'انضم إلينا في جولة تصوير خلال الساعة الذهبية.', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days 3 hours', 'Main Gate', 'البوابة الرئيسية', 'cultural', 'published', false, 20),
  ('10000000-0000-0000-0000-000000000003', 'AI Hackathon 2026', 'هاكاثون الذكاء الاصطناعي', 'A 24-hour hackathon to build AI tools.', 'هاكاثون لمدة 24 ساعة لبناء أدوات الذكاء الاصطناعي.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() + INTERVAL '14 days', NOW() + INTERVAL '15 days', 'Main Auditorium', 'القاعة الرئيسية', 'academic', 'published', true, 100)
ON CONFLICT (id) DO NOTHING;

-- 4. Create Memberships
INSERT INTO club_memberships (club_id, user_id, status)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'approved'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'pending')
ON CONFLICT (club_id, user_id) DO NOTHING;

-- 5. Create Event Registrations
INSERT INTO event_registrations (event_id, user_id, status, attended, qr_token)
VALUES
  ('10000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'confirmed', false, 'test-qr-token-react-123'),
  ('10000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'confirmed', false, 'test-qr-token-hackathon')
ON CONFLICT (event_id, user_id) DO NOTHING;

-- 6. Create Announcements
INSERT INTO announcements (club_id, title, title_ar, content, content_ar, priority, author_id)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Welcome to the New Semester!', 'أهلاً بكم في الفصل الدراسي الجديد', 'We have an amazing lineup of workshops this semester. Stay tuned!', 'لدينا مجموعة رائعة من الورش هذا الفصل. كونوا على الموعد!', 'high', '22222222-2222-2222-2222-222222222222');
