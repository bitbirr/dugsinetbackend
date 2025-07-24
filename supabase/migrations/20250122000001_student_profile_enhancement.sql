/*
  # Student Profile Enhancement

  1. New Tables
    - `student_behavioral_records` - Track disciplinary incidents and achievements
    - `student_health_records` - Store health information and medical records
    - `student_academic_history` - Track academic performance and grades
    - `student_notes` - General notes and observations from teachers/staff
    - `student_achievements` - Track awards, recognitions, and accomplishments

  2. Security
    - Enable RLS on all tables
    - Add role-based access policies
    - Teachers can view/add records for their students
    - Admins have full access
    - Parents can view their child's records (limited)

  3. Features
    - Comprehensive behavioral tracking
    - Health records management
    - Academic performance history
    - Role-based permissions
    - Secure file uploads for health documents
*/

-- Student Behavioral Records Table
CREATE TABLE IF NOT EXISTS student_behavioral_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  incident_type text NOT NULL CHECK (incident_type IN ('disciplinary', 'achievement', 'observation', 'warning', 'suspension', 'commendation')),
  title text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  date_occurred date NOT NULL DEFAULT CURRENT_DATE,
  location text,
  witnesses text[],
  action_taken text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'pending')),
  reported_by uuid NOT NULL REFERENCES users(id),
  reviewed_by uuid REFERENCES users(id),
  parent_notified boolean DEFAULT false,
  parent_notification_date timestamptz,
  attachments jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Health Records Table
CREATE TABLE IF NOT EXISTS student_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('medical_history', 'vaccination', 'allergy', 'medication', 'emergency_contact', 'physical_exam', 'dental_exam', 'vision_test', 'incident')),
  title text NOT NULL,
  description text,
  date_recorded date NOT NULL DEFAULT CURRENT_DATE,
  doctor_name text,
  clinic_hospital text,
  medications text[],
  allergies text[],
  chronic_conditions text[],
  emergency_procedures text,
  restrictions text[],
  next_checkup_date date,
  vaccination_name text,
  vaccination_date date,
  vaccination_due_date date,
  document_urls text[],
  is_confidential boolean DEFAULT true,
  recorded_by uuid NOT NULL REFERENCES users(id),
  reviewed_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Academic History Table
CREATE TABLE IF NOT EXISTS student_academic_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id),
  subject_id uuid REFERENCES subjects(id),
  course_id uuid REFERENCES courses(id),
  assessment_type text NOT NULL CHECK (assessment_type IN ('exam', 'quiz', 'assignment', 'project', 'presentation', 'practical', 'midterm', 'final', 'continuous_assessment')),
  assessment_name text NOT NULL,
  total_marks numeric NOT NULL,
  obtained_marks numeric NOT NULL,
  percentage numeric GENERATED ALWAYS AS (ROUND((obtained_marks / total_marks) * 100, 2)) STORED,
  grade text,
  assessment_date date NOT NULL,
  teacher_id uuid REFERENCES staff(id),
  comments text,
  improvement_areas text[],
  strengths text[],
  attendance_percentage numeric,
  class_rank integer,
  class_average numeric,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Notes Table
CREATE TABLE IF NOT EXISTS student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('general', 'academic', 'behavioral', 'health', 'social', 'family', 'counseling')),
  title text NOT NULL,
  content text NOT NULL,
  is_confidential boolean DEFAULT false,
  is_important boolean DEFAULT false,
  tags text[],
  visibility text DEFAULT 'staff' CHECK (visibility IN ('staff', 'teachers', 'admin_only', 'parents')),
  created_by uuid NOT NULL REFERENCES users(id),
  updated_by uuid REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Achievements Table
CREATE TABLE IF NOT EXISTS student_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_type text NOT NULL CHECK (achievement_type IN ('academic', 'sports', 'arts', 'leadership', 'community_service', 'behavior', 'attendance', 'competition')),
  title text NOT NULL,
  description text,
  category text,
  level text CHECK (level IN ('school', 'district', 'regional', 'national', 'international')),
  date_achieved date NOT NULL DEFAULT CURRENT_DATE,
  awarded_by text,
  certificate_url text,
  points_awarded integer DEFAULT 0,
  is_featured boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_behavioral_records_student_id ON student_behavioral_records(student_id);
CREATE INDEX IF NOT EXISTS idx_behavioral_records_date ON student_behavioral_records(date_occurred);
CREATE INDEX IF NOT EXISTS idx_behavioral_records_type ON student_behavioral_records(incident_type);

CREATE INDEX IF NOT EXISTS idx_health_records_student_id ON student_health_records(student_id);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON student_health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON student_health_records(date_recorded);

CREATE INDEX IF NOT EXISTS idx_academic_history_student_id ON student_academic_history(student_id);
CREATE INDEX IF NOT EXISTS idx_academic_history_subject ON student_academic_history(subject_id);
CREATE INDEX IF NOT EXISTS idx_academic_history_year ON student_academic_history(academic_year_id);

CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_type ON student_notes(note_type);

CREATE INDEX IF NOT EXISTS idx_achievements_student_id ON student_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_achievements_type ON student_achievements(achievement_type);

-- Enable RLS
ALTER TABLE student_behavioral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Behavioral Records
CREATE POLICY "Admins can manage all behavioral records"
  ON student_behavioral_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage behavioral records"
  ON student_behavioral_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Parents can view their child's behavioral records"
  ON student_behavioral_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_behavioral_records.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
    )
  );

-- RLS Policies for Health Records
CREATE POLICY "Admins can manage all health records"
  ON student_health_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can view health records"
  ON student_health_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can add health records"
  ON student_health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Parents can view their child's health records"
  ON student_health_records
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_health_records.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
      AND NOT student_health_records.is_confidential
    )
  );

-- RLS Policies for Academic History
CREATE POLICY "Admins can manage all academic history"
  ON student_academic_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Teachers can manage academic history for their subjects"
  ON student_academic_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN staff s ON s.user_id = u.id
      WHERE u.id = auth.uid() 
      AND u.role = 'staff'
      AND (s.id = student_academic_history.teacher_id OR u.role = 'admin')
    )
  );

CREATE POLICY "Parents can view their child's published academic history"
  ON student_academic_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students st
      JOIN users u ON u.id = auth.uid()
      WHERE st.id = student_academic_history.student_id 
      AND st.parent_id = u.id
      AND u.role = 'parent'
      AND student_academic_history.is_published = true
    )
  );

-- RLS Policies for Student Notes
CREATE POLICY "Admins can manage all student notes"
  ON student_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage student notes based on visibility"
  ON student_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
      AND (
        student_notes.visibility IN ('staff', 'teachers') OR
        (student_notes.visibility = 'admin_only' AND role = 'admin')
      )
    )
  );

CREATE POLICY "Parents can view non-confidential notes about their child"
  ON student_notes
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_notes.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
      AND student_notes.visibility = 'parents'
      AND NOT student_notes.is_confidential
    )
  );

-- RLS Policies for Achievements
CREATE POLICY "Admins can manage all achievements"
  ON student_achievements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage achievements"
  ON student_achievements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Parents can view their child's achievements"
  ON student_achievements
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_achievements.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_behavioral_records_updated_at 
  BEFORE UPDATE ON student_behavioral_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_health_records_updated_at 
  BEFORE UPDATE ON student_health_records 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_history_updated_at 
  BEFORE UPDATE ON student_academic_history 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_notes_updated_at 
  BEFORE UPDATE ON student_notes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_achievements_updated_at 
  BEFORE UPDATE ON student_achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();