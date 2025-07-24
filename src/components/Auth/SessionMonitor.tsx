import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Clock, User, Shield, Activity, RefreshCw } from 'lucide-react';

interface SessionMonitorProps {
  showDetails?: boolean;
  className?: string;
}

const SessionMonitor: React.FC<SessionMonitorProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const { sessionInfo, isAuthenticated } = useAuth();
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (milliseconds: number | null): string => {
    if (!milliseconds || milliseconds <= 0) return 'Expired';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusColor = (timeLeft: number | null): string => {
    if (!timeLeft || timeLeft <= 0) return 'text-red-500';
    if (timeLeft < 5 * 60 * 1000) return 'text-yellow-500'; // Less than 5 minutes
    return 'text-green-500';
  };

  if (!isAuthenticated) {
    return (
      <div className={`flex items-center space-x-2 text-gray-500 ${className}`}>
        <Shield className="w-4 h-4" />
        <span className="text-sm">Not authenticated</span>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">Session active</span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Session Status</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* User Info */}
        <div className="flex items-center space-x-3">
          <User className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-800">
              {sessionInfo.user?.full_name || 'Unknown User'}
            </p>
            <p className="text-xs text-gray-500">{sessionInfo.user?.email}</p>
          </div>
        </div>

        {/* Role */}
        <div className="flex items-center space-x-3">
          <Shield className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Role</p>
            <p className="text-sm font-medium text-gray-800 capitalize">
              {sessionInfo.user?.role}
            </p>
          </div>
        </div>

        {/* Session Expiry */}
        <div className="flex items-center space-x-3">
          <Clock className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Session expires in</p>
            <p className={`text-sm font-medium ${getStatusColor(sessionInfo.timeUntilExpiry)}`}>
              {formatTime(sessionInfo.timeUntilExpiry)}
            </p>
          </div>
        </div>

        {/* Inactivity Timer */}
        <div className="flex items-center space-x-3">
          <Activity className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Auto-logout in</p>
            <p className={`text-sm font-medium ${getStatusColor(sessionInfo.timeUntilInactivity)}`}>
              {formatTime(sessionInfo.timeUntilInactivity)}
            </p>
          </div>
        </div>

        {/* Last Activity */}
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-5 h-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-600">Last activity</p>
            <p className="text-sm font-medium text-gray-800">
              {sessionInfo.lastActivity?.toLocaleTimeString() || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Session Details */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <details className="text-xs text-gray-500">
          <summary className="cursor-pointer hover:text-gray-700">
            Technical Details
          </summary>
          <div className="mt-2 space-y-1">
            <p>Session expires: {sessionInfo.expiresAt?.toLocaleString()}</p>
            <p>Last activity: {sessionInfo.lastActivity?.toLocaleString()}</p>
            <p>User ID: {sessionInfo.user?.id}</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default SessionMonitor;