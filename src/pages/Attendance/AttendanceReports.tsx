import React, { useState, useEffect } from 'react';
import { BarChart, Calendar, Download, Filter, TrendingUp, Users, Clock } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceSummary, AttendanceRecord } from '../../types/attendance';

const AttendanceReports: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [summaryData, setSummaryData] = useState<AttendanceSummary[]>([]);
  const [detailedData, setDetailedData] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<'summary' | 'detailed'>('summary');

  useEffect(() => {
    loadReportData();
  }, [selectedMonth, selectedClass, selectedStudent, viewType]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      if (viewType === 'summary') {
        const data = await AttendanceService.getAttendanceSummary(
          selectedStudent || undefined,
          selectedClass || undefined,
          selectedMonth
        );
        setSummaryData(data);
      } else {
        if (selectedStudent) {
          const startDate = format(startOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
          const endDate = format(endOfMonth(new Date(selectedMonth)), 'yyyy-MM-dd');
          const data = await AttendanceService.getStudentAttendanceHistory(selectedStudent, startDate, endDate);
          setDetailedData(data);
        }
      }
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateAttendanceRate = (summary: AttendanceSummary) => {
    const total = summary.total_days;
    const present = summary.present_days + summary.late_days; // Count late as present
    return total > 0 ? Math.round((present / total) * 100) : 0;
  };

  const getAttendanceRateColor = (rate: number) => {
    if (rate >= 95) return 'text-green-600';
    if (rate >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const exportReport = () => {
    // Implement CSV export functionality
    console.log('Exporting report...');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-2">View comprehensive attendance analytics and reports</p>
        </div>
        <button
          onClick={exportReport}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export Report</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Students</option>
              <option value="1">Ahmed Ali</option>
              <option value="2">Fatima Hassan</option>
              <option value="3">Omar Said</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">View Type</label>
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewType('summary')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'summary'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setViewType('detailed')}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewType === 'detailed'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading report data...</p>
        </div>
      ) : viewType === 'summary' ? (
        /* Summary View */
        <div className="space-y-6">
          {/* Overview Cards */}
          {summaryData.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Attendance Rate</p>
                    <p className="text-2xl font-bold text-green-600">
                      {Math.round(summaryData.reduce((acc, s) => acc + calculateAttendanceRate(s), 0) / summaryData.length)}%
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{summaryData.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Late Days</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {summaryData.reduce((acc, s) => acc + s.late_days, 0)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Absent Days</p>
                    <p className="text-2xl font-bold text-red-600">
                      {summaryData.reduce((acc, s) => acc + s.absent_days, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Summary Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                <BarChart className="w-5 h-5" />
                <span>Attendance Summary - {format(new Date(selectedMonth), 'MMMM yyyy')}</span>
              </h2>
            </div>
            
            {summaryData.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No attendance data found for the selected criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Total Days</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Present</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Absent</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Late</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Excused</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {summaryData.map((summary) => {
                      const attendanceRate = calculateAttendanceRate(summary);
                      return (
                        <tr key={summary.student_id} className="hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 text-sm font-medium">
                                  {summary.student_name?.split(' ').map(n => n.charAt(0)).join('') || 'N/A'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">{summary.student_name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-900">{summary.class_name}</td>
                          <td className="py-3 px-4 text-gray-900">{summary.total_days}</td>
                          <td className="py-3 px-4 text-green-600 font-medium">{summary.present_days}</td>
                          <td className="py-3 px-4 text-red-600 font-medium">{summary.absent_days}</td>
                          <td className="py-3 px-4 text-yellow-600 font-medium">{summary.late_days}</td>
                          <td className="py-3 px-4 text-blue-600 font-medium">{summary.excused_days}</td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${getAttendanceRateColor(attendanceRate)}`}>
                              {attendanceRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Detailed View */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Detailed Attendance History - {format(new Date(selectedMonth), 'MMMM yyyy')}
            </h2>
          </div>
          
          {!selectedStudent ? (
            <div className="p-8 text-center">
              <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Please select a student to view detailed attendance history</p>
            </div>
          ) : detailedData.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No detailed attendance data found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Period</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Check-in Time</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Late Minutes</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Excuse</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {detailedData.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-900">
                        {format(new Date(record.date), 'MMM d, yyyy')}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.period?.name} ({record.period?.start_time} - {record.period?.end_time})
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          record.status === 'present' ? 'bg-green-100 text-green-800' :
                          record.status === 'absent' ? 'bg-red-100 text-red-800' :
                          record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          record.status === 'excused' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.check_in_time ? format(new Date(record.check_in_time), 'h:mm a') : '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
                        {record.late_minutes || '-'}
                      </td>
                      <td className="py-3 px-4 text-gray-900">
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
                      <td className="py-3 px-4 text-gray-900">
                        {record.remarks || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;