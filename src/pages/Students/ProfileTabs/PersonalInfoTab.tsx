import React from 'react';
import { 
  User, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail,
  School,
  Users,
  FileText
} from 'lucide-react';
import { StudentProfile } from '../../../types';

interface PersonalInfoTabProps {
  student: StudentProfile;
  canEdit: boolean;
  onUpdate: (studentId: string) => void;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ student, canEdit, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <p className="text-gray-900">{student.first_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <p className="text-gray-900">{student.last_name}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <p className="text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {new Date(student.date_of_birth).toLocaleDateString()}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <p className="text-gray-900 capitalize">{student.gender}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <p className="text-gray-900">{student.nationality || 'Not specified'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <p className="text-gray-900">{student.blood_group || 'Not specified'}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <p className="text-gray-900 flex items-start">
                <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                {student.address}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Phone className="w-5 h-5 mr-2" />
            Contact Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                {student.email || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <p className="text-gray-900 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                {student.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact</label>
              <p className="text-gray-900">{student.emergency_contact}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Information */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <School className="w-5 h-5 mr-2" />
          Academic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">GR Number</label>
            <p className="text-gray-900">{student.gr_number}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <p className="text-gray-900">{student.class_id || 'Not assigned'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admission Date</label>
            <p className="text-gray-900">
              {new Date(student.admission_date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Previous School</label>
            <p className="text-gray-900">{student.previous_school || 'Not specified'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment Status</label>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              student.enrollment_status === 'enrolled'
                ? 'bg-green-100 text-green-800'
                : student.enrollment_status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {student.enrollment_status}
            </span>
          </div>
        </div>
        {student.medical_conditions && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
            <p className="text-gray-900">{student.medical_conditions}</p>
          </div>
        )}
      </div>

      {/* Guardians */}
      {student.guardians && student.guardians.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Guardians
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {student.guardians.map((guardian, index) => (
              <div key={guardian.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{guardian.full_name}</h4>
                  {guardian.is_primary && (
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                      Primary
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <p><span className="font-medium">Relationship:</span> {guardian.relationship}</p>
                  <p><span className="font-medium">Phone:</span> {guardian.phone}</p>
                  {guardian.email && (
                    <p><span className="font-medium">Email:</span> {guardian.email}</p>
                  )}
                  {guardian.occupation && (
                    <p><span className="font-medium">Occupation:</span> {guardian.occupation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents */}
      {student.documents && student.documents.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Documents
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {student.documents.map((document, index) => (
              <div key={document.id || index} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 truncate">{document.document_name}</h4>
                  <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded capitalize">
                    {document.document_type.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>Size: {(document.file_size / 1024).toFixed(1)} KB</p>
                  <p>Uploaded: {new Date(document.created_at || '').toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => window.open(document.file_url, '_blank')}
                  className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonalInfoTab;