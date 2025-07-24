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
  status: 'active' | 'inactive' | 'graduated' | 'deleted';
  nationality?: string;
  blood_group?: string;
  medical_conditions?: string;
  enrollment_status: 'pending' | 'enrolled' | 'rejected';
  created_at: string;
  updated_at: string;
  // Optional fields that might not be present in all queries
  email?: string;
  phone?: string;
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

// New Student Profile Enhancement Types

export interface StudentBehavioralRecord {
  id: string;
  student_id: string;
  incident_type: 'disciplinary' | 'achievement' | 'observation' | 'warning' | 'suspension' | 'commendation';
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  date_occurred: string;
  location?: string;
  witnesses?: string[];
  action_taken?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  status: 'open' | 'resolved' | 'pending';
  reported_by: string;
  reviewed_by?: string;
  parent_notified: boolean;
  parent_notification_date?: string;
  attachments?: any[];
  created_at: string;
  updated_at: string;
  // Populated fields
  reported_by_name?: string;
  reviewed_by_name?: string;
}

export interface StudentHealthRecord {
  id: string;
  student_id: string;
  record_type: 'medical_history' | 'vaccination' | 'allergy' | 'medication' | 'emergency_contact' | 'physical_exam' | 'dental_exam' | 'vision_test' | 'incident';
  title: string;
  description?: string;
  date_recorded: string;
  doctor_name?: string;
  clinic_hospital?: string;
  medications?: string[];
  allergies?: string[];
  chronic_conditions?: string[];
  emergency_procedures?: string;
  restrictions?: string[];
  next_checkup_date?: string;
  vaccination_name?: string;
  vaccination_date?: string;
  vaccination_due_date?: string;
  document_urls?: string[];
  is_confidential: boolean;
  recorded_by: string;
  reviewed_by?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  recorded_by_name?: string;
  reviewed_by_name?: string;
}

export interface StudentAcademicHistory {
  id: string;
  student_id: string;
  academic_year_id?: string;
  subject_id?: string;
  course_id?: string;
  assessment_type: 'exam' | 'quiz' | 'assignment' | 'project' | 'presentation' | 'practical' | 'midterm' | 'final' | 'continuous_assessment';
  assessment_name: string;
  total_marks: number;
  obtained_marks: number;
  percentage: number;
  grade?: string;
  assessment_date: string;
  teacher_id?: string;
  comments?: string;
  improvement_areas?: string[];
  strengths?: string[];
  attendance_percentage?: number;
  class_rank?: number;
  class_average?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  // Populated fields
  subject_name?: string;
  course_name?: string;
  teacher_name?: string;
  academic_year_name?: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  note_type: 'general' | 'academic' | 'behavioral' | 'health' | 'social' | 'family' | 'counseling';
  title: string;
  content: string;
  is_confidential: boolean;
  is_important: boolean;
  tags?: string[];
  visibility: 'staff' | 'teachers' | 'admin_only' | 'parents';
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  created_by_name?: string;
  updated_by_name?: string;
}

export interface StudentAchievement {
  id: string;
  student_id: string;
  achievement_type: 'academic' | 'sports' | 'arts' | 'leadership' | 'community_service' | 'behavior' | 'attendance' | 'competition';
  title: string;
  description?: string;
  category?: string;
  level?: 'school' | 'district' | 'regional' | 'national' | 'international';
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  created_by_name?: string;
}

// Comprehensive Student Profile Interface
export interface StudentProfile extends Student {
  // Related data
  guardians: StudentGuardian[];
  documents: StudentDocument[];
  behavioral_records: StudentBehavioralRecord[];
  health_records: StudentHealthRecord[];
  academic_history: StudentAcademicHistory[];
  notes: StudentNote[];
  achievements: StudentAchievement[];
  class_info?: Class;
  parent_info?: User;
}

// Form interfaces for creating/editing records
export interface CreateBehavioralRecordForm {
  student_id: string;
  incident_type: StudentBehavioralRecord['incident_type'];
  title: string;
  description: string;
  severity?: StudentBehavioralRecord['severity'];
  date_occurred: string;
  location?: string;
  witnesses?: string[];
  action_taken?: string;
  follow_up_required: boolean;
  follow_up_date?: string;
  parent_notified: boolean;
}

export interface CreateHealthRecordForm {
  student_id: string;
  record_type: StudentHealthRecord['record_type'];
  title: string;
  description?: string;
  // Remove severity since it doesn't exist in StudentHealthRecord interface
  date_recorded: string;
  expiry_date?: string;
  doctor_name?: string;
  hospital_clinic?: string;
  medication_dosage?: string;
  special_instructions?: string;
  is_active: boolean;
  requires_attention: boolean;
}

export interface CreateAcademicRecordForm {
  student_id: string;
  academic_year_id?: string;
  subject_id?: string;
  course_id?: string;
  assessment_type: StudentAcademicHistory['assessment_type'];
  assessment_name: string;
  total_marks: number;
  obtained_marks: number;
  grade?: string;
  assessment_date: string;
  teacher_id?: string;
  comments?: string;
  improvement_areas?: string[];
  strengths?: string[];
  attendance_percentage?: number;
  class_rank?: number;
  class_average?: number;
}

export interface CreateStudentNoteForm {
  student_id: string;
  note_type: StudentNote['note_type'];
  title: string;
  content: string;
  is_confidential: boolean;
  is_important: boolean;
  tags?: string[];
  visibility: StudentNote['visibility'];
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
  category?: string;
  level?: StudentAchievement['level'];
  date_achieved: string;
  awarded_by?: string;
  certificate_url?: string;
  points_awarded: number;
  is_featured: boolean;
}

export interface CreateAchievementForm {
  student_id: string;
  achievement_type: StudentAchievement['achievement_type'];
  title: string;
  description?: string;
}