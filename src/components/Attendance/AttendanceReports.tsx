import React, { useState, useEffect } from 'react';
import { BarChart, Calendar, Download, Filter, TrendingUp, Users } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { AttendanceService } from '../../lib/attendanceService';
import { AttendanceSummary } from '../../types/attendance';

const AttendanceReports: React.FC = () => {
  const [summaries, setSummaries] = useState<AttendanceSummary[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendanceSummaries();
  }, [selectedMonth, selectedClass]);

  const loadAttendanceSummaries = async () => {
    setLoading(true);
    try {
      const summariesData = await AttendanceService.getAttendanceSummary(
        undefined, 
        selectedClass || undefined, 
        selectedMonth
      );
      setSummaries(summariesData);
    } catch (error) {
      console.error('Failed to load attendance summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    // Implement CSV export
    const csvContent = [
      ['Student Name', 'GR Number', 'Class', 'Total Days', 'Present', 'Absent', 'Late', 'Attendance %'].join(','),
      ...summaries.map(summary => [
        `${summary.first_name} ${summary.last_name}`,
        summary.gr_number,
        summary.class_name,
        summary.total_days,
        summary.present_days,
        summary.absent_days,
        summary.late_days,
        `${summary.attendance_percentage}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${selectedMonth}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 95) return 'bg-green-100 text-green-800';
    if (percentage >= 85) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const overallStats = summaries.reduce((acc, summary) => {
    acc.totalStudents += 1;
    acc.totalDays += summary.total_days;
    acc.totalPresent += summary.present_days;
    acc.totalAbsent += summary.absent_days;
    acc.totalLate += summary.late_days;
    return acc;
  }, { totalStudents: 0, totalDays: 0, totalPresent: 0, totalAbsent: 0, totalLate: 0 });

  const overallPercentage = overallStats.totalDays > 0 
    ? ((overallStats.totalPresent / overallStats.totalDays) * 100).toFixed(1)
    : '0';

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
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Classes</option>
              <option value="class1">Grade 7-A</option>
              <option value="class2">Grade 7-B</option>
              <option value="class3">Grade 8-A</option>
            </select>
          </div>
        </div>
      </div>

      {/* Overall Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-blue-600">{overallStats.totalStudents}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Overall Attendance</p>
              <p className={`text-2xl font-bold ${getAttendanceColor(parseFloat(overallPercentage))}`}>
                {overallPercentage}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <BarChart className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Absences</p>
              <p className="text-2xl font-bold text-red-600">{overallStats.totalAbsent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Late Arrivals</p>
              <p className="text-2xl font-bold text-yellow-600">{overallStats.totalLate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Report Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Detailed Attendance Report - {format(new Date(selectedMonth), 'MMMM yyyy')}
          </h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading report...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">GR Number</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Class</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Total Days</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Present</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Absent</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Late</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Excused</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-900">Attendance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {summaries.map((summary) => (
                  <tr key={summary.student_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">
                        {summary.first_name} {summary.last_name}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{summary.gr_number}</td>
                    <td className="py-3 px-4 text-gray-600">{summary.class_name}</td>
                    <td className="py-3 px-4 text-center text-gray-900">{summary.total_days}</td>
                    <td className="py-3 px-4 text-center text-green-600 font-medium">{summary.present_days}</td>
                    <td className="py-3 px-4 text-center text-red-600 font-medium">{summary.absent_days}</td>
                    <td className="py-3 px-4 text-center text-yellow-600 font-medium">{summary.late_days}</td>
                    <td className="py-3 px-4 text-center text-blue-600 font-medium">{summary.excused_absent_days}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-sm font-medium ${getAttendanceBadge(summary.attendance_percentage)}`}>
                        {summary.attendance_percentage}%
                      </span>
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

export default AttendanceReports;