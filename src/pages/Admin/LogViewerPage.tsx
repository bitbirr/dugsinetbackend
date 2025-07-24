import React from 'react';
import LogViewer from '../../components/Admin/LogViewer';

const LogViewerPage: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600 mt-2">Monitor system activities and troubleshoot issues</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <LogViewer />
      </div>
    </div>
  );
};

export default LogViewerPage;