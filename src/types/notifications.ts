export type NotificationType = 
  | 'admission'
  | 'leave'
  | 'payment'
  | 'exam'
  | 'attendance'
  | 'announcement'
  | 'system'
  | 'academic'
  | 'disciplinary';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type EventCategory = 
  | 'meeting'
  | 'exam'
  | 'event'
  | 'academic'
  | 'sports'
  | 'cultural'
  | 'holiday'
  | 'maintenance';

export type EventStatus = 'draft' | 'published' | 'cancelled' | 'completed';

export type AttendeeStatus = 'registered' | 'attended' | 'absent' | 'cancelled';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  priority: NotificationPriority;
  icon?: string;
  color?: string;
  data?: Record<string, any>;
  created_by: string;
  target_roles: string[];
  target_users: string[];
  is_global: boolean;
  is_read: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  category: EventCategory;
  status: EventStatus;
  start_date: string;
  end_date?: string;
  location?: string;
  max_attendees?: number;
  registration_required: boolean;
  registration_deadline?: string;
  created_by: string;
  target_roles: string[];
  target_classes: string[];
  is_public: boolean;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: AttendeeStatus;
  registered_at: string;
  attended_at?: string;
  notes?: string;
}

export interface NotificationRecipient {
  id: string;
  notification_id: string;
  user_id: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

// Extended types with joined data
export interface NotificationWithRecipient extends Notification {
  recipient?: NotificationRecipient;
}

export interface EventWithAttendance extends Event {
  attendee_count?: number;
  user_attendance?: EventAttendee;
}