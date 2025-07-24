import React, { useState, useEffect } from 'react';
import { FileText, Upload, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceExcuse } from '../../types/attendance';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  gr_number: string;
}

const ParentExcuseSubmission: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [absenceDate, setAbsenceDate] = useState('');
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [supportingDocuments, setSupportingDocuments] = useState<File[]>([]);
  const [submittedExcuses, setSubmittedExcuses] = useState<AttendanceExcuse[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadStudents();
    loadSubmittedExcuses();
  }, []);

  const loadStudents = async () => {
    // Mock data - replace with actual API call to get parent's children
    const mockStudents: Student[] = [
      { id: '1', first_name: 'Ahmed', last_name: 'Ali', gr_number: 'GR001' },
      { id: '2', first_name: 'Fatima', last_name: 'Ali', gr_number: 'GR002' },
    ];
    setStudents(mockStudents);
    if (mockStudents.length > 0) {
      setSelectedStudent(mockStudents[0].id);
    }
  };

  const loadSubmittedExcuses = async () => {
    setLoading(true);
    try {
      // Load excuses for all children of this parent
      const excuses = await AttendanceService.getExcuses();
      setSubmittedExcuses(excuses);
    } catch (error) {
      console.error('Failed to load excuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSupportingDocuments(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSupportingDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const submitExcuse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !absenceDate || !reason.trim()) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setSubmitting(true);
    try {
      // Upload supporting documents first (implement file upload logic)
      const documentUrls: string[] = [];
      // For now, just use placeholder URLs
      supportingDocuments.forEach((_, index) => {
        documentUrls.push(`/uploads/excuse-${Date.now()}-${index}.pdf`);
      });

      const excuseData = {
        student_id: selectedStudent,
        absence_date: absenceDate,
        reason: reason.trim(),
        priority,
        supporting_documents: documentUrls,
        submitted_by: 'current-user-id', // Get from auth context
      };

      await AttendanceService.submitExcuse(excuseData);
      
      // Reset form
      setAbsenceDate('');
      setReason('');
      setPriority('medium');
      setSupportingDocuments([]);
      
      setMessage({ type: 'success', text: 'Excuse submitted successfully! It will be reviewed by school administration.' });
      loadSubmittedExcuses();
    } catch (error) {
      console.error('Failed to submit excuse:', error);
      setMessage({ type: 'error', text: 'Failed to submit excuse. Please try again.' });
    } finally {
      setSubmitting(false);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Submit Excuse Note</h1>
        <p className="text-gray-600 mt-2">Submit excuse notes for your child's absence or tardiness</p>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Excuse Submission Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Submit New Excuse</span>
          </h2>

          <form onSubmit={submitExcuse} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} ({student.gr_number})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Absence Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={absenceDate}
                  onChange={(e) => setAbsenceDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="low">Low - General absence</option>
                <option value="medium">Medium - Medical appointment</option>
                <option value="high">High - Emergency/Illness</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Absence <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Please provide a detailed explanation for the absence..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supporting Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-2">
                  Upload medical certificates, appointment letters, etc.
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer inline-block"
                >
                  Choose Files
                </label>
              </div>
              
              {supportingDocuments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {supportingDocuments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <FileText className="w-5 h-5" />
              <span>{submitting ? 'Submitting...' : 'Submit Excuse'}</span>
            </button>
          </form>
        </div>

        {/* Previously Submitted Excuses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Previous Submissions</span>
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading submissions...</p>
            </div>
          ) : submittedExcuses.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No excuse notes submitted yet</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {submittedExcuses.map((excuse) => (
                <div key={excuse.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {excuse.student?.first_name} {excuse.student?.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Absence: {format(new Date(excuse.absence_date), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(excuse.status)}`}>
                        {excuse.status}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(excuse.priority)}`}>
                        {excuse.priority}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{excuse.reason}</p>
                  
                  <div className="text-xs text-gray-500">
                    <p>Submitted: {format(new Date(excuse.created_at), 'MMM d, yyyy h:mm a')}</p>
                    {excuse.reviewed_at && (
                      <p>Reviewed: {format(new Date(excuse.reviewed_at), 'MMM d, yyyy h:mm a')}</p>
                    )}
                  </div>
                  
                  {excuse.admin_notes && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-900">Admin Notes:</p>
                      <p className="text-sm text-blue-800">{excuse.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentExcuseSubmission;