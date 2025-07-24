import React, { useState } from 'react';
import { Bell, Search, Filter, CheckCircle, Clock, AlertTriangle, Info, X } from 'lucide-react';
import { useRecentActivities } from '../../hooks/useNotifications';
import { NotificationType, NotificationPriority } from '../../types/notifications';

const NotificationsPage = () => {
  const { activities, loading, markAsRead, markAllAsRead } = useRecentActivities(100);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<NotificationPriority | 'all'>('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const notificationTypes: { value: NotificationType | 'all'; label: string }[] = [
    { value: 'all', label: 'All Types' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'assignment', label: 'Assignments' },
    { value: 'exam', label: 'Exams' },
    { value: 'event', label: 'Events' },
    { value: 'payment', label: 'Payments' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'grade', label: 'Grades' },
    { value: 'disciplinary', label: 'Disciplinary' },
    { value: 'system', label: 'System' }
  ];

  const priorityLevels: { value: NotificationPriority | 'all'; label: string }[] = [
    { value: 'all', label: 'All Priorities' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'normal', label: 'Normal' },
    { value: 'low', label: 'Low' }
  ];

  const filteredNotifications = activities.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority;
    const matchesReadStatus = !showUnreadOnly || !notification.recipient?.is_read;
    
    return matchesSearch && matchesType && matchesPriority && matchesReadStatus;
  });

  const unreadCount = activities.filter(n => !n.recipient?.is_read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'admission': return Info;
      case 'leave': return Clock;
      case 'payment': return CheckCircle;
      case 'exam': return AlertTriangle;
      case 'attendance': return CheckCircle;
      case 'announcement': return Bell;
      case 'system': return Info;
      case 'academic': return Info;
      case 'disciplinary': return AlertTriangle;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string, priority: string) => {
    if (priority === 'urgent') return 'text-red-600 bg-red-100';
    if (priority === 'high') return 'text-orange-600 bg-orange-100';
    
    switch (type) {
      case 'admission': return 'text-blue-600 bg-blue-100';
      case 'leave': return 'text-yellow-600 bg-yellow-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'exam': return 'text-red-600 bg-red-100';
      case 'attendance': return 'text-indigo-600 bg-indigo-100';
      case 'announcement': return 'text-blue-600 bg-blue-100';
      case 'system': return 'text-gray-600 bg-gray-100';
      case 'academic': return 'text-purple-600 bg-purple-100';
      case 'disciplinary': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">
            Stay updated with important announcements and activities
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div className="lg:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as NotificationType | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {notificationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="lg:w-48">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as NotificationPriority | 'all')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              {priorityLevels.map(priority => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Unread Only Toggle */}
          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showUnreadOnly}
                onChange={(e) => setShowUnreadOnly(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">Unread only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClasses = getNotificationColor(notification.type, notification.priority);
              const isUnread = !notification.recipient?.is_read;
              
              return (
                <div 
                  key={notification.id} 
                  className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                    isUnread ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${colorClasses}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                            {notification.title}
                          </h3>
                          {notification.description && (
                            <p className="text-gray-600 mt-1">
                              {notification.description}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                          {isUnread && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="capitalize">{notification.type}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all' || selectedPriority !== 'all' || showUnreadOnly
                ? 'Try adjusting your search or filter criteria.' 
                : 'You\'re all caught up! No notifications to display.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;