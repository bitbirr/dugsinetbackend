import React, { useState } from 'react';
import { 
  Plus, 
  Heart, 
  AlertTriangle, 
  Pill, 
  Shield, 
  Activity,
  Calendar,
  User,
  Edit,
  Trash2
} from 'lucide-react';
import { StudentProfile, StudentHealthRecord } from '../../../types';
import { db } from '../../../lib/supabase';

interface HealthRecordsTabProps {
  student: StudentProfile;
  canEdit: boolean;
  onUpdate: (studentId: string) => void;
}

const HealthRecordsTab: React.FC<HealthRecordsTabProps> = ({ student, canEdit, onUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StudentHealthRecord | null>(null);
  const [formData, setFormData] = useState({
    record_type: 'medical_condition' as const,
    title: '',
    description: '',
    severity: 'medium' as const,
    date_recorded: new Date().toISOString().split('T')[0],
    expiry_date: '',
    doctor_name: '',
    hospital_clinic: '',
    medication_dosage: '',
    special_instructions: '',
    requires_attention: false
  });

  const recordTypeIcons = {
    medical_condition: Heart,
    allergy: AlertTriangle,
    medication: Pill,
    vaccination: Shield,
    injury: Activity,
    illness: Activity,
    checkup: Activity
  };

  const severityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRecord) {
        await db.updateStudentHealthRecord(editingRecord.id, formData);
      } else {
        await db.createStudentHealthRecord(student.id, formData);
      }
      setShowAddForm(false);
      setEditingRecord(null);
      resetForm();
      onUpdate(student.id);
    } catch (error) {
      console.error('Error saving health record:', error);
    }
  };

  const handleDelete = async (recordId: string) => {
    if (window.confirm('Are you sure you want to delete this health record?')) {
      try {
        await db.deleteStudentHealthRecord(recordId);
        onUpdate(student.id);
      } catch (error) {
        console.error('Error deleting health record:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      record_type: 'medical_condition',
      title: '',
      description: '',
      severity: 'medium',
      date_recorded: new Date().toISOString().split('T')[0],
      expiry_date: '',
      doctor_name: '',
      hospital_clinic: '',
      medication_dosage: '',
      special_instructions: '',
      requires_attention: false
    });
  };

  const startEdit = (record: StudentHealthRecord) => {
    setEditingRecord(record);
    setFormData({
      record_type: record.record_type,
      title: record.title,
      description: record.description || '',
      severity: record.severity || 'medium',
      date_recorded: record.date_recorded,
      expiry_date: record.expiry_date || '',
      doctor_name: record.doctor_name || '',
      hospital_clinic: record.hospital_clinic || '',
      medication_dosage: record.medication_dosage || '',
      special_instructions: record.special_instructions || '',
      requires_attention: record.requires_attention
    });
    setShowAddForm(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Health Records</h3>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Health Record</span>
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingRecord ? 'Edit Health Record' : 'Add New Health Record'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Record Type</label>
                <select
                  value={formData.record_type}
                  onChange={(e) => setFormData({ ...formData, record_type: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="medical_condition">Medical Condition</option>
                  <option value="allergy">Allergy</option>
                  <option value="medication">Medication</option>
                  <option value="vaccination">Vaccination</option>
                  <option value="injury">Injury</option>
                  <option value="illness">Illness</option>
                  <option value="checkup">Checkup</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value as any })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Recorded</label>
                <input
                  type="date"
                  value={formData.date_recorded}
                  onChange={(e) => setFormData({ ...formData, date_recorded: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  value={formData.doctor_name}
                  onChange={(e) => setFormData({ ...formData, doctor_name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital/Clinic</label>
                <input
                  type="text"
                  value={formData.hospital_clinic}
                  onChange={(e) => setFormData({ ...formData, hospital_clinic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {formData.record_type === 'medication' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Dosage</label>
                <input
                  type="text"
                  value={formData.medication_dosage}
                  onChange={(e) => setFormData({ ...formData, medication_dosage: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 10mg twice daily"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions</label>
              <textarea
                value={formData.special_instructions}
                onChange={(e) => setFormData({ ...formData, special_instructions: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requires_attention"
                checked={formData.requires_attention}
                onChange={(e) => setFormData({ ...formData, requires_attention: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="requires_attention" className="ml-2 block text-sm text-gray-900">
                Requires immediate attention
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingRecord(null);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingRecord ? 'Update' : 'Add'} Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Health Records List */}
      <div className="space-y-4">
        {student.health_records.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No health records found</p>
          </div>
        ) : (
          student.health_records.map((record) => {
            const Icon = recordTypeIcons[record.record_type];
            return (
              <div key={record.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <Icon className="w-6 h-6 text-blue-600 mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{record.title}</h4>
                        {record.severity && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[record.severity]}`}>
                            {record.severity}
                          </span>
                        )}
                        {record.requires_attention && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            Attention Required
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 capitalize mb-2">
                        {record.record_type.replace('_', ' ')}
                      </p>
                      {record.description && (
                        <p className="text-gray-700 mb-3">{record.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Date Recorded:</span>
                          <span className="ml-2 text-gray-600">
                            {new Date(record.date_recorded).toLocaleDateString()}
                          </span>
                        </div>
                        {record.expiry_date && (
                          <div>
                            <span className="font-medium text-gray-700">Expires:</span>
                            <span className="ml-2 text-gray-600">
                              {new Date(record.expiry_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {record.doctor_name && (
                          <div>
                            <span className="font-medium text-gray-700">Doctor:</span>
                            <span className="ml-2 text-gray-600">{record.doctor_name}</span>
                          </div>
                        )}
                        {record.hospital_clinic && (
                          <div>
                            <span className="font-medium text-gray-700">Hospital/Clinic:</span>
                            <span className="ml-2 text-gray-600">{record.hospital_clinic}</span>
                          </div>
                        )}
                        {record.medication_dosage && (
                          <div>
                            <span className="font-medium text-gray-700">Dosage:</span>
                            <span className="ml-2 text-gray-600">{record.medication_dosage}</span>
                          </div>
                        )}
                      </div>
                      {record.special_instructions && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                          <span className="font-medium text-