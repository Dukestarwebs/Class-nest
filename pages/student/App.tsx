import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import LoginPage from '../Login';
import RegisterPage from '../Register';
import AdminDashboard from '../admin/Dashboard';
import StudentDashboard from './Dashboard';
import ManageStudents from '../admin/ManageStudents';
import UploadNotes from '../admin/UploadNotes';
import ManageAnnouncements from '../admin/ManageAnnouncements';
import AdminLayout from '../../components/AdminLayout';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute role="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="students" element={<ManageStudents />} />
            <Route path="notes" element={<UploadNotes />} />
            <Route path="announcements" element={<ManageAnnouncements />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};


interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-secondary">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
                <p className="ml-4 text-lg font-poppins">Loading Class Nest...</p>
            </div>
        );
    }
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== role) {
        // Redirect to their own dashboard if trying to access wrong role page
        const redirectTo = user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};

export default App;