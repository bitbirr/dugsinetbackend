/*
  # Student Profile Module - Comprehensive student management

  1. New Tables
    - `student_health_records` - Health information and medical records
    - `student_behavioral_records` - Disciplinary incidents and achievements
    - `student_academic_history` - Academic performance and history
    - `student_notes` - General notes and observations
    - `student_emergency_contacts` - Emergency contact information

  2. Security
    - Enable RLS on all tables
    - Add role-based access policies
    - Secure data access based on user roles and relationships

  3. Features
    - Comprehensive health tracking
    - Behavioral incident and achievement logging
    - Academic history management
    - Emergency contact management
    - Role-based permissions (admin, staff, teacher, parent)
*/

-- Student Health Records Table
CREATE TABLE IF NOT EXISTS student_health_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('medical_condition', 'allergy', 'medication', 'vaccination', 'injury', 'illness', 'checkup')),
  title text NOT NULL,
  description text,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  date_recorded date NOT NULL DEFAULT CURRENT_DATE,
  expiry_date date,
  doctor_name text,
  hospital_clinic text,
  medication_dosage text,
  special_instructions text,
  attachments jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  requires_attention boolean DEFAULT false,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Behavioral Records Table
CREATE TABLE IF NOT EXISTS student_behavioral_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  record_type text NOT NULL CHECK (record_type IN ('incident', 'achievement', 'observation', 'warning', 'suspension', 'commendation')),
  category text NOT NULL, -- e.g., 'academic', 'social', 'disciplinary', 'leadership'
  title text NOT NULL,
  description text NOT NULL,
  severity text CHECK (severity IN ('minor', 'moderate', 'major', 'severe')),
  date_occurred date NOT NULL DEFAULT CURRENT_DATE,
  location text,
  witnesses text[],
  action_taken text,
  follow_up_required boolean DEFAULT false,
  follow_up_date date,
  parent_notified boolean DEFAULT false,
  parent_notification_date timestamptz,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'ongoing')),
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Academic History Table
CREATE TABLE IF NOT EXISTS student_academic_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  academic_year_id uuid REFERENCES academic_years(id),
  subject_id uuid REFERENCES subjects(id),
  grade_level integer NOT NULL,
  term text NOT NULL, -- e.g., 'Term 1', 'Semester 1', 'Quarter 1'
  assessment_type text NOT NULL CHECK (assessment_type IN ('exam', 'quiz', 'assignment', 'project', 'participation', 'final_grade')),
  assessment_name text NOT NULL,
  score numeric(5,2),
  max_score numeric(5,2),
  percentage numeric(5,2),
  grade text,
  remarks text,
  teacher_id uuid REFERENCES staff(id),
  date_assessed date NOT NULL DEFAULT CURRENT_DATE,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Notes Table
CREATE TABLE IF NOT EXISTS student_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  note_type text NOT NULL CHECK (note_type IN ('general', 'academic', 'behavioral', 'health', 'parent_communication', 'teacher_observation')),
  title text NOT NULL,
  content text NOT NULL,
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_confidential boolean DEFAULT false,
  visible_to_parents boolean DEFAULT false,
  tags text[],
  attachments jsonb DEFAULT '[]'::jsonb,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Student Emergency Contacts Table (Enhanced)
CREATE TABLE IF NOT EXISTS student_emergency_contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  contact_type text NOT NULL CHECK (contact_type IN ('primary', 'secondary', 'medical', 'pickup_authorized')),
  full_name text NOT NULL,
  relationship text NOT NULL,
  phone_primary text NOT NULL,
  phone_secondary text,
  email text,
  address text,
  workplace text,
  workplace_phone text,
  medical_authority boolean DEFAULT false,
  pickup_authority boolean DEFAULT false,
  priority_order integer DEFAULT 1,
  is_active boolean DEFAULT true,
  notes text,
  created_by uuid NOT NULL REFERENCES users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_health_records_student_id ON student_health_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_health_records_type ON student_health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_student_health_records_active ON student_health_records(is_active);

CREATE INDEX IF NOT EXISTS idx_student_behavioral_records_student_id ON student_behavioral_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_behavioral_records_type ON student_behavioral_records(record_type);
CREATE INDEX IF NOT EXISTS idx_student_behavioral_records_status ON student_behavioral_records(status);

CREATE INDEX IF NOT EXISTS idx_student_academic_history_student_id ON student_academic_history(student_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_year ON student_academic_history(academic_year_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_history_subject ON student_academic_history(subject_id);

CREATE INDEX IF NOT EXISTS idx_student_notes_student_id ON student_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_notes_type ON student_notes(note_type);

CREATE INDEX IF NOT EXISTS idx_student_emergency_contacts_student_id ON student_emergency_contacts(student_id);
CREATE INDEX IF NOT EXISTS idx_student_emergency_contacts_type ON student_emergency_contacts(contact_type);

-- Enable Row Level Security
ALTER TABLE student_health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_behavioral_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academic_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_emergency_contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for student_health_records
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

CREATE POLICY "Staff can manage health records"
  ON student_health_records
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('staff', 'teacher')
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
    )
  );

-- RLS Policies for student_behavioral_records
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
      WHERE id = auth.uid() AND role IN ('staff', 'teacher')
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

-- RLS Policies for student_academic_history
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

CREATE POLICY "Staff can manage academic history"
  ON student_academic_history
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('staff', 'teacher')
    )
  );

CREATE POLICY "Parents can view their child's academic history"
  ON student_academic_history
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_academic_history.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
    )
  );

-- RLS Policies for student_notes
CREATE POLICY "Admins can manage all notes"
  ON student_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage notes"
  ON student_notes
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('staff', 'teacher')
    )
  );

CREATE POLICY "Parents can view non-confidential notes"
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
      AND (student_notes.is_confidential = false OR student_notes.visible_to_parents = true)
    )
  );

-- RLS Policies for student_emergency_contacts
CREATE POLICY "Admins can manage all emergency contacts"
  ON student_emergency_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Staff can manage emergency contacts"
  ON student_emergency_contacts
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('staff', 'teacher')
    )
  );

CREATE POLICY "Parents can view their child's emergency contacts"
  ON student_emergency_contacts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM students s
      JOIN users u ON u.id = auth.uid()
      WHERE s.id = student_emergency_contacts.student_id 
      AND s.parent_id = u.id
      AND u.role = 'parent'
    )
  );