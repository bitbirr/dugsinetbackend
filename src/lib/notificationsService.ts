import { supabase } from './supabase';
import { 
  Notification, 
  Event, 
  NotificationWithRecipient, 
  EventWithAttendance,
  NotificationType,
  EventCategory,
  NotificationPriority,
  EventStatus
} from '../types/notifications';

export class NotificationsService {
  // Notifications
  static async getRecentActivities(limit: number = 10): Promise<NotificationWithRecipient[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        recipient:notification_recipients!inner(*)
      `)
      .eq('notification_recipients.user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getUnreadNotificationsCount(): Promise<number> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { count, error } = await supabase
      .from('notification_recipients')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.user.id)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('notification_recipients')
      .update({ 
        is_read: true, 
        read_at: new Date().toISOString() 
      })
      .eq('notification_id', notificationId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  static async createNotification(notification: {
    title: string;
    description: string;
    type: NotificationType;
    priority?: NotificationPriority;
    icon?: string;
    color?: string;
    data?: Record<string, any>;
    target_roles?: string[];
    target_users?: string[];
    is_global?: boolean;
    expires_at?: string;
  }): Promise<Notification> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        ...notification,
        created_by: user.user.id,
        priority: notification.priority || 'normal',
        target_roles: notification.target_roles || [],
        target_users: notification.target_users || [],
        is_global: notification.is_global || false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Events
  static async getUpcomingEvents(limit: number = 10): Promise<EventWithAttendance[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        attendee_count:event_attendees(count),
        user_attendance:event_attendees!left(*)
      `)
      .eq('status', 'published')
      .gte('start_date', new Date().toISOString())
      .eq('event_attendees.user_id', user.user.id)
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  static async getEventsByDateRange(startDate: string, endDate: string): Promise<Event[]> {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .gte('start_date', startDate)
      .lte('start_date', endDate)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  static async createEvent(event: {
    title: string;
    description?: string;
    category: EventCategory;
    start_date: string;
    end_date?: string;
    location?: string;
    max_attendees?: number;
    registration_required?: boolean;
    registration_deadline?: string;
    target_roles?: string[];
    target_classes?: string[];
    is_public?: boolean;
    metadata?: Record<string, any>;
  }): Promise<Event> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('events')
      .insert({
        ...event,
        created_by: user.user.id,
        status: 'draft' as EventStatus,
        registration_required: event.registration_required || false,
        target_roles: event.target_roles || [],
        target_classes: event.target_classes || [],
        is_public: event.is_public !== false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateEventStatus(eventId: string, status: EventStatus): Promise<void> {
    const { error } = await supabase
      .from('events')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', eventId);

    if (error) throw error;
  }

  static async registerForEvent(eventId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: user.user.id,
        status: 'registered'
      });

    if (error) throw error;
  }

  static async cancelEventRegistration(eventId: string): Promise<void> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('event_attendees')
      .update({ status: 'cancelled' })
      .eq('event_id', eventId)
      .eq('user_id', user.user.id);

    if (error) throw error;
  }

  // Admin functions
  static async getAllNotifications(page: number = 1, limit: number = 20): Promise<{
    notifications: Notification[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const [notificationsResult, countResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
    ]);

    if (notificationsResult.error) throw notificationsResult.error;
    if (countResult.error) throw countResult.error;

    return {
      notifications: notificationsResult.data || [],
      total: countResult.count || 0
    };
  }

  static async getAllEvents(page: number = 1, limit: number = 20): Promise<{
    events: Event[];
    total: number;
  }> {
    const offset = (page - 1) * limit;

    const [eventsResult, countResult] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: false })
        .range(offset, offset + limit - 1),
      supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
    ]);

    if (eventsResult.error) throw eventsResult.error;
    if (countResult.error) throw countResult.error;

    return {
      events: eventsResult.data || [],
      total: countResult.count || 0
    };
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  }
}