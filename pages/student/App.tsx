

import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import LandingPage from '../LandingPage';
import LoginPage from '../Login';
import RegisterPage from '../Register';
import StudentDashboard from './Dashboard';
import UploadNotes from '../admin/UploadNotes';
import ManageAnnouncements from '../admin/ManageAnnouncements';
import TeacherLayout from '../../components/TeacherLayout';
import ManageQuestions from '../admin/ManageQuestions';
import ManageAssignments from '../admin/ManageAssignments';
import AdminSettings from '../admin/Settings';
import PendingApprovals from '../admin/PendingApprovals';
import ViewNote from './ViewNote';
import ViewAssignment from './ViewAssignment';
import StudentSettings from './Settings';
import HelpPage from './Help';
import AboutUs from '../AboutUs';
import PrivacyPolicy from '../PrivacyPolicy';
import Terms from '../Terms';
import Invitations from '../admin/Invitations';
import FeedbackList from '../admin/FeedbackList';
import MaintenancePage from '../Maintenance';
import TeacherDashboard from '../teacher/Dashboard';
import Careers from '../Careers';
import ManageCareers from '../admin/ManageCareers';
import Archive from '../admin/Archive';
import Drafts from '../admin/Drafts';
import StudentSubscription from './Subscription';
import LiveRoomPage from '../LiveRoomPage';
import TeacherLiveClass from '../teacher/LiveClass';
import StudentLiveClass from '../student/LiveClass';
import AdminLiveSessions from '../admin/LiveSessions';
import { getSystemSettings, isSubscriptionActive } from '../../data';
import { ADMIN_USERNAME } from '../../constants';

// --- Admin Panel (Original) ---
import AdminLayout from '../../components/AdminLayout';
import AdminDashboard from '../admin/Dashboard';
import ManageStudents from '../admin/ManageStudents';
import ManageTeachers from '../admin/ManageTeachers';
import PaymentTracking from '../admin/PaymentTracking';
import ManageSubscription from '../admin/ManageSubscription';
import ManageSchools from '../admin/ManageSchools'; // New import

