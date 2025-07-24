import React, { useState } from 'react';
import { db } from '../../lib/supabase';
import { CreateHealthRecordForm } from '../../types';

interface HealthRecordFormProps {
  studentId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({
  studentId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<CreateHealthRecordForm>({
    student_id: studentId,
    record_type: 'medical_history',
    title: '',
    description: '',
    date_recorded: new Date().toISOString().split('T')[0],
    doctor_name: '',
    clinic_hospital: '',
    medications: [],
    allergies: [],
    chronic_conditions: [],
    emergency_procedures: '',
    restrictions: [],
    next_checkup_date: '',
    vaccination_name: '',
    vaccination_date: '',
    vaccination_due_date: '',
    is_confidential: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await db.createHealthRecord({
        ...formData,
        recorded_by: 'current-user-id', // This should come from auth context
      });
      if (error) throw error;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleArrayChange = (field: 'medications' | 'allergies' | 'chronic_conditions' | 'restrictions', value: string) => {
    const items = value.split('\n').filter(item => item.trim());
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">Add Health Record</h3>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Record Type
              </label>
              <select
                name="record_type"
                value={formData.record_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="medical_history">Medical History</option>
                <option value="vaccination">Vaccination</option>
                <option value="allergy">Allergy</option>
                <option value="medication">Medication</option>
                <option value="emergency_contact">Emergency Contact</option>
                <option value="physical_exam">Physical Exam</option>
                <option value="dental_exam">Dental Exam</option>
                <option value="vision_test">Vision Test</option>
                <option value="incident">Medical Incident</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Recorded
              </label>
              <input
                type="date"
                name="date_recorded"
                value={formData.date_recorded}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Brief title for this health record"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Detailed description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Doctor Name
              </label>
              <input
                type="text"
                name="doctor_name"
                value={formData.doctor_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Clinic/Hospital
              </label>
              <input
                type="text"
                name="clinic_hospital"
                value={formData.clinic_hospital}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Vaccination specific fields */}
          {formData.record_type === 'vaccination' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccination Name
                </label>
                <input
                  type="text"
                  name="vaccination_name"
                  value={formData.vaccination_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vaccination Date
                </label>
                <input
                  type="date"
                  name="vaccination_date"
                  value={formData.vaccination_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  name="vaccination_due_date"
                  value={formData.vaccination_due_date}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Medications (one per line)
            </label>
            <textarea
              value={formData.medications?.join('\n') || ''}
              onChange={(e) => handleArrayChange('medications', e.target.value)}
              rows={2}
              placeholder="List medications, one per line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Allergies (one per line)
            </label>
            <textarea
              value={formData.allergies?.join('\n') || ''}
              onChange={(e) => handleArrayChange('allergies', e.target.value)}
              rows={2}
              placeholder="List allergies, one per line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chronic Conditions (one per line)
            </label>
            <textarea
              value={formData.chronic_conditions?.join('\n') || ''}
              onChange={(e) => handleArrayChange('chronic_conditions', e.target.value)}
              rows={2}
              placeholder="List chronic conditions, one per line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Restrictions (one per line)
            </label>
            <textarea
              value={formData.restrictions?.join('\n') || ''}
              onChange={(e) => handleArrayChange('restrictions', e.target.value)}
              rows={2}
              placeholder="List any restrictions, one per line"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Emergency Procedures
            </label>
            <textarea
              name="emergency_procedures"
              value={formData.emergency_procedures}
              onChange={handleChange}
              rows={2}
              placeholder="Emergency procedures to follow"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Next Checkup Date
            </label>
            <input
              type="date"
              name="next_checkup_date"
              value={formData.next_checkup_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_confidential"
              checked={formData.is_confidential}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Mark as confidential (restricted access)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HealthRecordForm;