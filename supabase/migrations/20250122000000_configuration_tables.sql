/*
  # Configuration Tables for Student Onboarding

  1. New Tables
    - `document_types` - Configurable document types for student applications
    - `blood_groups` - Configurable blood group options
    - `nationalities` - Configurable nationality options
    - `guardian_relationships` - Configurable guardian relationship types
    - `system_settings` - General system configuration

  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
*/

-- Document Types Configuration
CREATE TABLE IF NOT EXISTS document_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  description text,
  is_required boolean DEFAULT false,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blood Groups Configuration
CREATE TABLE IF NOT EXISTS blood_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Nationalities Configuration
CREATE TABLE IF NOT EXISTS nationalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  country_code text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Guardian Relationships Configuration
CREATE TABLE IF NOT EXISTS guardian_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  value text NOT NULL UNIQUE,
  label text NOT NULL,
  guardian_type text NOT NULL CHECK (guardian_type IN ('father', 'mother', 'guardian', 'emergency_contact')),
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System Settings Configuration
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  data_type text DEFAULT 'string' CHECK (data_type IN ('string', 'number', 'boolean', 'json')),
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE nationalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardian_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY "Admin can manage document types"
  ON document_types
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active document types"
  ON document_types
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage blood groups"
  ON blood_groups
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active blood groups"
  ON blood_groups
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage nationalities"
  ON nationalities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active nationalities"
  ON nationalities
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage guardian relationships"
  ON guardian_relationships
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can read active guardian relationships"
  ON guardian_relationships
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Admin can manage system settings"
  ON system_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Everyone can read public system settings"
  ON system_settings
  FOR SELECT
  TO authenticated
  USING (is_public = true);

-- Insert default document types
INSERT INTO document_types (value, label, description, is_required, display_order) VALUES
('birth_certificate', 'Birth Certificate', 'Official birth certificate document', true, 1),
('passport_photo', 'Passport Photo', 'Recent passport-sized photograph', true, 2),
('previous_school_records', 'Previous School Records', 'Academic records from previous school', false, 3),
('medical_records', 'Medical Records', 'Medical history and health records', false, 4),
('other', 'Other Documents', 'Additional supporting documents', false, 5);

-- Insert default blood groups
INSERT INTO blood_groups (value, label, display_order) VALUES
('A+', 'A Positive', 1),
('A-', 'A Negative', 2),
('B+', 'B Positive', 3),
('B-', 'B Negative', 4),
('AB+', 'AB Positive', 5),
('AB-', 'AB Negative', 6),
('O+', 'O Positive', 7),
('O-', 'O Negative', 8);

-- Insert default nationalities
INSERT INTO nationalities (value, label, country_code, display_order) VALUES
('Somali', 'Somali', 'SO', 1),
('Ethiopian', 'Ethiopian', 'ET', 2),
('Kenyan', 'Kenyan', 'KE', 3),
('Djiboutian', 'Djiboutian', 'DJ', 4),
('American', 'American', 'US', 5),
('British', 'British', 'GB', 6),
('Canadian', 'Canadian', 'CA', 7),
('Other', 'Other', NULL, 99);

-- Insert default guardian relationships
INSERT INTO guardian_relationships (value, label, guardian_type, display_order) VALUES
('Father', 'Father', 'father', 1),
('Mother', 'Mother', 'mother', 2),
('Guardian', 'Legal Guardian', 'guardian', 3),
('Grandfather', 'Grandfather', 'guardian', 4),
('Grandmother', 'Grandmother', 'guardian', 5),
('Uncle', 'Uncle', 'guardian', 6),
('Aunt', 'Aunt', 'guardian', 7),
('Brother', 'Brother', 'guardian', 8),
('Sister', 'Sister', 'guardian', 9),
('Emergency Contact', 'Emergency Contact', 'emergency_contact', 10);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, data_type, is_public) VALUES
('gr_number_prefix', 'GR', 'Prefix for student GR numbers', 'string', true),
('max_file_size_mb', '5', 'Maximum file size for document uploads in MB', 'number', true),
('allowed_file_types', '["image/jpeg", "image/png", "image/jpg", "application/pdf"]', 'Allowed file types for document uploads', 'json', true),
('default_nationality', 'Somali', 'Default nationality for new students', 'string', true),
('academic_year_auto_create', 'true', 'Automatically create new academic year', 'boolean', false);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_types_updated_at BEFORE UPDATE ON document_types FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_blood_groups_updated_at BEFORE UPDATE ON blood_groups FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_nationalities_updated_at BEFORE UPDATE ON nationalities FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_guardian_relationships_updated_at BEFORE UPDATE ON guardian_relationships FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();