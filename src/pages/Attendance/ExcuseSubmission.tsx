import React, { useState } from 'react';
import { FileText, Upload, Calendar, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';

const ExcuseSubmission: React.FC = () => {
  const [formData, setFormData] = useState({
    studentId: '',
    absenceDate: format(new Date(), 'yyyy-MM-dd'),
    reason: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    supportingDocuments: [] as File[]
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      // Upload supporting documents (implement file upload logic)
      const documentUrls: string[] = [];
      // For now, just using placeholder URLs
      
      const excuseData = {
        student_id: formData.studentId,
        absence_date: formData.absenceDate,
        reason: formData.reason,
        priority: formData.priority,
        supporting_documents: documentUrls,
        status: 'pending' as const,
        submitted_by: 'current-user-id' // Get from auth context
      };

      await AttendanceService.submitExcuse(excuseData);
      setMessage({ type: 'success', text: 'Excuse submitted successfully! You will be notified once it is reviewed.' });
      
      // Reset form
      setFormData({
        studentId: '',
        absenceDate: format(new Date(), 'yyyy-MM-dd'),
        reason: '',
        priority: 'medium',
        supportingDocuments: []
      });
    } catch (error) {
      console.error('Failed to submit excuse:', error);
      setMessage({ type: 'error', text: 'Failed to submit excuse. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      supportingDocuments: [...prev.supportingDocuments, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      supportingDocuments: prev.supportingDocuments.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Submit Excuse Note</h1>
        <p className="text-gray-600 mt-2">Submit an excuse for your child's absence or tardiness</p>
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

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Student</option>
              <option value="1">Ahmed Ali (GR001)</option>
              <option value="2">Fatima Hassan (GR002)</option>
              <option value="3">Omar Said (GR003)</option>
            </select>
          </div>

          {/* Absence Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Absence Date <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.absenceDate}
                onChange={(e) => setFormData(prev => ({ ...prev, absenceDate: e.target.value }))}
                required
                max={format(new Date(), 'yyyy-MM-dd')}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="flex space-x-4">
              {(['low', 'medium', 'high'] as const).map((priority) => (
                <label key={priority} className="flex items-center">
                  <input
                    type="radio"
                    value={priority}
                    checked={formData.priority === priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="mr-2 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    priority === 'high' ? 'bg-red-100 text-red-800' :
                    priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Absence <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              required
              rows={4}
              placeholder="Please provide a detailed explanation for the absence..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Supporting Documents */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Upload medical certificates, notes, or other supporting documents</p>
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
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 5MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {formData.supportingDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                {formData.supportingDocuments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-700">{file.name}</span>
                      <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                    </div>
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

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setFormData({
                  studentId: '',
                  absenceDate: format(new Date(), 'yyyy-MM-dd'),
                  reason: '',
                  priority: 'medium',
                  supportingDocuments: []
                });
                setMessage(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.studentId || !formData.reason}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>Submit Excuse</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <Clock className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-medium text-blue-900 mb-2">Important Information</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Excuse notes should be submitted within 3 days of the absence</li>
              <li>• Medical certificates are required for absences longer than 3 consecutive days</li>
              <li>• You will receive a notification once your excuse is reviewed</li>
              <li>• Approved excuses will not count against attendance records</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExcuseSubmission;