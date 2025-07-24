import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  Calendar, 
  Bell, 
  ArrowRight, 
  Clock, 
  UserPlus, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  Star,
  CalendarDays,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import DashboardStats from '../components/Dashboard/DashboardStats';
import LogViewer from '../components/Admin/LogViewer';
import { useRecentActivities, useUpcomingEvents } from '../hooks/useNotifications';

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  // Use real data hooks
  const { activities, loading: activitiesLoading, markAsRead } = useRecentActivities(4);
  const { events, loading: eventsLoading, registerForEvent, cancelRegistration } = useUpcomingEvents(4);

  const quickActions = [
    {
      title: 'Student Management',
      description: 'Manage student records and admissions',
      icon: Users,
      color: 'bg-blue-600',
      path: '/students',
      roles: ['admin', 'staff']
    },
    {
      title: 'Curriculum',
      description: 'Manage courses and subjects',
      icon: BookOpen,
      color: 'bg-green-600',
      path: '/curriculum',
      roles: ['admin', 'staff']
    },
    {
      title: 'Attendance',
      description: 'Track student and staff attendance',
      icon: CheckCircle,
      color: 'bg-purple-600',
      path: '/attendance',
      roles: ['admin', 'staff', 'student']
    },
    {
      title: 'Events & Calendar',
      description: 'Manage school events and calendar',
      icon: Calendar,
      color: 'bg-orange-600',
      path: '/events',
      roles: ['admin', 'staff']
    },
    {
      title: 'Notifications',
      description: 'Create and manage notifications',
      icon: Bell,
      color: 'bg-red-600',
      path: '/notifications',
      roles: ['admin', 'staff']
    },
    {
      title: 'System Logs',
      description: 'View system logs and activities',
      icon: Settings,
      color: 'bg-gray-600',
      path: '/admin/logs',
      roles: ['admin', 'super_admin']
    }
  ];

  // Static alerts (these could also be made dynamic later)
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Pending Admissions',
      message: '5 student applications awaiting approval',
      icon: AlertTriangle,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      action: () => navigate('/students/applications')
    },
    {
      id: 2,
      type: 'info',
      title: 'Fee Reminders',
      message: '12 students have pending fee payments',
      icon: Info,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 3,
      type: 'success',
      title: 'Monthly Target',
      message: 'Attendance rate reached 95% this month',
      icon: Star,
      color: 'bg-green-50 border-green-200 text-green-800'
    }
  ];

  // Static today's schedule (this could be made dynamic with a timetable system)
  const todaySchedule = [
    { time: '08:00 AM', subject: 'Mathematics', class: 'Grade 7-A', teacher: 'Dr. Ahmed' },
    { time: '09:00 AM', subject: 'English', class: 'Grade 8-B', teacher: 'Ms. Sarah' },
    { time: '10:00 AM', subject: 'Science', class: 'Grade 9-A', teacher: 'Mr. Hassan' },
    { time: '11:00 AM', subject: 'History', class: 'Grade 10-C', teacher: 'Dr. Fatima' },
  ];

  const filteredQuickActions = quickActions.filter(action => hasRole(action.roles));

  // Helper function to get icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admission': return UserPlus;
      case 'leave': return CheckCircle;
      case 'payment': return CheckCircle;
      case 'exam': return Calendar;
      case 'attendance': return CheckCircle;
      case 'announcement': return Bell;
      default: return Bell;
    }
  };

  // Helper function to get color for notification type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'admission': return 'text-green-600';
      case 'leave': return 'text-blue-600';
      case 'payment': return 'text-green-600';
      case 'exam': return 'text-purple-600';
      case 'attendance': return 'text-orange-600';
      case 'announcement': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  // Helper function to get event category color
  const getEventCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting': return 'bg-blue-100 text-blue-800';
      case 'exam': return 'bg-red-100 text-red-800';
      case 'sports': return 'bg-green-100 text-green-800';
      case 'academic': return 'bg-purple-100 text-purple-800';
      case 'cultural': return 'bg-pink-100 text-pink-800';
      case 'holiday': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-green-100 text-lg">
              Here's what's happening at your school today.
            </p>
          </div>
          <div className="text-right">
            <p className="text-green-100 text-sm">Today's Date</p>
            <p className="text-xl font-semibold">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard Statistics */}
      {hasRole(['admin', 'staff']) && (
        <DashboardStats />
      )}

      {/* Alerts & Notifications */}
      {hasRole(['admin', 'staff']) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`p-4 rounded-lg border ${alert.color}`}>
              <div className="flex items-center space-x-3">
                <alert.icon className="w-5 h-5" />
                <div>
                  <h3 className="font-semibold">{alert.title}</h3>
                  <p className="text-sm opacity-90">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <TrendingUp className="w-6 h-6 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredQuickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => navigate(action.path)}
              className={`${action.color} text-white p-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl`}
            >
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                  <action.icon className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="font-bold text-lg">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Bell className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
            </div>
            <button 
              onClick={() => navigate('/notifications')}
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : activities.length > 0 ? (
              activities.map((activity) => {
                const IconComponent = getNotificationIcon(activity.type);
                const color = getNotificationColor(activity.type);
                return (
                  <div 
                    key={activity.id} 
                    className={`flex items-start space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
                      !activity.recipient?.is_read ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      markAsRead(activity.id);
                      // Navigate to notifications page instead of opening new tab
                      navigate('/notifications');
                    }}
                  >
                    <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${color}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-gray-600 text-sm">{activity.description}</p>
                      <p className="text-gray-500 text-xs mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {formatRelativeTime(activity.created_at)}
                      </p>
                    </div>
                    {!activity.recipient?.is_read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No recent activities</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Calendar className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Upcoming Events</h2>
            </div>
            <button 
              onClick={() => navigate('/events')}
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>View Calendar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {eventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : events.length > 0 ? (
              events.map((event) => (
                <div key={event.id} className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-sm text-gray-600">
                        {new Date(event.start_date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-600 flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {new Date(event.start_date).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    {event.location && (
                      <p className="text-xs text-gray-500 mt-1">{event.location}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEventCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                    {event.registration_required && (
                      <button
                        onClick={() => event.user_attendance 
                          ? cancelRegistration(event.id) 
                          : registerForEvent(event.id)
                        }
                        className={`text-xs px-2 py-1 rounded ${
                          event.user_attendance 
                            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {event.user_attendance ? 'Cancel' : 'Register'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming events</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      {hasRole(['admin', 'staff', 'student']) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <CalendarDays className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">Today's Schedule</h2>
            </div>
            <button 
              onClick={() => navigate('/timetable')}
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>Full Schedule</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {todaySchedule.map((item, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg hover:border-green-300 transition-colors">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-600">{item.time}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{item.subject}</h3>
                <p className="text-sm text-gray-600">{item.class}</p>
                <p className="text-xs text-gray-500">{item.teacher}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Logs Section for Admins */}
      {hasRole(['admin', 'super_admin']) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Settings className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">System Logs</h2>
            </div>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="text-green-600 hover:text-green-700 font-medium flex items-center space-x-1"
            >
              <span>View All Logs</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <LogViewer />
        </div>
      )}
    </div>
  );
};

export default Dashboard;