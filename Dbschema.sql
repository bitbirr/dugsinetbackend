-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.academic_years (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  is_current boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT academic_years_pkey PRIMARY KEY (id)
);
CREATE TABLE public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  staff_id uuid,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status USER-DEFINED NOT NULL DEFAULT 'present'::attendance_status,
  remarks text,
  created_by uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT attendance_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id),
  CONSTRAINT attendance_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  grade_level integer NOT NULL,
  section text NOT NULL DEFAULT 'A'::text,
  academic_year_id uuid,
  class_teacher_id uuid,
  capacity integer DEFAULT 30,
  current_enrollment integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id),
  CONSTRAINT classes_class_teacher_id_fkey FOREIGN KEY (class_teacher_id) REFERENCES public.users(id)
);
CREATE TABLE public.course_materials (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  lesson_id uuid,
  name text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_type text NOT NULL,
  file_size bigint DEFAULT 0,
  uploaded_by uuid,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_materials_pkey PRIMARY KEY (id),
  CONSTRAINT course_materials_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_materials_lesson_id_fkey FOREIGN KEY (lesson_id) REFERENCES public.lessons(id),
  CONSTRAINT course_materials_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);
CREATE TABLE public.course_teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  staff_id uuid,
  role text DEFAULT 'primary'::text CHECK (role = ANY (ARRAY['primary'::text, 'assistant'::text, 'substitute'::text])),
  assigned_at timestamp with time zone DEFAULT now(),
  CONSTRAINT course_teachers_pkey PRIMARY KEY (id),
  CONSTRAINT course_teachers_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT course_teachers_staff_id_fkey FOREIGN KEY (staff_id) REFERENCES public.staff(id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  subject_id uuid,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  academic_year_id uuid,
  grade_level integer NOT NULL,
  credits integer DEFAULT 1,
  duration_weeks integer DEFAULT 36,
  is_mandatory boolean DEFAULT false,
  prerequisites ARRAY DEFAULT '{}'::text[],
  learning_objectives ARRAY DEFAULT '{}'::text[],
  syllabus_url text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id),
  CONSTRAINT courses_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id),
  CONSTRAINT courses_academic_year_id_fkey FOREIGN KEY (academic_year_id) REFERENCES public.academic_years(id)
);
CREATE TABLE public.curriculum_topics (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  name text NOT NULL,
  description text,
  order_index integer NOT NULL,
  duration_hours integer DEFAULT 1,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT curriculum_topics_pkey PRIMARY KEY (id),
  CONSTRAINT curriculum_topics_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.id_cards (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  card_number text NOT NULL UNIQUE,
  issue_date date DEFAULT CURRENT_DATE,
  expiry_date date,
  card_template text DEFAULT 'default'::text,
  card_data jsonb,
  pdf_url text,
  is_active boolean DEFAULT true,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT id_cards_pkey PRIMARY KEY (id),
  CONSTRAINT id_cards_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT id_cards_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  topic_id uuid,
  name text NOT NULL,
  description text,
  content text,
  order_index integer NOT NULL,
  duration_minutes integer DEFAULT 45,
  learning_outcomes ARRAY DEFAULT '{}'::text[],
  materials_needed ARRAY DEFAULT '{}'::text[],
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT lessons_pkey PRIMARY KEY (id),
  CONSTRAINT lessons_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.curriculum_topics(id)
);
CREATE TABLE public.staff (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  employee_id text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender USER-DEFINED NOT NULL,
  department text NOT NULL,
  position text NOT NULL,
  hire_date date DEFAULT CURRENT_DATE,
  salary numeric DEFAULT 0,
  status USER-DEFINED DEFAULT 'active'::staff_status,
  address text NOT NULL,
  emergency_contact text NOT NULL,
  photo_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT staff_pkey PRIMARY KEY (id),
  CONSTRAINT staff_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE public.student_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  document_type text NOT NULL CHECK (document_type = ANY (ARRAY['birth_certificate'::text, 'previous_school_records'::text, 'medical_records'::text, 'passport_photo'::text, 'other'::text])),
  document_name text NOT NULL,
  file_url text NOT NULL,
  file_size bigint DEFAULT 0,
  uploaded_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_documents_pkey PRIMARY KEY (id),
  CONSTRAINT student_documents_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT student_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id)
);
CREATE TABLE public.student_guardians (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  guardian_type text NOT NULL CHECK (guardian_type = ANY (ARRAY['father'::text, 'mother'::text, 'guardian'::text, 'emergency_contact'::text])),
  full_name text NOT NULL,
  relationship text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  occupation text,
  workplace text,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_guardians_pkey PRIMARY KEY (id),
  CONSTRAINT student_guardians_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  gr_number text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  date_of_birth date NOT NULL,
  gender USER-DEFINED NOT NULL,
  class_id uuid,
  admission_date date DEFAULT CURRENT_DATE,
  previous_school text,
  parent_id uuid,
  address text NOT NULL,
  emergency_contact text NOT NULL,
  photo_url text,
  status USER-DEFINED DEFAULT 'active'::student_status,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  nationality text DEFAULT 'Somali'::text,
  blood_group text,
  medical_conditions text,
  enrollment_status text DEFAULT 'pending'::text CHECK (enrollment_status = ANY (ARRAY['pending'::text, 'enrolled'::text, 'rejected'::text])),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT students_class_id_fkey FOREIGN KEY (class_id) REFERENCES public.classes(id),
  CONSTRAINT students_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.users(id)
);
CREATE TABLE public.subjects (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  description text,
  grade_level integer NOT NULL,
  department text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT subjects_pkey PRIMARY KEY (id)
);
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role USER-DEFINED NOT NULL DEFAULT 'student'::user_role,
  full_name text NOT NULL,
  phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);