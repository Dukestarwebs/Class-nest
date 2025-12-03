
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import LandingPage from '../LandingPage';
import LoginPage from '../Login';
import RegisterPage from '../Register';
import AdminDashboard from '../admin/Dashboard';
import StudentDashboard from './Dashboard';
import ManageStudents from '../admin/ManageStudents';
import UploadNotes from '../admin/UploadNotes';
import ManageAnnouncements from '../admin/ManageAnnouncements';
import AdminLayout from '../../components/AdminLayout';
import ManageQuestions from '../admin/ManageQuestions';
import ManageAssignments from '../admin/ManageAssignments';
import AdminSettings from '../admin/Settings';
import PendingApprovals from '../admin/PendingApprovals';
import QuickAction from '../admin/QuickAction';
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
import { getSystemSettings } from '../../data';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />

            <Route path="/student/dashboard" element={
                <ProtectedRoute role="student">
                    <StudentDashboard />
                </ProtectedRoute>
            } />
            
            <Route path="/student/notes/:id" element={
                <ProtectedRoute role="student">
                    <ViewNote />
                </ProtectedRoute>
            } />
            
            <Route path="/student/assignments/:id" element={
                <ProtectedRoute role="student">
                    <ViewAssignment />
                </ProtectedRoute>
            } />

            <Route path="/student/settings" element={
                <ProtectedRoute role="student">
                    <StudentSettings />
                </ProtectedRoute>
            } />

             <Route path="/student/help" element={
                <ProtectedRoute role="student">
                    <HelpPage />
                </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin/*" element={
                <ProtectedRoute role="admin">
                  <AdminLayout>
                    <Routes>
                      <Route path="dashboard" element={<AdminDashboard />} />
                      <Route path="students" element={<ManageStudents />} />
                      <Route path="pending" element={<PendingApprovals />} />
                      <Route path="invitations" element={<Invitations />} />
                      <Route path="action" element={<QuickAction />} />
                      <Route path="notes" element={<UploadNotes />} />
                      <Route path="notes/:id" element={<ViewNote />} />
                      <Route path="assignments" element={<ManageAssignments />} />
                      <Route path="announcements" element={<ManageAnnouncements />} />
                      <Route path="questions" element={<ManageQuestions />} />
                      <Route path="feedback" element={<FeedbackList />} />
                      <Route path="settings" element={<AdminSettings />} />
                      <Route path="*" element={<Navigate to="dashboard" replace />} />
                    </Routes>
                  </AdminLayout>
                </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  );
};


interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { user, loading } = useAuth();
    const location = useLocation();
    const [maintenanceActive, setMaintenanceActive] = useState(false);
    const [checkingMaintenance, setCheckingMaintenance] = useState(true);

    useEffect(() => {
        const checkMaintenance = async () => {
            try {
                // Admins bypass maintenance check logic in UI, but we check specifically for students
                if (role === 'student') {
                    const settings = await getSystemSettings();
                    
                    // Logic: Is Maintenance ON AND is time NOT passed?
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

    if (loading || checkingMaintenance) {
        return (
            <div className="flex items-center justify-center h-screen bg-secondary dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-4 text-lg font-poppins text-text-primary dark:text-white">Loading Class Nest...</p>
            </div>
        );
    }
    
    // If maintenance is active and user is a student, redirect
    if (maintenanceActive && role === 'student') {
        return <Navigate to="/maintenance" replace />;
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user.role !== role) {
        const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default App;
