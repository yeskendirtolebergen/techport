-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TEACHERS TABLE (Core Profile Data)
-- =====================================================
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    iin TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    date_of_birth DATE,
    graduated_school TEXT,
    total_experience_years INTEGER,
    current_workplace TEXT,
    current_school_experience INTEGER,
    subject TEXT,
    category TEXT,
    category_expiration DATE,
    is_homeroom_teacher BOOLEAN DEFAULT false,
    advanced_degree TEXT, -- Master's/Doctorate/Internship
    photo_url TEXT,
    role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CERTIFICATIONS TABLE
-- =====================================================
CREATE TABLE certifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    tat_2026 INTEGER CHECK (tat_2026 >= 0 AND tat_2026 <= 100),
    tat_2025 INTEGER CHECK (tat_2025 >= 0 AND tat_2025 <= 100),
    tat_2024 INTEGER CHECK (tat_2024 >= 0 AND tat_2024 <= 100),
    tor_score DECIMAL(5,2),
    ielts_score DECIMAL(3,1),
    toefl_score INTEGER,
    tesol BOOLEAN DEFAULT false,
    celta BOOLEAN DEFAULT false,
    ib_certificate BOOLEAN DEFAULT false,
    ap_certificate BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- STUDENT RESULTS TABLE (Flexible JSON Structure)
-- =====================================================
CREATE TABLE student_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    result_type TEXT NOT NULL, -- 'BTS', 'KBO', 'Regional Olympiad', etc.
    year INTEGER NOT NULL,
    data JSONB NOT NULL, -- Flexible structure for different result types
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SKILLS MASTER TABLE
-- =====================================================
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT, -- e.g., 'Technical', 'Pedagogical', 'Leadership'
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEACHER SKILLS (Junction Table with Status Tracking)
-- =====================================================
CREATE TABLE teacher_skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'approved', 'rejected')),
    started_at DATE,
    completed_at DATE,
    approved_by UUID REFERENCES teachers(id), -- Admin who approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, skill_id)
);

-- =====================================================
-- YEARLY GOALS MASTER TABLE
-- =====================================================
CREATE TABLE yearly_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    year INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TEACHER GOALS (Junction Table with Progress Tracking)
-- =====================================================
CREATE TABLE teacher_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    goal_id UUID REFERENCES yearly_goals(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed', 'approved', 'rejected')),
    progress_notes TEXT,
    target_date DATE,
    completed_at DATE,
    approved_by UUID REFERENCES teachers(id), -- Admin who approved
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(teacher_id, goal_id)
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_teachers_iin ON teachers(iin);
CREATE INDEX idx_teachers_email ON teachers(email);
CREATE INDEX idx_teachers_role ON teachers(role);
CREATE INDEX idx_certifications_teacher_id ON certifications(teacher_id);
CREATE INDEX idx_student_results_teacher_id ON student_results(teacher_id);
CREATE INDEX idx_teacher_skills_teacher_id ON teacher_skills(teacher_id);
CREATE INDEX idx_teacher_goals_teacher_id ON teacher_goals(teacher_id);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_teachers_updated_at BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_certifications_updated_at BEFORE UPDATE ON certifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_skills_updated_at BEFORE UPDATE ON teacher_skills
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_goals_updated_at BEFORE UPDATE ON teacher_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) SETUP
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE yearly_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_goals ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_email TEXT)
RETURNS TEXT AS $$
    SELECT role FROM teachers WHERE email = user_email;
$$ LANGUAGE SQL SECURITY DEFINER;

-- =====================================================
-- TEACHERS TABLE POLICIES
-- =====================================================
CREATE POLICY "Admins can view all teachers"
    ON teachers FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

CREATE POLICY "Teachers can view own profile"
    ON teachers FOR SELECT
    TO authenticated
    USING (email = auth.jwt()->>'email');

CREATE POLICY "Teachers can update own profile"
    ON teachers FOR UPDATE
    TO authenticated
    USING (email = auth.jwt()->>'email')
    WITH CHECK (
        email = auth.jwt()->>'email' AND 
        iin = (SELECT iin FROM teachers WHERE email = auth.jwt()->>'email')
    );

CREATE POLICY "Admins can update any teacher"
    ON teachers FOR UPDATE
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- CERTIFICATIONS POLICIES
-- =====================================================
CREATE POLICY "Admins can view all certifications"
    ON certifications FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

CREATE POLICY "Teachers can view own certifications"
    ON certifications FOR SELECT
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage certifications"
    ON certifications FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- STUDENT RESULTS POLICIES
-- =====================================================
CREATE POLICY "Admins can view all student results"
    ON student_results FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

CREATE POLICY "Teachers can view own student results"
    ON student_results FOR SELECT
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage student results"
    ON student_results FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- SKILLS POLICIES
-- =====================================================
CREATE POLICY "Everyone can view active skills"
    ON skills FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage skills"
    ON skills FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- TEACHER SKILLS POLICIES
-- =====================================================
CREATE POLICY "Admins can view all teacher skills"
    ON teacher_skills FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

CREATE POLICY "Teachers can view own skills"
    ON teacher_skills FOR SELECT
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage teacher skills"
    ON teacher_skills FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- YEARLY GOALS POLICIES
-- =====================================================
CREATE POLICY "Everyone can view active goals"
    ON yearly_goals FOR SELECT
    TO authenticated
    USING (is_active = true);

CREATE POLICY "Admins can manage yearly goals"
    ON yearly_goals FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- TEACHER GOALS POLICIES
-- =====================================================
CREATE POLICY "Admins can view all teacher goals"
    ON teacher_goals FOR SELECT
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

CREATE POLICY "Teachers can view own goals"
    ON teacher_goals FOR SELECT
    TO authenticated
    USING (teacher_id IN (SELECT id FROM teachers WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Admins can manage teacher goals"
    ON teacher_goals FOR ALL
    TO authenticated
    USING (get_user_role(auth.jwt()->>'email') = 'admin');

-- =====================================================
-- STORAGE BUCKET SETUP (Run this manually in Supabase)
-- =====================================================
-- Instructions:
-- 1. Go to Storage in Supabase Dashboard
-- 2. Create a bucket named 'profile-photos'
-- 3. Make it public
-- 4. Add the following policies:

-- Storage policy for uploads (teachers can upload their own photo)
-- CREATE POLICY "Teachers can upload own photo"
--     ON storage.objects FOR INSERT
--     TO authenticated
--     WITH CHECK (
--         bucket_id = 'profile-photos' AND
--         (storage.foldername(name))[1] = (SELECT id::text FROM teachers WHERE email = auth.jwt()->>'email')
--     );

-- Storage policy for updates
-- CREATE POLICY "Teachers can update own photo"
--     ON storage.objects FOR UPDATE
--     TO authenticated
--     USING (
--         bucket_id = 'profile-photos' AND
--         (storage.foldername(name))[1] = (SELECT id::text FROM teachers WHERE email = auth.jwt()->>'email')
--     );

-- Storage policy for viewing (public)
-- CREATE POLICY "Anyone can view profile photos"
--     ON storage.objects FOR SELECT
--     TO public
--     USING (bucket_id = 'profile-photos');
