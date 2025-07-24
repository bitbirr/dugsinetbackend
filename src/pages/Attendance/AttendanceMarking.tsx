import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Users, Save, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceRecord, AttendancePeriod, AttendanceStatus } from '../../types/attendance';

interface Student {
  id: string;
  first_name: string;
  last_name: string;
  gr_number: string;
  class_id: string;
}

const AttendanceMarking: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [periods, setPeriods] = useState<AttendancePeriod[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<Map<string, AttendanceRecord>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load periods when class or date changes
  useEffect(() => {
    if (selectedClass) {
      loadPeriods();
    }
  }, [selectedClass, selectedDate]);

  // Load students and attendance when period is selected
  useEffect(() => {
    if (selectedClass && selectedPeriod) {
      loadStudentsAndAttendance();
    }
  }, [selectedClass, selectedPeriod, selectedDate]);

  const loadPeriods = async () => {
    try {
      const dayOfWeek = new Date(selectedDate).getDay();
      const periodsData = await AttendanceService.getAttendancePeriods(selectedClass, dayOfWeek);
      setPeriods(periodsData);
      if (periodsData.length > 0 && !selectedPeriod) {
        setSelectedPeriod(periodsData[0].id);
      }
    } catch (error) {
      console.error('Failed to load periods:', error);
    }
  };

  const loadStudentsAndAttendance = async () => {
    setLoading(true);
    try {
      // Load students for the class (you'll need to implement this in your service)
      // For now, using mock data
      const mockStudents: Student[] = [
        { id: '1', first_name: 'Ahmed', last_name: 'Ali', gr_number: 'GR001', class_id: selectedClass },
        { id: '2', first_name: 'Fatima', last_name: 'Hassan', gr_number: 'GR002', class_id: selectedClass },
        { id: '3', first_name: 'Omar', last_name: 'Said', gr_number: 'GR003', class_id: selectedClass },
        { id: '4', first_name: 'Maryam', last_name: 'Ali', gr_number: 'GR004', class_id: selectedClass },
      ];
      setStudents(mockStudents);

      // Load existing attendance records
      const existingRecords = await AttendanceService.getAttendanceByDate(selectedDate, selectedClass);
      const recordsMap = new Map();
      existingRecords.forEach(record => {
        if (record.period_id === selectedPeriod) {
          recordsMap.set(record.student_id, record);
        }
      });
      setAttendanceRecords(recordsMap);
    } catch (error) {
      console.error('Failed to load data:', error);
      setMessage({ type: 'error', text: 'Failed to load attendance data' });
    } finally {
      setLoading(false);
    }
  };

  const updateAttendanceStatus = (studentId: string, status: AttendanceStatus, lateMinutes?: number, remarks?: string) => {
    const existing = attendanceRecords.get(studentId);
    const updated: AttendanceRecord = {
      ...existing,
      id: existing?.id || '',
      student_id: studentId,
      date: selectedDate,
      period_id: selectedPeriod,
      status,
      late_minutes: lateMinutes || 0,
      remarks: remarks || '',
      check_in_time: status === 'present' || status === 'late' ? new Date().toISOString() : null,
    } as AttendanceRecord;

    const newRecords = new Map(attendanceRecords);
    newRecords.set(studentId, updated);
    setAttendanceRecords(newRecords);
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const recordsToSave = Array.from(attendanceRecords.values()).map(record => ({
        student_id: record.student_id,
        date: record.date,
        period_id: record.period_id,
        status: record.status,
        late_minutes: record.late_minutes || 0,
        remarks: record.remarks,
        check_in_time: record.check_in_time,
      }));

      await AttendanceService.markAttendance(recordsToSave);
      
      // Send notifications for absent students
      for (const record of recordsToSave) {
        if (record.status === 'absent') {
          await AttendanceService.sendAbsenceNotification(record.student_id, record.date, record.status);
        }
      }

      setMessage({ type: 'success', text: 'Attendance saved successfully!' });
    } catch (error) {
      console.error('Failed to save attendance:', error);
      setMessage({ type: 'error', text: 'Failed to save attendance' });
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800 border-green-200';
      case 'absent': return 'bg-red-100 text-red-800 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'half_day': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const markAllPresent = () => {
    students.forEach(student => {
      if (!attendanceRecords.has(student.id)) {
        updateAttendanceStatus(student.id, 'present');
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Record student attendance for classes and periods</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={markAllPresent}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>Mark All Present</span>
          </button>
          <button
            onClick={saveAttendance}
            disabled={saving || attendanceRecords.size === 0}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
          </button>
        </div>
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

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              <option value="grade-7a">Grade 7-A</option>
              <option value="grade-7b">Grade 7-B</option>
              <option value="grade-8a">Grade 8-A</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={periods.length === 0}
            >
              <option value="">Select Period</option>
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.start_time} - {period.end_time})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Students List */}
      {selectedClass && selectedPeriod && (
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
              <p className="text-gray-600 mt-2">Loading students...</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {students.map((student) => {
                const record = attendanceRecords.get(student.id);
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
                        {/* Status Buttons */}
                        <div className="flex space-x-2">
                          {(['present', 'absent', 'late', 'excused'] as AttendanceStatus[]).map((status) => (
                            <button
                              key={status}
                              onClick={() => updateAttendanceStatus(student.id, status)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium border transition-colors ${
                                record?.status === status
                                  ? getStatusColor(status)
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                        
                        {/* Late Minutes Input */}
                        {record?.status === 'late' && (
                          <input
                            type="number"
                            placeholder="Minutes late"
                            value={record.late_minutes || ''}
                            onChange={(e) => updateAttendanceStatus(
                              student.id, 
                              'late', 
                              parseInt(e.target.value) || 0,
                              record.remarks
                            )}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        )}
                        
                        {/* Remarks */}
                        {record && (
                          <input
                            type="text"
                            placeholder="Remarks"
                            value={record.remarks || ''}
                            onChange={(e) => updateAttendanceStatus(
                              student.id,
                              record.status,
                              record.late_minutes,
                              e.target.value
                            )}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        )}
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