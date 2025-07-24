import React, { useState, useEffect } from 'react';
import { logger } from '../../lib/logger';
import { useAuth } from '../../contexts/AuthContext';
import { Download, Trash2, RefreshCw, Filter, Search, Eye, EyeOff } from 'lucide-react';

interface LogViewerProps {
  className?: string;
}

export const LogViewer: React.FC<LogViewerProps> = ({ className = '' }) => {
  const { hasRole } = useAuth();
  const [logs, setLogs] = useState<string>('');
  const [filteredLogs, setFilteredLogs] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Check if user has admin role
  if (!hasRole(['admin', 'super_admin'])) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-700">Access denied. Administrator privileges required.</p>
      </div>
    );
  }

  const categories = ['all', 'SESSION', 'AUTH', 'SECURITY', 'DATABASE', 'ERROR'];

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const allLogs = await logger.exportLogs(selectedCategory === 'all' ? undefined : selectedCategory);
      setLogs(allLogs);
      filterLogs(allLogs, searchTerm);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = (logContent: string, search: string) => {
    let filtered = logContent;
    
    if (search.trim()) {
      const lines = logContent.split('\n');
      const matchingLines = lines.filter(line => 
        line.toLowerCase().includes(search.toLowerCase())
      );
      filtered = matchingLines.join('\n');
    }

    // Hide sensitive data if not authorized
    if (!showSensitiveData) {
      filtered = filtered.replace(/User: [a-f0-9-]{36}/g, 'User: [HIDDEN]');
      filtered = filtered.replace(/Session: session_\d+_[a-z0-9]+/g, 'Session: [HIDDEN]');
      filtered = filtered.replace(/"email":\s*"[^"]+"/g, '"email": "[HIDDEN]"');
      filtered = filtered.replace(/"userId":\s*"[^"]+"/g, '"userId": "[HIDDEN]"');
    }

    setFilteredLogs(filtered);
  };

  const downloadLogs = () => {
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dugsi_logs_${selectedCategory}_${new Date().toISOString().split('T')[0]}.log`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearLogs = () => {
    if (window.confirm(`Are you sure you want to clear ${selectedCategory === 'all' ? 'all' : selectedCategory} logs?`)) {
      logger.clearLogs(selectedCategory === 'all' ? undefined : selectedCategory);
      setLogs('');
      setFilteredLogs('');
    }
  };

  useEffect(() => {
    loadLogs();
  }, [selectedCategory]);

  useEffect(() => {
    filterLogs(logs, searchTerm);
  }, [logs, searchTerm, showSensitiveData]);

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">System Logs</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSensitiveData(!showSensitiveData)}
            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
              showSensitiveData 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title={showSensitiveData ? 'Hide sensitive data' : 'Show sensitive data'}
          >
            {showSensitiveData ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
            {showSensitiveData ? 'Hide Sensitive' : 'Show Sensitive'}
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Category Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="flex items-center space-x-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          
          <button
            onClick={downloadLogs}
            disabled={!logs}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
          
          <button
            onClick={clearLogs}
            disabled={!logs}
            className="flex items-center px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </button>
        </div>
      </div>

      {/* Log Display */}
      <div className="border border-gray-300 rounded-lg">
        <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
          <h3 className="text-sm font-medium text-gray-700">
            {selectedCategory === 'all' ? 'All Logs' : `${selectedCategory} Logs`}
            {searchTerm && ` (filtered by: "${searchTerm}")`}
          </h3>
        </div>
        
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-500" />
              <span className="ml-2 text-gray-500">Loading logs...</span>
            </div>
          ) : filteredLogs ? (
            <pre className="text-xs text-gray-800 whitespace-pre-wrap font-mono bg-gray-50 p-4 rounded border max-h-96 overflow-y-auto">
              {filteredLogs}
            </pre>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {logs ? 'No logs match your search criteria.' : 'No logs available.'}
            </div>
          )}
        </div>
      </div>

      {/* Log Statistics */}
      {logs && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Total Lines</h4>
            <p className="text-2xl font-bold text-blue-900">{logs.split('\n').length}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Filtered Lines</h4>
            <p className="text-2xl font-bold text-green-900">{filteredLogs.split('\n').length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Log Size</h4>
            <p className="text-2xl font-bold text-purple-900">
              {(new Blob([logs]).size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogViewer;