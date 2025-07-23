export interface User {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'student' | 'parent';
  full_name: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  user_id: string;
  gr_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  class_id: string;
  admission_date: string;
  previous_school?: string;
  parent_id?: string;
  address: string;
  emergency_contact: string;
  photo_url?: string;
  status: 'active' | 'inactive' | 'graduated';
  nationality?: string;
  blood_group?: string;
  medical_conditions?: string;
  enrollment_status: 'pending' | 'enrolled' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface Staff {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  department: string;
  position: string;
  hire_date: string;
  salary: number;
  status: 'active' | 'inactive' | 'on_leave';
  address: string;
  emergency_contact: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Class {
  id: string;
  name: string;
  grade_level: number;
  section: string;
  academic_year: string;
  class_teacher_id?: string;
  capacity: number;
  current_enrollment: number;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  student_id?: string;
  staff_id?: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'half_day';
  remarks?: string;
  created_by: string;
  created_at: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  created_at: string;
  updated_at: string;
}

// Student Onboarding Types
export interface StudentGuardian {
  id?: string;
  student_id?: string;
  guardian_type: 'father' | 'mother' | 'guardian' | 'emergency_contact';
  full_name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  occupation?: string;
  workplace?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StudentDocument {
  id?: string;
  student_id?: string;
  document_type: 'birth_certificate' | 'previous_school_records' | 'medical_records' | 'passport_photo' | 'other';
  document_name: string;
  file_url: string;
  file_size: number;
  uploaded_by?: string;
  created_at?: string;
}

export interface StudentApplication {
  // Personal Information
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female';
  nationality: string;
  blood_group?: string;
  medical_conditions?: string;
  address: string;
  emergency_contact: string;
  previous_school?: string;
  photo_url?: string;
  
  // Guardians
  guardians: StudentGuardian[];
  
  // Documents
  documents: File[];
  document_types: string[];
  
  // Application Status
  enrollment_status: 'pending' | 'enrolled' | 'rejected';
  grade_level?: number;
}

// Combined interface for student applications with database data
export interface StudentApplicationWithId extends Omit<Student, 'user_id' | 'class_id' | 'parent_id' | 'status'> {
  // Related data
  student_guardians: StudentGuardian[];
  student_documents: StudentDocument[];
}