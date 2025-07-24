import { useState, useEffect } from 'react';
import { NotificationsService } from '../lib/notificationsService';
import { NotificationWithRecipient, EventWithAttendance } from '../types/notifications';

export function useRecentActivities(limit: number = 10) {
  const [activities, setActivities] = useState<NotificationWithRecipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true);
        const data = await NotificationsService.getRecentActivities(limit);
        setActivities(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch activities');
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [limit]);

  const markAsRead = async (notificationId: string) => {
    try {
      await NotificationsService.markNotificationAsRead(notificationId);
      setActivities(prev => 
        prev.map(activity => 
          activity.id === notificationId 
            ? { ...activity, recipient: { ...activity.recipient!, is_read: true } }
            : activity
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mark all unread notifications as read
      const unreadNotifications = activities.filter(activity => !activity.recipient?.is_read);
      
      await Promise.all(
        unreadNotifications.map(notification => 
          NotificationsService.markNotificationAsRead(notification.id)
        )
      );

      setActivities(prev => 
        prev.map(activity => ({
          ...activity,
          recipient: { ...activity.recipient!, is_read: true }
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    }
  };

  return { activities, loading, error, markAsRead, markAllAsRead };
}

export function useUpcomingEvents(limit: number = 10) {
  const [events, setEvents] = useState<EventWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await NotificationsService.getUpcomingEvents(limit);
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch events');
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, [limit]);

  const registerForEvent = async (eventId: string) => {
    try {
      await NotificationsService.registerForEvent(eventId);
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, user_attendance: { 
                id: '', 
                event_id: eventId, 
                user_id: '', 
                status: 'registered', 
                registered_at: new Date().toISOString() 
              }}
            : event
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register for event');
    }
  };

  const cancelRegistration = async (eventId: string) => {
    try {
      await NotificationsService.cancelEventRegistration(eventId);
      setEvents(prev => 
        prev.map(event => 
          event.id === eventId 
            ? { ...event, user_attendance: undefined }
            : event
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel registration');
    }
  };

  return { events, loading, error, registerForEvent, cancelRegistration };
}

export function useUnreadNotifications() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const unreadCount = await NotificationsService.getUnreadNotificationsCount();
        setCount(unreadCount);
      } catch (err) {
        console.error('Failed to fetch unread notifications count:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchCount();
    
    // Refresh count every 30 seconds
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return { count, loading };
}