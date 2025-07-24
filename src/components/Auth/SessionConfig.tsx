import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import sessionManager from '../../lib/sessionManager';
import { Settings, Clock, Shield, Activity, Save } from 'lucide-react';

const SessionConfig: React.FC = () => {
  const { hasRole } = useAuth();
  const [config, setConfig] = useState({
    sessionTimeout: 24, // hours
    maxInactivity: 2, // hours
    refreshThreshold: 5, // minutes
    persistSession: true,
  });
  const [saved, setSaved] = useState(false);

  if (!hasRole('admin')) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  const handleSave = () => {
    // In a real application, you would save this to a backend
    // For now, we'll just show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} minutes`;
    }
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">Session Configuration</h2>
      </div>

      <div className="space-y-6">
        {/* Session Timeout */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4" />
            <span>Session Timeout</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="48"
              value={config.sessionTimeout}
              onChange={(e) => setConfig({ ...config, sessionTimeout: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-20">
              {formatTime(config.sessionTimeout)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            How long a session remains valid before requiring re-authentication
          </p>
        </div>

        {/* Max Inactivity */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Activity className="w-4 h-4" />
            <span>Maximum Inactivity</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0.25"
              max="8"
              step="0.25"
              value={config.maxInactivity}
              onChange={(e) => setConfig({ ...config, maxInactivity: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-20">
              {formatTime(config.maxInactivity)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Auto-logout after this period of inactivity
          </p>
        </div>

        {/* Refresh Threshold */}
        <div>
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4" />
            <span>Token Refresh Threshold</span>
          </label>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="1"
              max="30"
              value={config.refreshThreshold}
              onChange={(e) => setConfig({ ...config, refreshThreshold: Number(e.target.value) })}
              className="flex-1"
            />
            <span className="text-sm text-gray-600 w-20">
              {config.refreshThreshold} min
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Refresh tokens when this much time is left before expiry
          </p>
        </div>

        {/* Persist Session */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={config.persistSession}
              onChange={(e) => setConfig({ ...config, persistSession: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <span className="text-sm font-medium text-gray-700">Persist sessions across browser restarts</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-6">
            Keep users logged in when they close and reopen their browser
          </p>
        </div>

        {/* Save Button */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Changes will apply to new sessions
          </div>
          <button
            onClick={handleSave}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              saved
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionConfig;