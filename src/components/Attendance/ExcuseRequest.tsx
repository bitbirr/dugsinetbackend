import React, { useState, useEffect } from 'react';
import { FileText, Upload, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceExcuse } from '../../types/attendance';
import { useAuth } from '../../contexts/AuthContext';

const ExcuseRequest: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [excuses, setExcuses] = useState<AttendanceExcuse[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    excuse_type: 'medical' as const,
    reason: '',
    supporting_documents: [] as string[]
  });

  useEffect(() => {
    loadExcuses();
  }, []);

  const loadExcuses = async () => {
    setLoading(true);
    try {
      const excusesData = await AttendanceService.getExcuses();
      setExcuses(excusesData);
    } catch (error) {
      console.error('Failed to load excuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await AttendanceService.submitExcuse({
        ...formData,
        submitted_by: user?.id || '',
        status: 'pending'
      });
      
      setShowForm(false);
      setFormData({
        student_id: '',
        excuse_type: 'medical',
        reason: '',
        supporting_documents: []
      });
      loadExcuses();
      alert('Excuse request submitted successfully!');
    } catch (error) {
      console.error('Failed to submit excuse:', error);
      alert('Failed to submit excuse request. Please try again.');
    }
  };

  const handleReviewExcuse = async (id: string, status: 'approved' | 'rejected', notes?: string) => {
    try {
      await AttendanceService.reviewExcuse(id, status, notes, user?.id);
      loadExcuses();
      alert(`Excuse ${status} successfully!`);
    } catch (error) {
      console.error('Failed to review excuse:', error);
      alert('Failed to review excuse. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Excuse Requests</h1>
          <p className="text-gray-600 mt-2">Submit and manage attendance excuse requests</p>
        </div>
        {hasRole(['parent']) && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FileText className="w-5 h-5" />
            <span>Submit Excuse</span>
          </button>
        )}
      </div>

      {/* Excuse Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Excuse Request</h2>
            
            <form onSubmit={handleSubmitExcuse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <select
                  value={formData.student_id}
                  onChange={(e) => setFormData({...formData, student_id: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Student</option>
                  <option value="student1">Ahmed Ali (GR001)</option>
                  <option value="student2">Fatima Hassan (GR002)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excuse Type</label>
                <select
                  value={formData.excuse_type}
                  onChange={(e) => setFormData({...formData, excuse_type: e.target.value as any})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="medical">Medical</option>
                  <option value="family_emergency">Family Emergency</option>
                  <option value="religious">Religious</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Please provide details about the absence..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supporting Documents</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Upload medical certificates or other supporting documents</p>
                  <input type="file" multiple className="hidden" />
                  <button type="button" className="mt-2 text-blue-600 hover:text-blue-800 text-sm">
                    Choose Files
                  </button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Excuses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Excuse Requests</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading excuses...</p>
          </div>
        ) : excuses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>No excuse requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {excuses.map((excuse) => (
              <div key={excuse.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(excuse.status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(excuse.status)}`}>
                        {excuse.status.charAt(0).toUpperCase() + excuse.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {excuse.excuse_type.replace('_', ' ').charAt(0).toUpperCase() + excuse.excuse_type.replace('_', ' ').slice(1)}
                      </span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">
                      Student: {(excuse as any).student?.first_name} {(excuse as any).student?.last_name}
                    </h3>
                    
                    <p className="text-gray-600 mb-2">{excuse.reason}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(excuse.submitted_at).toLocaleDateString()}</span>
                      </span>
                      <span>Submitted by: {(excuse as any).submitted_by_user?.full_name}</span>
                    </div>
                    
                    {excuse.admin_notes && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Admin Notes:</strong> {excuse.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>
                  
                  {hasRole(['admin', 'staff']) && excuse.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleReviewExcuse(excuse.id, 'approved')}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter rejection reason (optional):');
                          handleReviewExcuse(excuse.id, 'rejected', notes || undefined);
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExcuseRequest;