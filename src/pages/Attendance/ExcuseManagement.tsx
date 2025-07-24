import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle, XCircle, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceExcuse } from '../../types/attendance';

const ExcuseManagement: React.FC = () => {
  const [excuses, setExcuses] = useState<AttendanceExcuse[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('pending');
  const [loading, setLoading] = useState(false);
  const [selectedExcuse, setSelectedExcuse] = useState<AttendanceExcuse | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  useEffect(() => {
    loadExcuses();
  }, [selectedStatus]);

  const loadExcuses = async () => {
    setLoading(true);
    try {
      const data = await AttendanceService.getExcuses(undefined, selectedStatus);
      setExcuses(data);
    } catch (error) {
      console.error('Failed to load excuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await AttendanceService.reviewExcuse(id, status, reviewNotes);
      setShowModal(false);
      setSelectedExcuse(null);
      setReviewNotes('');
      loadExcuses();
    } catch (error) {
      console.error('Failed to review excuse:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Excuse Management</h1>
          <p className="text-gray-600 mt-2">Review and approve absence/tardy excuse notes</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {['pending', 'approved', 'rejected'].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedStatus === status
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Excuses List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Excuses</span>
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading excuses...</p>
          </div>
        ) : excuses.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No {selectedStatus} excuses found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {excuses.map((excuse) => (
              <div key={excuse.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {excuse.student?.first_name} {excuse.student?.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{excuse.student?.gr_number}</p>
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(excuse.status)}`}>
                          {excuse.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(excuse.priority)}`}>
                          {excuse.priority} priority
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Absence Date: {format(new Date(excuse.absence_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Submitted: {format(new Date(excuse.created_at), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Reason:</h4>
                      <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{excuse.reason}</p>
                    </div>

                    {excuse.supporting_documents && excuse.supporting_documents.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Supporting Documents:</h4>
                        <div className="flex space-x-2">
                          {excuse.supporting_documents.map((doc, index) => (
                            <a
                              key={index}
                              href={doc}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm underline"
                            >
                              Document {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {excuse.admin_notes && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Admin Notes:</h4>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{excuse.admin_notes}</p>
                      </div>
                    )}

                    <div className="text-sm text-gray-600">
                      <p>Submitted by: {excuse.submitted_by_user?.full_name}</p>
                      {excuse.reviewed_by_user && (
                        <p>Reviewed by: {excuse.reviewed_by_user.full_name} on {format(new Date(excuse.reviewed_at!), 'MMM d, yyyy h:mm a')}</p>
                      )}
                    </div>
                  </div>

                  {excuse.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedExcuse(excuse);
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                        title="Review"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showModal && selectedExcuse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Review Excuse - {selectedExcuse.student?.first_name} {selectedExcuse.student?.last_name}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Add any notes about your decision..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => handleReview(selectedExcuse.id, 'approved')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve</span>
                </button>
                <button
                  onClick={() => handleReview(selectedExcuse.id, 'rejected')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedExcuse(null);
                    setReviewNotes('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcuseManagement;