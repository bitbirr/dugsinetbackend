import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceRecord, AttendancePeriod, AttendanceStatus } from '../../types/attendance';
import { useAuth } from '../../contexts/AuthContext';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  gr_number: string;
  photo_url?: string;
}

const AttendanceMarking: React.FC = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<AttendancePeriod[]>([]);
  const [attendanceData, setAttendanceData] = useState<Map<string, AttendanceStatus>>(new Map());
  const [remarks, setRemarks] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadStudents();
      loadExistingAttendance();
    }
  }, [selectedClass, selectedDate, selectedPeriod]);

  const loadPeriods = async () => {
    if (!selectedClass) return;
    
    try {
      const dayOfWeek = new Date(selectedDate).getDay() || 7; // Convert Sunday (0) to 7
      const periodsData = await AttendanceService.getAttendancePeriods(selectedClass, dayOfWeek);
      setPeriods(periodsData);
    } catch (error) {
      console.error('Failed to load periods:', error);
    }
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      // This would be implemented in your student service
      // const studentsData = await StudentService.getStudentsByClass(selectedClass);
      // setStudents(studentsData);
      
      // Mock data for now
      setStudents([
        { id: '1', first_name: 'Ahmed', last_name: 'Ali', gr_number: 'GR001' },
        { id: '2', first_name: 'Fatima', last_name: 'Hassan', gr_number: 'GR002' },
        { id: '3', first_name: 'Omar', last_name: 'Said', gr_number: 'GR003' },
      ]);
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingAttendance = async () => {
    try {
      const existingAttendance = await AttendanceService.getAttendanceByDate(selectedDate, selectedClass);
      const attendanceMap = new Map<string, AttendanceStatus>();
      const remarksMap = new Map<string, string>();
      
      existingAttendance.forEach(record => {
        if (record.student_id && (!selectedPeriod || record.period_id === selectedPeriod)) {
          attendanceMap.set(record.student_id, record.status);
          if (record.remarks) {
            remarksMap.set(record.student_id, record.remarks);
          }
        }
      });
      
      setAttendanceData(attendanceMap);
      setRemarks(remarksMap);
    } catch (error) {
      console.error('Failed to load existing attendance:', error);
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceStatus) => {
    const newAttendanceData = new Map(attendanceData);
    newAttendanceData.set(studentId, status);
    setAttendanceData(newAttendanceData);
  };

  const handleRemarksChange = (studentId: string, remark: string) => {
    const newRemarks = new Map(remarks);
    newRemarks.set(studentId, remark);
    setRemarks(newRemarks);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    try {
      const attendanceRecords = students.map(student => ({
        student_id: student.id,
        date: selectedDate,
        period_id: selectedPeriod || null,
        status: attendanceData.get(student.id) || 'present',
        remarks: remarks.get(student.id) || null,
        check_in_time: new Date().toISOString(),
        created_by: user?.id
      }));

      await AttendanceService.markAttendance(attendanceRecords);
      
      // Send notifications for absences
      for (const student of students) {
        const status = attendanceData.get(student.id);
        if (status === 'absent' || status === 'late') {
          await AttendanceService.sendAbsenceNotification(student.id, selectedDate, status);
        }
      }

      alert('Attendance saved successfully!');
    } catch (error) {
      console.error('Failed to save attendance:', error);
      alert('Failed to save attendance. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused_absent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'excused_late': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'half_day': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'sick': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return <CheckCircle className="w-4 h-4" />;
      case 'absent': return <AlertCircle className="w-4 h-4" />;
      case 'late': return <Clock className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Record student attendance for classes and periods</p>
        </div>
        <button
          onClick={handleSaveAttendance}
          disabled={saving || students.length === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
        </button>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Class</option>
              <option value="class1">Grade 7-A</option>
              <option value="class2">Grade 7-B</option>
              <option value="class3">Grade 8-A</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Day</option>
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.start_time} - {period.end_time})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                const newAttendanceData = new Map<string, AttendanceStatus>();
                students.forEach(student => {
                  newAttendanceData.set(student.id, 'present');
                });
                setAttendanceData(newAttendanceData);
              }}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Mark All Present
            </button>
          </div>
        </div>
      </div>

      {/* Student List */}
      {selectedClass && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Students - {format(new Date(selectedDate), 'MMMM d, yyyy')}</span>
            </h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading students...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const status = attendanceData.get(student.id) || 'present';
                const studentRemarks = remarks.get(student.id) || '';
                
                return (
                  <div key={student.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {student.first_name.charAt(0)}{student.last_name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {student.first_name} {student.last_name}
                          </h3>
                          <p className="text-sm text-gray-600">{student.gr_number}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex space-x-2">
                          {(['present', 'absent', 'late', 'excused_absent', 'half_day'] as AttendanceStatus[]).map((statusOption) => (
                            <button
                              key={statusOption}
                              onClick={() => handleStatusChange(student.id, statusOption)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors flex items-center space-x-1 ${
                                status === statusOption 
                                  ? getStatusColor(statusOption)
                                  : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                              }`}
                            >
                              {getStatusIcon(statusOption)}
                              <span className="capitalize">{statusOption.replace('_', ' ')}</span>
                            </button>
                          ))}
                        </div>
                        
                        <input
                          type="text"
                          placeholder="Remarks..."
                          value={studentRemarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-32"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceMarking;