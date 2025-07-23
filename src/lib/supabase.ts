import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const auth = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  signUp: async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
      },
    });
    return { data, error };
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  getCurrentUser: async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { user, error };
  },

  getSession: async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },
};

// Database helpers
export const db = {
  // Users
  getUsers: () => supabase.from('users').select('*'),
  getUserById: (id: string) => supabase.from('users').select('*').eq('id', id).single(),
  createUser: (user: any) => supabase.from('users').insert(user),
  updateUser: (id: string, updates: any) => supabase.from('users').update(updates).eq('id', id),

  // Students
  getStudents: () => supabase.from('students').select(`
    *,
    user:users!students_user_id_fkey(full_name, email),
    class:classes(name, grade_level, section),
    parent:users!students_parent_id_fkey(full_name, email)
  `),
  getStudentById: (id: string) => supabase.from('students').select(`
    *,
    user:users!students_user_id_fkey(full_name, email),
    class:classes(name, grade_level, section),
    parent:users!students_parent_id_fkey(full_name, email)
  `).eq('id', id).single(),
  createStudent: (student: any) => supabase.from('students').insert(student).select(),
  updateStudent: (id: string, updates: any) => supabase.from('students').update(updates).eq('id', id),

  // Student Onboarding
  getStudentApplications: () => supabase.from('students').select(`
    *,
    student_guardians(*),
    student_documents(*)
  `).order('created_at', { ascending: false }),
  
  getStudentApplicationById: (id: string) => supabase.from('students').select(`
    *,
    student_guardians(*),
    student_documents(*)
  `).eq('id', id).single(),

  createStudentGuardian: (guardian: any) => supabase.from('student_guardians').insert(guardian),
  updateStudentGuardian: (id: string, updates: any) => supabase.from('student_guardians').update(updates).eq('id', id),
  deleteStudentGuardian: (id: string) => supabase.from('student_guardians').delete().eq('id', id),

  createStudentDocument: (document: any) => supabase.from('student_documents').insert(document),
  updateStudentDocument: (id: string, updates: any) => supabase.from('student_documents').update(updates).eq('id', id),
  deleteStudentDocument: (id: string) => supabase.from('student_documents').delete().eq('id', id),

  // Configuration Data
  getDocumentTypes: () => supabase.from('document_types').select('*').eq('is_active', true).order('display_order'),
  getBloodGroups: () => supabase.from('blood_groups').select('*').eq('is_active', true).order('display_order'),
  getNationalities: () => supabase.from('nationalities').select('*').eq('is_active', true).order('display_order'),
  getGuardianRelationships: () => supabase.from('guardian_relationships').select('*').eq('is_active', true).order('display_order'),
  getSystemSettings: () => supabase.from('system_settings').select('*').eq('is_public', true),
  getSystemSetting: (key: string) => supabase.from('system_settings').select('*').eq('key', key).single(),

  // Admin Configuration Management
  createDocumentType: (docType: any) => supabase.from('document_types').insert(docType),
  updateDocumentType: (id: string, updates: any) => supabase.from('document_types').update(updates).eq('id', id),
  deleteDocumentType: (id: string) => supabase.from('document_types').delete().eq('id', id),

  createBloodGroup: (bloodGroup: any) => supabase.from('blood_groups').insert(bloodGroup),
  updateBloodGroup: (id: string, updates: any) => supabase.from('blood_groups').update(updates).eq('id', id),
  deleteBloodGroup: (id: string) => supabase.from('blood_groups').delete().eq('id', id),

  createNationality: (nationality: any) => supabase.from('nationalities').insert(nationality),
  updateNationality: (id: string, updates: any) => supabase.from('nationalities').update(updates).eq('id', id),
  deleteNationality: (id: string) => supabase.from('nationalities').delete().eq('id', id),

  createGuardianRelationship: (relationship: any) => supabase.from('guardian_relationships').insert(relationship),
  updateGuardianRelationship: (id: string, updates: any) => supabase.from('guardian_relationships').update(updates).eq('id', id),
  deleteGuardianRelationship: (id: string) => supabase.from('guardian_relationships').delete().eq('id', id),

  updateSystemSetting: (key: string, value: string) => supabase.from('system_settings').update({ value }).eq('key', key),

  // Staff
  getStaff: () => supabase.from('staff').select(`
    *,
    user:users(full_name, email)
  `),
  getStaffById: (id: string) => supabase.from('staff').select(`
    *,
    user:users(full_name, email)
  `).eq('id', id).single(),
  createStaff: (staff: any) => supabase.from('staff').insert(staff),
  updateStaff: (id: string, updates: any) => supabase.from('staff').update(updates).eq('id', id),

  // Classes
  getClasses: () => supabase.from('classes').select(`
    *,
    class_teacher:staff(first_name, last_name)
  `),
  getClassById: (id: string) => supabase.from('classes').select(`
    *,
    class_teacher:staff(first_name, last_name)
  `).eq('id', id).single(),
  createClass: (classData: any) => supabase.from('classes').insert(classData),
  updateClass: (id: string, updates: any) => supabase.from('classes').update(updates).eq('id', id),

  // Attendance
  getAttendance: (date?: string) => {
    let query = supabase.from('attendance').select(`
      *,
      student:students(first_name, last_name, gr_number),
      staff:staff(first_name, last_name, employee_id)
    `);
    if (date) {
      query = query.eq('date', date);
    }
    return query;
  },
  createAttendance: (attendance: any) => supabase.from('attendance').insert(attendance),
  updateAttendance: (id: string, updates: any) => supabase.from('attendance').update(updates).eq('id', id),

  // Academic Years
  getAcademicYears: () => supabase.from('academic_years').select('*'),
  getCurrentAcademicYear: () => supabase.from('academic_years').select('*').eq('is_current', true).single(),
  createAcademicYear: (year: any) => supabase.from('academic_years').insert(year),
  updateAcademicYear: (id: string, updates: any) => supabase.from('academic_years').update(updates).eq('id', id),

  // Curriculum
  getSubjects: () => supabase.from('subjects').select('*'),
  getCourses: () => supabase.from('courses').select(`
    *,
    subject:subjects(*),
    academic_year:academic_years(name)
  `),
  getTopics: (courseId: string) => supabase.from('curriculum_topics').select('*').eq('course_id', courseId),
  getLessons: (topicId: string) => supabase.from('lessons').select('*').eq('topic_id', topicId),
};