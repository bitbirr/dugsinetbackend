import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/Auth/LoginForm';
import MainLayout from './components/Layout/MainLayout';
import Dashboard from './pages/Dashboard';
import StudentList from './pages/Students/StudentList';
import StudentDetail from './pages/Students/StudentDetail';
import StudentEdit from './pages/Students/StudentEdit';
import StudentOnboarding from './pages/Students/StudentOnboarding';
import StudentApplications from './pages/Students/StudentApplications';
import StaffList from './pages/Staff/StaffList';
import AttendanceView from './pages/Attendance/AttendanceView';
import AttendanceMarking from './pages/Attendance/AttendanceMarking';
import ExcuseManagement from './pages/Attendance/ExcuseManagement';
import AttendanceReports from './pages/Attendance/AttendanceReports';
import ParentExcuseSubmission from './pages/Attendance/ParentExcuseSubmission';
import EventsPage from './pages/Events/EventsPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import CurriculumList from './pages/Curriculum/CurriculumList';
import CourseDetail from './pages/Curriculum/CourseDetail';
import CourseForm from './pages/Curriculum/CourseForm';
import LogViewerPage from './pages/Admin/LogViewerPage';
import { TermsOfService, PrivacyPolicy } from './pages/Legal';

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        
        {/* Student Routes */}
        <Route path="students" element={<StudentList />} />
        <Route path="students/:id" element={<StudentDetail />} />
        <Route path="students/:id/edit" element={<StudentEdit />} />
        <Route path="students/onboarding" element={<StudentOnboarding />} />
        <Route path="students/applications" element={<StudentApplications />} />
        
        {/* Staff Routes */}
        <Route path="staff" element={<StaffList />} />
        
        {/* Enhanced Attendance Routes */}
        <Route path="attendance" element={<AttendanceView />} />
        <Route path="attendance/mark" element={<AttendanceMarking />} />
        <Route path="attendance/excuses" element={<ExcuseManagement />} />
        <Route path="attendance/reports" element={<AttendanceReports />} />
        <Route path="attendance/submit-excuse" element={<ParentExcuseSubmission />} />
        
        {/* Curriculum Routes */}
        <Route path="curriculum" element={<CurriculumList />} />
        <Route path="curriculum/courses/:id" element={<CourseDetail />} />
        <Route path="curriculum/courses/:id/edit" element={<CourseForm />} />
        
        {/* Other Routes */}
        <Route path="events" element={<EventsPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="admin/logs" element={<LogViewerPage />} />
        
        {/* Placeholder Routes */}
        <Route path="students/profiles" element={<div className="p-8">Student Profiles - Coming Soon</div>} />
        <Route path="students/admissions" element={<div className="p-8">Student Admissions - Coming Soon</div>} />
        <Route path="staff/new" element={<div className="p-8">Add Staff - Coming Soon</div>} />
        <Route path="staff/schedule" element={<div className="p-8">Staff Schedule - Coming Soon</div>} />
        <Route path="attendance/records" element={<div className="p-8">Attendance Records - Coming Soon</div>} />
        <Route path="curriculum/subjects" element={<div className="p-8">Subjects - Coming Soon</div>} />
        <Route path="curriculum/lessons" element={<div className="p-8">Lessons - Coming Soon</div>} />
        <Route path="results" element={<div className="p-8">Results - Coming Soon</div>} />
        <Route path="payments" element={<div className="p-8">Payments - Coming Soon</div>} />
        <Route path="finance/reports" element={<div className="p-8">Financial Reports - Coming Soon</div>} />
        <Route path="documents/id-cards" element={<div className="p-8">ID Cards - Coming Soon</div>} />
        <Route path="documents/certificates" element={<div className="p-8">Certificates - Coming Soon</div>} />
        <Route path="documents/reports" element={<div className="p-8">Document Reports - Coming Soon</div>} />
        <Route path="timetable" element={<div className="p-8">Timetable - Coming Soon</div>} />
        <Route path="exams" element={<div className="p-8">Exams - Coming Soon</div>} />
        <Route path="library" element={<div className="p-8">Library - Coming Soon</div>} />
        <Route path="fees" element={<div className="p-8">Fees - Coming Soon</div>} />
        <Route path="hostel" element={<div className="p-8">Hostel - Coming Soon</div>} />
        <Route path="transport" element={<div className="p-8">Transport - Coming Soon</div>} />
        <Route path="inventory" element={<div className="p-8">Inventory - Coming Soon</div>} />
        <Route path="payroll" element={<div className="p-8">Payroll - Coming Soon</div>} />
        <Route path="activities" element={<div className="p-8">Activities - Coming Soon</div>} />
        <Route path="settings" element={<div className="p-8">Settings - Coming Soon</div>} />
        
        {/* Legal Pages */}
        <Route path="terms-of-service" element={<TermsOfService />} />
        <Route path="privacy-policy" element={<PrivacyPolicy />} />
      </Route>
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;