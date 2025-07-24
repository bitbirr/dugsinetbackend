export interface AttendancePeriod {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  subject_id?: string;
  class_id: string;
  day_of_week: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AttendanceExcuse {
  id: string;
  attendance_id?: string;
  student_id: string;
  excuse_type: 'medical' | 'family_emergency' | 'religious' | 'other';
  reason: string;
  supporting_documents: string[];
  submitted_by: string;
  submitted_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id?: string;
  staff_id?: string;
  date: string;
  status: AttendanceStatus;
  period_id?: string;
  excuse_id?: string;
  check_in_time?: string;
  check_out_time?: string;
  late_minutes: number;
  early_departure_minutes: number;
  remarks?: string;
  created_by: string;
  created_at: string;
  
  // Joined data
  student?: {
    id: string;
    first_name: string;
    last_name: string;
    gr_number: string;
    class_id: string;
  };
  period?: AttendancePeriod;
  excuse?: AttendanceExcuse;
}

export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'late' 
  | 'excused_absent' 
  | 'excused_late' 
  | 'half_day' 
  | 'sick' 
  | 'suspended';

export interface AttendanceSummary {
  student_id: string;
  first_name: string;
  last_name: string;
  gr_number: string;
  class_name: string;
  month: string;
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  excused_absent_days: number;
  excused_late_days: number;
  attendance_percentage: number;
}

export interface AttendanceReport {
  period: string;
  class_id?: string;
  student_id?: string;
  summary: AttendanceSummary;
  daily_records: AttendanceRecord[];
}