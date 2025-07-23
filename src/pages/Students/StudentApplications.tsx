import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { StudentApplicationWithId, StudentGuardian, StudentDocument } from '../../types';
import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Download 
} from 'lucide-react';

const StudentApplications: React.FC = () => {
  const { hasRole } = useAuth();
  const [applications, setApplications] = useState<StudentApplicationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState<StudentApplicationWithId | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select(`
          *,
          student_guardians(*),
          student_documents(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'enrolled' | 'rejected') => {
    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error } = await supabase
        .from('students')
        .update({ enrollment_status: status })
        .eq('id', applicationId);

      if (error) throw error;

      setSuccess(`Application ${status} successfully`);
      setShowModal(false);
      loadApplications();
    } catch (error) {
      console.error('Error updating application:', error);
      setError('Failed to update application status');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.gr_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.enrollment_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            Pending
          </span>
        );
      case 'enrolled':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            Enrolled
          </span>
        );
      case 'rejected':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            Rejected
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const openApplicationModal = (application: StudentApplicationWithId) => {
    setSelectedApplication(application);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
  };

  const ApplicationModal = () => {
    if (!selectedApplication) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-gray-900">{selectedApplication.first_name} {selectedApplication.last_name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">GR Number</label>
                  <p className="text-gray-900">{selectedApplication.gr_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">{formatDate(selectedApplication.date_of_birth)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="text-gray-900 capitalize">{selectedApplication.gender}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nationality</label>
                  <p className="text-gray-900">{selectedApplication.nationality}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                  <p className="text-gray-900">{selectedApplication.blood_group || 'Not specified'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <p className="text-gray-900">{selectedApplication.address}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Emergency Contact</label>
                  <p className="text-gray-900">{selectedApplication.emergency_contact}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous School</label>
                  <p className="text-gray-900">{selectedApplication.previous_school || 'Not specified'}</p>
                </div>
                {selectedApplication.medical_conditions && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                    <p className="text-gray-900">{selectedApplication.medical_conditions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Guardian Information */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <User className="w-5 h-5 mr-2" />
                Guardian Information
              </h3>
              {selectedApplication.student_guardians?.map((guardian: StudentGuardian, index: number) => (
                <div key={guardian.id || index} className="mb-4 last:mb-0 p-3 bg-white rounded border">
                  <div className="font-medium text-gray-700 mb-2">
                    {guardian.full_name} {guardian.is_primary && '(Primary)'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {guardian.relationship}
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 mr-1" />
                      {guardian.phone}
                    </div>
                    {guardian.email && (
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {guardian.email}
                      </div>
                    )}
                    {guardian.occupation && (
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {guardian.occupation}
                      </div>
                    )}
                  </div>
                  {guardian.address && (
                    <div className="mt-2 text-sm text-gray-600 flex items-start">
                      <MapPin className="w-4 h-4 mr-1 mt-0.5" />
                      {guardian.address}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Documents */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Documents
              </h3>
              <div className="space-y-2">
                {selectedApplication.student_documents?.map((doc: StudentDocument) => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{doc.document_name}</div>
                        <div className="text-xs text-gray-500">{doc.document_type.replace('_', ' ').toUpperCase()}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      View
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {selectedApplication.enrollment_status === 'pending' && hasRole(['admin']) && (
              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'enrolled')}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve Application'}
                </button>
                <button
                  onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                  disabled={actionLoading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Reject Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (!hasRole(['admin', 'staff'])) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to view student applications.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Applications</h1>
          <p className="text-gray-600 mt-1">Review and manage student admission applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or GR number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="enrolled">Enrolled</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-800">{success}</span>
          </div>
        </div>
      )}

      {/* Applications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
              <p className="text-gray-600">No student applications match your current filters.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    GR Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date of Birth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applied Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                            <User className="h-5 w-5 text-green-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.first_name} {application.last_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.gender} • {application.nationality}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {application.gr_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(application.date_of_birth).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.enrollment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(application.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => openApplicationModal(application)}
                        className="flex items-center text-green-600 hover:text-green-900"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && <ApplicationModal />}
    </div>
  );
};

export default StudentApplications;