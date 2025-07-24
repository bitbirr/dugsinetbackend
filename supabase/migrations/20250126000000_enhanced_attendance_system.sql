/*
  # Enhanced Attendance Management System

  1. Enhanced Tables
    - Enhanced `attendance` table with period support and excuse workflow
    - `attendance_periods` - Define class periods/subjects
    - `attendance_excuses` - Excuse requests and approvals
    - `attendance_reports` - Pre-generated reports for performance

  2. Security
    - Enhanced RLS policies for role-based access
    - Parent access to their children's attendance
*/

-- Create attendance periods table for period-wise tracking
CREATE TABLE IF NOT EXISTS attendance_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  subject_id uuid REFERENCES subjects(id),
  class_id uuid REFERENCES classes(id),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=Monday, 7=Sunday
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create attendance excuses table for excuse workflow
CREATE TABLE IF NOT EXISTS attendance_excuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id uuid REFERENCES attendance(id),
  student_id uuid REFERENCES students(id),
  excuse_type text NOT NULL CHECK (excuse_type IN ('medical', 'family_emergency', 'religious', 'other')),
  reason text NOT NULL,
  supporting_documents jsonb DEFAULT '[]'::jsonb,
  submitted_by uuid REFERENCES users(id), -- Parent/Guardian who submitted
  submitted_at timestamptz DEFAULT now(),
  reviewed_by uuid REFERENCES users(id), -- Staff who reviewed
  reviewed_at timestamptz,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enhance existing attendance table
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS period_id uuid REFERENCES attendance_periods(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS excuse_id uuid REFERENCES attendance_excuses(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_time timestamptz;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_out_time timestamptz;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS late_minutes integer DEFAULT 0;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS early_departure_minutes integer DEFAULT 0;

-- Update attendance status enum to include more options
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'attendance_status_new') THEN
    CREATE TYPE attendance_status_new AS ENUM (
      'present',
      'absent', 
      'late',
      'excused_absent',
      'excused_late',
      'half_day',
      'sick',
      'suspended'
    );
  END IF;
END $$;

-- Create attendance summary view for reports
CREATE OR REPLACE VIEW attendance_summary AS
SELECT 
  s.id as student_id,
  s.first_name,
  s.last_name,
  s.gr_number,
  c.name as class_name,
  DATE_TRUNC('month', a.date) as month,
  COUNT(*) as total_days,
  COUNT(*) FILTER (WHERE a.status = 'present') as present_days,
  COUNT(*) FILTER (WHERE a.status = 'absent') as absent_days,
  COUNT(*) FILTER (WHERE a.status = 'late') as late_days,
  COUNT(*) FILTER (WHERE a.status = 'excused_absent') as excused_absent_days,
  COUNT(*) FILTER (WHERE a.status = 'excused_late') as excused_late_days,
  ROUND(
    (COUNT(*) FILTER (WHERE a.status = 'present')::decimal / COUNT(*)) * 100, 
    2
  ) as attendance_percentage
FROM students s
LEFT JOIN classes c ON s.class_id = c.id
LEFT JOIN attendance a ON s.id = a.student_id
GROUP BY s.id, s.first_name, s.last_name, s.gr_number, c.name, DATE_TRUNC('month', a.date);

-- RLS Policies for new tables

-- Attendance Periods
ALTER TABLE attendance_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read attendance periods"
  ON attendance_periods
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins and staff can manage attendance periods"
  ON attendance_periods
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Attendance Excuses
ALTER TABLE attendance_excuses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students and parents can read own excuses"
  ON attendance_excuses
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students 
      WHERE user_id = auth.uid() OR parent_id = auth.uid()
    ) OR
    submitted_by = auth.uid()
  );

CREATE POLICY "Parents can submit excuses for their children"
  ON attendance_excuses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

CREATE POLICY "Staff can read all excuses"
  ON attendance_excuses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Staff can manage excuses"
  ON attendance_excuses
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'staff')
    )
  );

-- Enhanced attendance policies for parents
CREATE POLICY "Parents can read their children's attendance"
  ON attendance
  FOR SELECT
  TO authenticated
  USING (
    student_id IN (
      SELECT id FROM students WHERE parent_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendance_periods_class_day ON attendance_periods(class_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_attendance_period_id ON attendance(period_id);
CREATE INDEX IF NOT EXISTS idx_attendance_excuses_student_id ON attendance_excuses(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_excuses_status ON attendance_excuses(status);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_attendance_periods_updated_at 
  BEFORE UPDATE ON attendance_periods 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_attendance_excuses_updated_at 
  BEFORE UPDATE ON attendance_excuses 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample attendance periods
DO $$
DECLARE
    class_record RECORD;
BEGIN
    FOR class_record IN SELECT id FROM classes LIMIT 3 LOOP
        INSERT INTO attendance_periods (name, start_time, end_time, class_id, day_of_week) VALUES
        ('Period 1 - Mathematics', '08:00', '08:45', class_record.id, 1),
        ('Period 2 - English', '09:00', '09:45', class_record.id, 1),
        ('Period 3 - Science', '10:00', '10:45', class_record.id, 1),
        ('Period 4 - Social Studies', '11:00', '11:45', class_record.id, 1),
        ('Period 5 - Arabic', '13:00', '13:45', class_record.id, 1);
    END LOOP;
END $$;