import { supabase } from './supabase';
import { AttendanceRecord, AttendancePeriod, AttendanceExcuse, AttendanceSummary, AttendanceStatus } from '../types/attendance';

export class AttendanceService {
  // Attendance Records
  static async getAttendanceByDate(date: string, classId?: string) {
    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:students(id, first_name, last_name, gr_number, class_id),
        period:attendance_periods(*),
        excuse:attendance_excuses(*)
      `)
      .eq('date', date);

    if (classId) {
      query = query.eq('student.class_id', classId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as AttendanceRecord[];
  }

  static async markAttendance(records: Partial<AttendanceRecord>[]) {
    const { data, error } = await supabase
      .from('attendance')
      .upsert(records, { 
        onConflict: 'student_id,date,period_id',
        ignoreDuplicates: false 
      });
    
    if (error) throw error;
    return data;
  }

  static async updateAttendanceStatus(id: string, status: AttendanceStatus, remarks?: string) {
    const { data, error } = await supabase
      .from('attendance')
      .update({ status, remarks, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // Attendance Periods
  static async getAttendancePeriods(classId?: string, dayOfWeek?: number) {
    let query = supabase
      .from('attendance_periods')
      .select('*')
      .eq('is_active', true)
      .order('start_time');

    if (classId) query = query.eq('class_id', classId);
    if (dayOfWeek) query = query.eq('day_of_week', dayOfWeek);

    const { data, error } = await query;
    if (error) throw error;
    return data as AttendancePeriod[];
  }

  static async createAttendancePeriod(period: Omit<AttendancePeriod, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('attendance_periods')
      .insert(period);
    
    if (error) throw error;
    return data;
  }

  // Excuse Management
  static async submitExcuse(excuse: Omit<AttendanceExcuse, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('attendance_excuses')
      .insert(excuse);
    
    if (error) throw error;
    return data;
  }

  static async getExcuses(studentId?: string, status?: string) {
    let query = supabase
      .from('attendance_excuses')
      .select(`
        *,
        student:students(first_name, last_name, gr_number),
        submitted_by_user:users!submitted_by(full_name),
        reviewed_by_user:users!reviewed_by(full_name)
      `)
      .order('created_at', { ascending: false });

    if (studentId) query = query.eq('student_id', studentId);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  static async reviewExcuse(id: string, status: 'approved' | 'rejected', adminNotes?: string, reviewedBy?: string) {
    const { data, error } = await supabase
      .from('attendance_excuses')
      .update({
        status,
        admin_notes: adminNotes,
        reviewed_by: reviewedBy,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) throw error;
    return data;
  }

  // Reports and Analytics
  static async getAttendanceSummary(studentId?: string, classId?: string, month?: string) {
    let query = supabase
      .from('attendance_summary')
      .select('*')
      .order('month', { ascending: false });

    if (studentId) query = query.eq('student_id', studentId);
    if (classId) query = query.eq('class_id', classId);
    if (month) query = query.eq('month', month);

    const { data, error } = await query;
    if (error) throw error;
    return data as AttendanceSummary[];
  }

  static async getStudentAttendanceHistory(studentId: string, startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        period:attendance_periods(name, start_time, end_time),
        excuse:attendance_excuses(reason, status)
      `)
      .eq('student_id', studentId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as AttendanceRecord[];
  }

  // Bulk operations for teachers
  static async markClassAttendance(classId: string, date: string, periodId: string, attendanceData: Array<{
    studentId: string;
    status: AttendanceStatus;
    checkInTime?: string;
    lateMinutes?: number;
    remarks?: string;
  }>) {
    // Get the current user ID first
    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id;

    const records = attendanceData.map(item => ({
      student_id: item.studentId,
      date,
      period_id: periodId,
      status: item.status,
      check_in_time: item.checkInTime,
      late_minutes: item.lateMinutes || 0,
      remarks: item.remarks,
      created_by: currentUserId
    }));

    return this.markAttendance(records);
  }

  // Parent notifications
  static async sendAbsenceNotification(studentId: string, date: string, status: AttendanceStatus) {
    // Get student and parent information
    const { data: student } = await supabase
      .from('students')
      .select(`
        first_name,
        last_name,
        parent_id,
        student_guardians(full_name, phone, email, is_primary)
      `)
      .eq('id', studentId)
      .single();

    if (!student) return;

    // Create notification
    const notification = {
      title: `Attendance Alert - ${student.first_name} ${student.last_name}`,
      message: `Your child was marked as ${status} on ${date}. Please contact the school if you have any questions.`,
      type: 'attendance',
      priority: status === 'absent' ? 'high' : 'normal',
      target_roles: ['parent'],
      target_users: [student.parent_id],
      is_public: false
    };

    const { error } = await supabase
      .from('notifications')
      .insert(notification);

    if (error) console.error('Failed to send notification:', error);
  }
}