// --- School Management Panel ---
import SchoolManagementLayout from '../../components/SchoolManagementLayout';
import SchoolDashboard from '../school/Dashboard';
import SchoolClasses from '../school/Classes';
import SchoolTeachers from '../school/people/Teachers';
import SchoolStudents from '../school/people/Students';
import SchoolAttendance from '../school/operations/Attendance';
import SchoolSchedule from '../school/operations/Schedule';
import SchoolHistory from '../school/operations/History';
import SchoolStudentAnalysis from '../school/analytics/StudentAnalysis';
import SchoolPerformance from '../school/analytics/SchoolPerformance';
import SchoolSalaries from '../school/finance/Salaries';
import SchoolSubscription from '../school/Subscription'; // New import
import PricingPage from '../PricingPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            <Route path="/student/dashboard" element={ <ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute> } />
            <Route path="/student/subscription" element={ <ProtectedRoute role="student" bypassSubscription={true}><StudentSubscription /></ProtectedRoute> } />
            <Route path="/student/live" element={ <ProtectedRoute role="student"><StudentLiveClass /></ProtectedRoute> } />
            <Route path="/student/notes/:id" element={ <ProtectedRoute role="student"><ViewNote /></ProtectedRoute> } />
            <Route path="/student/assignments/:id" element={ <ProtectedRoute role="student"><ViewAssignment /></ProtectedRoute> } />
            <Route path="/student/settings" element={ <ProtectedRoute role="student"><StudentSettings /></ProtectedRoute> } />
            <Route path="/student/help" element={ <ProtectedRoute role="student"><HelpPage /></ProtectedRoute> } />

            {/* Teacher Routes */}
            <Route path="/teacher/*" element={
                <ProtectedRoute role="teacher">
                  <TeacherLayout>
                    <Routes>
                      <Route path="dashboard" element={<TeacherDashboard />} />
                      <Route path="notes" element={<UploadNotes />} />
                      <Route path="notes/:id" element={<ViewNote />} />
                      <Route path="drafts" element={<Drafts />} />
                      <Route path="live" element={<TeacherLiveClass />} />
                      <Route path="assignments" element={<ManageAssignments />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </TeacherLayout>
                </ProtectedRoute>
            } />

            {/* Admin Panel Routes (Restored) */}
            <Route path="/admin/*" element={
              <ProtectedRoute role="admin" isSuperAdmin={true}>
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="students" element={<ManageStudents />} />
                    <Route path="teachers" element={<ManageTeachers />} />
                    <Route path="schools" element={<ManageSchools />} />
                    <Route path="pending" element={<PendingApprovals />} />
                    <Route path="notes" element={<UploadNotes />} />
                    <Route path="assignments" element={<ManageAssignments />} />
                    <Route path="announcements" element={<ManageAnnouncements />} />
                    <Route path="questions" element={<ManageQuestions />} />
                    <Route path="drafts" element={<Drafts />} />
                    <Route path="archive" element={<Archive />} />
                    <Route path="payments" element={<PaymentTracking />} />
                    <Route path="subscription-fee" element={<ManageSubscription />} />
                    <Route path="invitations" element={<Invitations />} />
                    <Route path="feedback" element={<FeedbackList />} />
                    <Route path="careers" element={<ManageCareers />} />
                    <Route path="live-sessions" element={<AdminLiveSessions />} />
                    <Route path="settings" element={<AdminSettings />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* School Management Routes */}
            <Route path="/school/*" element={
                <ProtectedRoute role="admin" isSuperAdmin={false}>
                  <SchoolManagementLayout>
                    <Routes>
                      <Route path="dashboard" element={<SchoolDashboard />} />
                      <Route path="classes" element={<SchoolClasses />} />
                      <Route path="people/teachers" element={<SchoolTeachers />} />
                      <Route path="people/students" element={<SchoolStudents />} />
                      <Route path="operations/attendance" element={<SchoolAttendance />} />
                      <Route path="operations/schedule" element={<SchoolSchedule />} />
                      <Route path="operations/history" element={<SchoolHistory />} />
                      <Route path="analytics/students" element={<SchoolStudentAnalysis />} />
                      <Route path="analytics/performance" element={<SchoolPerformance />} />
                      <Route path="finance/salaries" element={<SchoolSalaries />} />
                      <Route path="finance/subscription" element={<SchoolSubscription />} />
                      <Route path="content/notes" element={<UploadNotes />} />
                      <Route path="content/assignments" element={<ManageAssignments />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </SchoolManagementLayout>
                </ProtectedRoute>
            } />
            
            <Route path="/live/:roomName" element={<LiveRoomPage />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};


interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'student' | 'teacher';
  bypassSubscription?: boolean;
  isSuperAdmin?: boolean; // Used to differentiate admin types
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role, bypassSubscription = false, isSuperAdmin }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [maintenanceActive, setMaintenanceActive] = useState(false);
    const [checkingMaintenance, setCheckingMaintenance] = useState(true);
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [checkingSub, setCheckingSub] = useState(role === 'student' && !bypassSubscription);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                if (role === 'student') {
                    const settings = await getSystemSettings();
                    const now = new Date();
                    const endTime = settings.maintenanceEndTime ? new Date(settings.maintenanceEndTime) : null;
                    const isActive = settings.maintenanceMode && (!endTime || now < endTime);
                    setMaintenanceActive(isActive);
                }
            } catch (error) {
                console.error("Maintenance check failed:", error);
            } finally {
                setCheckingMaintenance(false);
            }
        };
        checkMaintenance();
    }, [role]);

    useEffect(() => {
        if (role === 'student' && !bypassSubscription) {
            isSubscriptionActive(user).then(active => {
                setIsSubscribed(active);
                setCheckingSub(false);
            });
        } else {
            setCheckingSub(false);
        }
    }, [user, role, bypassSubscription]);

    if (loading || checkingMaintenance || checkingSub) {
        return (
            <div className="flex items-center justify-center h-screen bg-secondary dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-4 text-lg font-poppins text-text-primary dark:text-white">Loading Class Nest...</p>
            </div>
        );
    }
    
    if (maintenanceActive && role === 'student') {
        return <Navigate to="/maintenance" replace />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== role) {
        let redirectTo = '/student/dashboard';
        if (user.role === 'admin') {
            redirectTo = user.username === ADMIN_USERNAME ? '/admin/dashboard' : '/school/dashboard';
        }
        if (user.role === 'teacher') redirectTo = '/teacher/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    // New logic to protect admin routes
    if (role === 'admin') {
        const isUserSuperAdmin = user.username === ADMIN_USERNAME;
        // If this route requires super admin, but user is not super admin
        if (isSuperAdmin === true && !isUserSuperAdmin) {
            return <Navigate to="/school/dashboard" replace />;
        }
        // If this route is for school admins, but user is the super admin
        if (isSuperAdmin === false && isUserSuperAdmin) {
            // Super admin can access school panel, so we allow it.
            // If we wanted to block them: return <Navigate to="/admin/dashboard" replace />;
        }
    }

    // Access protection logic for students
    if (role === 'student' && !bypassSubscription && !isSubscribed) {
        if (location.pathname !== '/student/dashboard' && location.pathname !== '/student/subscription' && location.pathname !== '/student/settings') {
            return <Navigate to="/student/subscription" replace />;
        }
    }

    return <>{children}</>;
};

export default App;