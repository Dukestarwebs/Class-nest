
import React, { useState, useEffect } from 'react';
import { Save, User, Lock, ShieldAlert, Power, Clock, AlertTriangle } from 'lucide-react';
import { getAdminProfile, updateAdminProfile, getSystemSettings, updateSystemSetting } from '../../data';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../supabaseClient';

const AdminSettings: React.FC = () => {
  const { user, updateUser } = useAuth();
  
  // Profile State
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Maintenance State
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [durationHours, setDurationHours] = useState(48); // Default 48 hours
  const [currentEndTime, setCurrentEndTime] = useState<string | null>(null);
  const [maintenanceSuccess, setMaintenanceSuccess] = useState('');
  const [maintenanceError, setMaintenanceError] = useState('');
  const [loadingMaintenance, setLoadingMaintenance] = useState(false);

  useEffect(() => {
    const profile = getAdminProfile();
    setName(profile.name);
    setUsername(profile.username);

    // Fetch maintenance settings
    getSystemSettings().then(settings => {
        setMaintenanceMode(settings.maintenanceMode);
        if (settings.maintenanceEndTime) {
            setCurrentEndTime(settings.maintenanceEndTime);
        }
    });
  }, []);

  // Helper to safely extract error message
  const getErrorMessage = (err: any) => {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (err instanceof Error) return err.message;
    
    if (typeof err === 'object') {
        if ('message' in err) {
            return typeof err.message === 'string' ? err.message : JSON.stringify(err.message);
        }
        if ('error_description' in err) {
             return typeof err.error_description === 'string' ? err.error_description : JSON.stringify(err.error_description);
        }
        if ('details' in err) {
             return typeof err.details === 'string' ? err.details : JSON.stringify(err.details);
        }
    }
    
    try {
        return JSON.stringify(err);
    } catch {
        return 'An unexpected database error occurred.';
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');

    if (!name.trim() || !username.trim()) {
        setProfileError('Name and Username are required.');
        return;
    }

    try {
        const currentProfile = getAdminProfile();
        const updatedProfile = {
            ...currentProfile,
            name: name.trim(),
            username: username.trim()
        };

        updateAdminProfile(updatedProfile);
        
        // Update global auth state to reflect name change in sidebar immediately
        if (user) {
            updateUser({
                ...user,
                name: updatedProfile.name,
                username: updatedProfile.username
            });
        }

        setProfileSuccess('Profile updated successfully.');
        setTimeout(() => setProfileSuccess(''), 3000);
    } catch (error) {
        setProfileError('Failed to update profile.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const currentProfile = getAdminProfile();

    if (currentPassword !== currentProfile.password) {
        setPasswordError('Incorrect current password.');
        return;
    }

    if (newPassword.length < 6) {
        setPasswordError('New password must be at least 6 characters.');
        return;
    }

    if (newPassword !== confirmPassword) {
        setPasswordError('New passwords do not match.');
        return;
    }

    try {
        // Update Supabase Auth password
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) {
            console.error("Failed to update Supabase password:", error);
            // If the user is not logged in via Supabase (e.g. local dev fallback), this might fail.
            // But since we enforced Supabase login for admin, it should work.
            // However, if the session is expired, it might fail.
            // Let's proceed with local update but warn? No, better to fail if cloud update fails.
            setPasswordError(`Failed to update password in cloud: ${error.message}`);
            return;
        }

        const updatedProfile = {
            ...currentProfile,
            password: newPassword
        };

        updateAdminProfile(updatedProfile);
        
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
        setPasswordError('Failed to update password.');
    }
  };

  const handleUpdateMaintenance = async (e: React.FormEvent) => {
      e.preventDefault();
      setMaintenanceSuccess('');
      setMaintenanceError('');
      setLoadingMaintenance(true);

      try {
          // 1. Update Mode Boolean
          await updateSystemSetting('maintenance_mode', String(maintenanceMode));
          
          // 2. Update End Time
          if (maintenanceMode) {
              // Calculate end time based on selected duration
              const endDate = new Date(Date.now() + durationHours * 60 * 60 * 1000);
              const isoDate = endDate.toISOString();
              await updateSystemSetting('maintenance_end_time', isoDate);
              setCurrentEndTime(isoDate);
          } else {
              await updateSystemSetting('maintenance_end_time', '');
              setCurrentEndTime(null);
          }
          
          setMaintenanceSuccess(`Maintenance mode is now ${maintenanceMode ? 'ON' : 'OFF'}`);
          setTimeout(() => setMaintenanceSuccess(''), 3000);
      } catch (err) {
          console.error(err);
          const msg = getErrorMessage(err);
          let userFriendlyMsg = `Database Error: ${msg}`;
          
          if (msg.includes('row-level security') || msg.includes('permission denied')) {
              userFriendlyMsg += ". (Hint: You must run the SQL script to 'Allow app to manage settings' in Supabase)";
          }
          
          setMaintenanceError(userFriendlyMsg);
      } finally {
          setLoadingMaintenance(false);
      }
  };

  // Calculate preview date for the dropdown
  const getPreviewDate = () => {
      const date = new Date(Date.now() + durationHours * 60 * 60 * 1000);
      return date.toLocaleString();
  };

  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-poppins font-bold text-text-primary dark:text-white">Admin Settings</h1>
      
      {/* Maintenance Mode Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border-l-4 border-accent transition-colors duration-200">
        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-primary dark:text-white flex items-center">
            <Power className="mr-3 text-accent" /> System Maintenance
        </h2>
        
        {maintenanceSuccess && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">{maintenanceSuccess}</div>}
        {maintenanceError && (
            <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-start">
                <AlertTriangle className="mr-2 flex-shrink-0 mt-0.5" size={18}/>
                <span className="break-words text-sm">{maintenanceError}</span>
            </div>
        )}

        <form onSubmit={handleUpdateMaintenance} className="space-y-4 max-w-lg">
            <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <span className="font-medium text-gray-700 dark:text-gray-200">Enable Maintenance Mode</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-red-500"></div>
                </label>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Set Duration</label>
                <div className="relative">
                    <Clock className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                    <select
                        value={durationHours}
                        onChange={(e) => setDurationHours(Number(e.target.value))}
                        className="w-full pl-10 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white appearance-none"
                        disabled={!maintenanceMode}
                    >
                        <option value={1}>1 Hour</option>
                        <option value={2}>2 Hours</option>
                        <option value={5}>5 Hours</option>
                        <option value={12}>12 Hours</option>
                        <option value={24}>24 Hours</option>
                        <option value={48}>48 Hours</option>
                    </select>
                </div>
                {maintenanceMode && (
                    <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 p-2 rounded">
                        <p>Maintenance will end on: <span className="font-semibold text-primary">{getPreviewDate()}</span></p>
                        {currentEndTime && (
                            <p className="text-xs mt-1 text-gray-400">Current stored end time: {new Date(currentEndTime).toLocaleString()}</p>
                        )}
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                disabled={loadingMaintenance}
                className="bg-accent text-gray-900 font-bold px-6 py-2 rounded-lg hover:bg-yellow-400 transition-colors flex items-center disabled:opacity-50"
            >
                {loadingMaintenance ? (
                    <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin mr-2"></div>
                ) : (
                    <Save size={18} className="mr-2" />
                )}
                Save System Settings
            </button>
        </form>
      </div>

      {/* Profile Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-primary dark:text-white flex items-center">
            <User className="mr-3 text-primary" /> Profile Settings
        </h2>
        
        {profileError && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4">{profileError}</div>}
        {profileSuccess && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">{profileSuccess}</div>}

        <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Display Name</label>
                <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                />
            </div>
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                <Save size={18} className="mr-2" /> Save Changes
            </button>
        </form>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
        <h2 className="text-2xl font-poppins font-semibold mb-6 text-text-primary dark:text-white flex items-center">
            <Lock className="mr-3 text-primary" /> Security
        </h2>
        
        {passwordError && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-center"><ShieldAlert size={18} className="mr-2"/>{passwordError}</div>}
        {passwordSuccess && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">{passwordSuccess}</div>}

        <form onSubmit={handleUpdatePassword} className="space-y-4 max-w-lg">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                <input 
                    type="password" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                    placeholder="Enter current password to verify"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                    <input 
                        type="password" 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                    />
                </div>
            </div>
            
            <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center">
                <Save size={18} className="mr-2" /> Update Password
            </button>
        </form>
      </div>
    </div>
  );
};

export default AdminSettings;
