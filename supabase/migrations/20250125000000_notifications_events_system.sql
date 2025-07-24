/*
  # Notifications and Events System

  1. New Tables
    - `notifications` - System notifications and activities
    - `events` - Scheduled events and announcements
    - `event_attendees` - Track event attendance
    - `notification_recipients` - Track notification delivery

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access
*/

-- Drop existing tables if they exist (this will also drop associated policies)
DROP TABLE IF EXISTS public.notification_recipients CASCADE;
DROP TABLE IF EXISTS public.event_attendees CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;

-- Drop existing types if they exist
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.notification_priority CASCADE;
DROP TYPE IF EXISTS public.event_status CASCADE;
DROP TYPE IF EXISTS public.event_category CASCADE;

-- Create notification types
CREATE TYPE public.notification_type AS ENUM (
  'announcement',
  'assignment',
  'exam',
  'event',
  'payment',
  'attendance',
  'grade',
  'disciplinary',
  'system'
);

CREATE TYPE public.notification_priority AS ENUM (
  'low',
  'normal',
  'high',
  'urgent'
);

-- Create event types
CREATE TYPE public.event_status AS ENUM (
  'draft',
  'published',
  'cancelled',
  'completed'
);

CREATE TYPE public.event_category AS ENUM (
  'academic',
  'sports',
  'cultural',
  'meeting',
  'exam',
  'holiday',
  'workshop',
  'ceremony',
  'other'
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type public.notification_type NOT NULL,
  priority public.notification_priority DEFAULT 'normal',
  created_by uuid NOT NULL,
  target_users uuid[] DEFAULT '{}',
  target_roles text[] DEFAULT '{}',
  is_global boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  expires_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category public.event_category NOT NULL,
  status public.event_status DEFAULT 'draft',
  start_date timestamp with time zone NOT NULL,
  end_date timestamp with time zone,
  location text,
  max_attendees integer,
  current_attendees integer DEFAULT 0,
  created_by uuid NOT NULL,
  target_roles text[] DEFAULT '{}',
  target_classes uuid[] DEFAULT '{}',
  is_public boolean DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT events_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Create event attendees table
CREATE TABLE public.event_attendees (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL,
  user_id uuid NOT NULL,
  status text DEFAULT 'registered' CHECK (status IN ('registered', 'attended', 'cancelled')),
  registered_at timestamp with time zone DEFAULT now(),
  attended_at timestamp with time zone,
  notes text,
  CONSTRAINT event_attendees_pkey PRIMARY KEY (id),
  CONSTRAINT event_attendees_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id) ON DELETE CASCADE,
  CONSTRAINT event_attendees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT event_attendees_unique UNIQUE (event_id, user_id)
);

