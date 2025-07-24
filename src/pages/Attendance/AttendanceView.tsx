import React, { useState, useEffect } from 'react';
import { Calendar, Users, UserCheck, Clock, Download, Plus, Settings } from 'lucide-react';
import { format } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceRecord, AttendancePeriod } from '../../types/attendance';

const AttendanceView: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('');
  const [viewType, setViewType] = useState<'student' | 'staff'>('student');
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [periods, setPeriods] = useState<AttendancePeriod[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      loadPeriods();
    }
  }, [selectedClass, selectedDate]);

  useEffect(() => {
    if (selectedClass && selectedPeriod) {
      loadAttendanceData();
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

  const loadAttendanceData = async () => {
    setLoading(true);
    try {
      const data = await AttendanceService.getAttendanceByDate(selectedDate, selectedClass);
      const filteredData = data.filter(record => record.period_id === selectedPeriod);
      setAttendanceData(filteredData);
    } catch (error) {
      console.error('Failed to load attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      case 'excused': return 'bg-blue-100 text-blue-800';
      case 'half_day': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const presentCount = attendanceData.filter(item => item.status === 'present').length;
  const absentCount = attendanceData.filter(item => item.status === 'absent').length;
  const lateCount = attendanceData.filter(item => item.status === 'late').length;
  const excusedCount = attendanceData.filter(item => item.status === 'excused').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor and track daily attendance across all classes and periods</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Mark Attendance</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="w-5 h-5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <option value="">All Classes</option>
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
              <option value="">All Periods</option>
              {periods.map(period => (
                <option key={period.id} value={period.id}>
                  {period.name} ({period.start_time} - {period.end_time})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewType('student')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewType === 'student'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setViewType('staff')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  viewType === 'staff'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Staff
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-bold text-green-600">{presentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-bold text-red-600">{absentCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Late</p>
              <p className="text-2xl font-bold text-yellow-600">{lateCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Excused</p>
              <p className="text-2xl font-bold text-blue-600">{excusedCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-600">{attendanceData.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Attendance Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            {viewType === 'student' ? 'Student' : 'Staff'} Attendance - {format(new Date(selectedDate), 'MMMM d, yyyy')}
            {selectedPeriod && periods.find(p => p.id === selectedPeriod) && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({periods.find(p => p.id === selectedPeriod)?.name})
              </span>
            )}
          </h2>
          <button className="text-blue-600 hover:text-blue-800 flex items-center space-x-1">
            <Settings className="w-4 h-4" />
            <span className="text-sm">Configure Periods</span>
          </button>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading attendance data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {viewType === 'student' ? 'GR Number' : 'Employee ID'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">
                    {viewType === 'student' ? 'Class' : 'Department'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Late Minutes</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Excuse</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceData.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {record.student?.first_name?.charAt(0)}{record.student?.last_name?.charAt(0)}
                          </span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {record.student?.first_name} {record.student?.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-900">{record.student?.gr_number}</td>
                    <td className="py-3 px-4 text-gray-900">{record.student?.class_id}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {record.check_in_time ? format(new Date(record.check_in_time), 'h:mm a') : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-900">
                      {record.late_minutes || '-'}
                    </td>
                    <td className="py-3 px-4">
                      {record.excuse ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.excuse.status === 'approved' ? 'bg-green-100 text-green-800' :
                          record.excuse.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {record.excuse.status}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="py-3 px-4 text-gray-900 max-w-xs truncate">
                      {record.remarks || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;