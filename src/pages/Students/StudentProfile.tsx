import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  User, 
  FileText, 
  Heart, 
  Award, 
  AlertTriangle, 
  BookOpen,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Edit,
  Plus,
  Eye,
  Shield,
  Star,
  Clock,
  Users,
  Activity,
  TrendingUp,
  ArrowLeft
} from 'lucide-react';
import { db } from '../../lib/supabase';
import { StudentProfile as StudentProfileType, StudentBehavioralRecord, StudentHealthRecord, StudentAcademicHistory, StudentNote, StudentAchievement } from '../../types';
import BehavioralRecordForm from '../../components/Students/BehavioralRecordForm';
import HealthRecordForm from '../../components/Students/HealthRecordForm';
import AcademicHistoryForm from '../../components/Students/AcademicHistoryForm';
import StudentNoteForm from '../../components/Students/StudentNoteForm';
import AchievementForm from '../../components/Students/AchievementForm';

const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'academic' | 'behavioral' | 'health' | 'achievements' | 'notes'>('overview');
  const [showForm, setShowForm] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadStudentProfile(id);
    }
  }, [id]);

  const loadStudentProfile = async (studentId: string) => {
    try {
      setLoading(true);
      const { data, error } = await db.getStudentProfile(studentId);
      if (error) throw error;
      setStudent(data);
    } catch (error) {
      console.error('Error loading student profile:', error);
      setError('Failed to load student profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(null);
    if (id) {
      loadStudentProfile(id); // Reload data
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading student profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/students')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  // Student not found
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student profile you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/students')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const OverviewTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Personal Information */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-sm text-gray-900">{student.first_name} {student.last_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">GR Number</label>
              <p className="mt-1 text-sm text-gray-900">{student.gr_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
              <p className="mt-1 text-sm text-gray-900">{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : 'Not provided'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Gender</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{student.gender}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Nationality</label>
              <p className="mt-1 text-sm text-gray-900">{student.nationality}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Blood Group</label>
              <p className="mt-1 text-sm text-gray-900">{student.blood_group}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{student.email || 'No email provided'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{student.phone || 'No phone provided'}</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{student.address}</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-400" />
              <span className="text-sm text-gray-900">Emergency: {student.emergency_contact}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Grade</span>
              <span className="text-sm font-medium text-gray-900">Grade 7</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Admission Date</span>
              <span className="text-sm font-medium text-gray-900">{student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'Not provided'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Enrollment Status</span>
              <span className="text-sm font-medium text-green-600 capitalize">{student.enrollment_status}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Profile updated</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-sm text-gray-600">New achievement added</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Health record updated</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button
              onClick={() => setShowForm('behavioral')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Add Behavioral Record
            </button>
            <button
              onClick={() => setShowForm('health')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Add Health Record
            </button>
            <button
              onClick={() => setShowForm('achievement')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Add Achievement
            </button>
            <button
              onClick={() => setShowForm('note')}
              className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const AcademicTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Academic History</h3>
        <button
          onClick={() => setShowForm('academic')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Academic Year
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subject
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assessment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Score
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {!student.academic_history || student.academic_history.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No academic records found
                </td>
              </tr>
            ) : (
              student.academic_history.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.academic_year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.assessment_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.marks_obtained}/{record.total_marks}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.grade}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const BehavioralTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Behavioral Records</h3>
        <button
          onClick={() => setShowForm('behavioral')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      <div className="grid gap-4">
        {!student.behavioral_records || student.behavioral_records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No behavioral records found
          </div>
        ) : (
          student.behavioral_records.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    record.incident_type === 'achievement' || record.incident_type === 'commendation'
                      ? 'bg-green-100 text-green-800'
                      : record.incident_type === 'disciplinary' || record.incident_type === 'warning' || record.incident_type === 'suspension'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {record.incident_type}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{record.title}</span>
                  {record.severity && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      record.severity === 'critical' ? 'bg-red-100 text-red-800' :
                      record.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                      record.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {record.severity}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{new Date(record.date_occurred).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{record.description}</p>
              {record.action_taken && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Action taken:</strong> {record.action_taken}
                </p>
              )}
              {record.location && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Location:</strong> {record.location}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                <span>Reported by: {record.reported_by_name || record.reported_by}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  record.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  record.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {record.status}
                </span>
              </div>
              {record.follow_up_required && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    Follow-up required{record.follow_up_date && ` by ${new Date(record.follow_up_date).toLocaleDateString()}`}
                  </p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );

  const HealthTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Health Records</h3>
        <button
          onClick={() => setShowForm('health')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Record</span>
        </button>
      </div>

      <div className="grid gap-4">
        {!student.health_records || student.health_records.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No health records found
          </div>
        ) : (
          student.health_records.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <Heart className="w-5 h-5 text-red-500" />
                  <span className="text-sm font-medium text-gray-900 capitalize">{record.record_type.replace('_', ' ')}</span>
                  <span className="text-lg font-medium text-gray-900">{record.title}</span>
                </div>
                <span className="text-sm text-gray-500">{new Date(record.date_recorded).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{record.description}</p>
              {record.doctor_name && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Doctor:</strong> {record.doctor_name}
                </p>
              )}
              {record.clinic_hospital && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Clinic/Hospital:</strong> {record.clinic_hospital}
                </p>
              )}
              {record.medications && record.medications.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Medications:</strong> {record.medications.join(', ')}
                </p>
              )}
              {record.allergies && record.allergies.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Allergies:</strong> {record.allergies.join(', ')}
                </p>
              )}
              {record.chronic_conditions && record.chronic_conditions.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Chronic Conditions:</strong> {record.chronic_conditions.join(', ')}
                </p>
              )}
              {record.restrictions && record.restrictions.length > 0 && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Restrictions:</strong> {record.restrictions.join(', ')}
                </p>
              )}
              {record.next_checkup_date && (
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Next Checkup:</strong> {new Date(record.next_checkup_date).toLocaleDateString()}
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
                <span>Recorded by: {record.recorded_by_name || record.recorded_by}</span>
                {record.is_confidential && (
                  <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                    Confidential
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const AchievementsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>
        <button
          onClick={() => setShowForm('achievement')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Achievement</span>
        </button>
      </div>

      <div className="grid gap-4">
        {!student.achievements || student.achievements.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No achievements found
          </div>
        ) : (
          student.achievements.map((achievement) => (
            <div key={achievement.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-lg font-medium text-gray-900">{achievement.title}</span>
                </div>
                <span className="text-sm text-gray-500">{new Date(achievement.date).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{achievement.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="capitalize">{achievement.category}</span>
                <span className="capitalize">{achievement.level} level</span>
                <span>Awarded by: {achievement.awarded_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const NotesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Notes</h3>
        <button
          onClick={() => setShowForm('note')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Note</span>
        </button>
      </div>

      <div className="grid gap-4">
        {!student.notes || student.notes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
            No notes found
          </div>
        ) : (
          student.notes.map((note) => (
            <div key={note.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-blue-500" />
                  <span className="text-lg font-medium text-gray-900">{note.title}</span>
                  {note.is_confidential && (
                    <Shield className="w-4 h-4 text-red-500" title="Confidential note" />
                  )}
                </div>
                <span className="text-sm text-gray-500">{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-700 mb-2">{note.content}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="capitalize">{note.note_type}</span>
                <span>By: {note.created_by}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab />;
      case 'academic':
        return <AcademicTab />;
      case 'behavioral':
        return <BehavioralTab />;
      case 'health':
        return <HealthTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'notes':
        return <NotesTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {student.first_name} {student.last_name}
            </h1>
            <p className="text-gray-600">GR: {student.gr_number}</p>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
          <Edit className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', name: 'Overview', icon: User },
            { id: 'academic', name: 'Academic', icon: BookOpen },
            { id: 'behavioral', name: 'Behavioral', icon: AlertTriangle },
            { id: 'health', name: 'Health', icon: Heart },
            { id: 'achievements', name: 'Achievements', icon: Award },
            { id: 'notes', name: 'Notes', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {renderTabContent()}
      </div>

      {/* Forms */}
      {showForm === 'behavioral' && (
        <BehavioralRecordForm
          studentId={student.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(null)}
        />
      )}

      {showForm === 'health' && (
        <HealthRecordForm
          studentId={student.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(null)}
        />
      )}

      {showForm === 'academic' && (
        <AcademicHistoryForm
          studentId={student.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(null)}
        />
      )}

      {showForm === 'note' && (
        <StudentNoteForm
          studentId={student.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(null)}
        />
      )}

      {showForm === 'achievement' && (
        <AchievementForm
          studentId={student.id}
          onSuccess={handleFormSuccess}
          onCancel={() => setShowForm(null)}
        />
      )}
    </div>
  );
};

export default StudentProfile;