-- Create notification recipients table
CREATE TABLE public.notification_recipients (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  notification_id uuid NOT NULL,
  user_id uuid NOT NULL,
  is_read boolean DEFAULT false,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_recipients_pkey PRIMARY KEY (id),
  CONSTRAINT notification_recipients_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE CASCADE,
  CONSTRAINT notification_recipients_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notification_recipients_unique UNIQUE (notification_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_recipients ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can read relevant notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (
    is_global = true OR
    auth.uid() = ANY(target_users) OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role::text = ANY(target_roles)
    ) OR
    EXISTS (
      SELECT 1 FROM public.notification_recipients 
      WHERE notification_recipients.notification_id = notifications.id 
      AND notification_recipients.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage notifications"
  ON public.notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Events policies
CREATE POLICY "Users can read relevant events"
  ON public.events
  FOR SELECT
  TO authenticated
  USING (
    is_public = true OR
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role::text = ANY(target_roles)
    ) OR
    EXISTS (
      SELECT 1 FROM public.students 
      WHERE students.user_id = auth.uid() 
      AND students.class_id = ANY(target_classes)
    )
  );

CREATE POLICY "Admins can manage events"
  ON public.events
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Event attendees policies
CREATE POLICY "Users can manage own attendance"
  ON public.event_attendees
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all attendance"
  ON public.event_attendees
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Notification recipients policies
CREATE POLICY "Users can read own notification status"
  ON public.notification_recipients
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification status"
  ON public.notification_recipients
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "System can manage notification recipients"
  ON public.notification_recipients
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'staff')
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_type ON public.notifications(type);
CREATE INDEX idx_notifications_target_roles ON public.notifications USING GIN(target_roles);
CREATE INDEX idx_notifications_target_users ON public.notifications USING GIN(target_users);

CREATE INDEX idx_events_start_date ON public.events(start_date);
CREATE INDEX idx_events_category ON public.events(category);
CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_target_roles ON public.events USING GIN(target_roles);
CREATE INDEX idx_events_target_classes ON public.events USING GIN(target_classes);

CREATE INDEX idx_event_attendees_event_id ON public.event_attendees(event_id);
CREATE INDEX idx_event_attendees_user_id ON public.event_attendees(user_id);

CREATE INDEX idx_notification_recipients_notification_id ON public.notification_recipients(notification_id);
CREATE INDEX idx_notification_recipients_user_id ON public.notification_recipients(user_id);
CREATE INDEX idx_notification_recipients_unread ON public.notification_recipients(user_id, is_read) WHERE is_read = false;

-- Create function to automatically create notification recipients
CREATE OR REPLACE FUNCTION create_notification_recipients()
RETURNS TRIGGER AS $$
BEGIN
  -- If global notification, create recipients for all users
  IF NEW.is_global THEN
    INSERT INTO public.notification_recipients (notification_id, user_id)
    SELECT NEW.id, users.id
    FROM public.users;
  ELSE
    -- Create recipients for target users
    IF array_length(NEW.target_users, 1) > 0 THEN
      INSERT INTO public.notification_recipients (notification_id, user_id)
      SELECT NEW.id, unnest(NEW.target_users);
    END IF;
    
    -- Create recipients for target roles
    IF array_length(NEW.target_roles, 1) > 0 THEN
      INSERT INTO public.notification_recipients (notification_id, user_id)
      SELECT NEW.id, users.id
      FROM public.users
      WHERE users.role::text = ANY(NEW.target_roles);
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for notification recipients
CREATE TRIGGER trigger_create_notification_recipients
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION create_notification_recipients();

-- Insert some sample data (only if admin user exists)
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get admin user ID
  SELECT id INTO admin_user_id FROM public.users WHERE role = 'admin' LIMIT 1;
  
  -- Only insert if admin user exists
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.notifications (title, description, type, priority, created_by, is_global) VALUES
    ('Welcome to the new academic year!', 'We are excited to start the new academic year with all our students and staff.', 'announcement', 'normal', admin_user_id, true),
    ('Fee payment reminder', 'Monthly fee payments are due by the 15th of each month.', 'payment', 'high', admin_user_id, true);

    INSERT INTO public.events (title, description, category, status, start_date, end_date, location, created_by, is_public) VALUES
    ('Parent-Teacher Meeting', 'Monthly parent-teacher meeting to discuss student progress.', 'meeting', 'published', '2025-01-15 09:00:00+00', '2025-01-15 12:00:00+00', 'Main Hall', admin_user_id, true),
    ('Mid-term Exams', 'Mid-term examinations for all grades.', 'exam', 'published', '2025-01-20 08:00:00+00', '2025-01-25 16:00:00+00', 'Examination Hall', admin_user_id, true),
    ('Sports Day', 'Annual sports day event for all students.', 'sports', 'published', '2025-01-25 10:00:00+00', '2025-01-25 16:00:00+00', 'Sports Ground', admin_user_id, true),
    ('Science Fair', 'Annual science fair showcasing student projects.', 'academic', 'published', '2025-01-30 14:00:00+00', '2025-01-30 18:00:00+00', 'Science Laboratory', admin_user_id, true);
  END IF;
END $$;