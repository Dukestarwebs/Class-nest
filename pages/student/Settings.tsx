
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Lock, ArrowLeft, ShieldAlert, User, Camera, Upload } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { updateUser, uploadAvatar } from '../../data';

const StudentSettings: React.FC = () => {
  const { user, updateUser: updateAuthUser } = useAuth();
  const navigate = useNavigate();

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Profile Picture State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [loading, setLoading] = useState(false);

  useEffect(() => {
      if(user?.avatarUrl) {
          setPreviewUrl(user.avatarUrl);
      }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAvatarFile(file);
          setPreviewUrl(URL.createObjectURL(file));
      }
  };

  const handleUploadAvatar = async () => {
      if (!user || !avatarFile) return;
      
      setUploadLoading(true);
      setUploadError('');
      setUploadSuccess('');

      try {
          const publicUrl = await uploadAvatar(user.id, avatarFile);
          await updateUser(user.id, { avatarUrl: publicUrl });
          
          updateAuthUser({ ...user, avatarUrl: publicUrl });
          
          setUploadSuccess('Profile picture updated!');
          setTimeout(() => setUploadSuccess(''), 3000);
      } catch (error) {
          console.error(error);
          setUploadError('Failed to upload image. Please try again.');
      } finally {
          setUploadLoading(false);
      }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!user) return;

    if (currentPassword !== user.password) {
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

    setLoading(true);
    try {
        await updateUser(user.id, { password: newPassword });
        
        // Update local auth context
        updateAuthUser({ ...user, password: newPassword });
        
        setPasswordSuccess('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (error) {
        console.error(error);
        setPasswordError('Failed to update password.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-900 transition-colors duration-200">
         <header className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 z-10 px-4 py-3">
            <div className="container mx-auto max-w-2xl flex items-center justify-between">
                <button 
                    onClick={() => navigate('/student/dashboard')}
                    className="flex items-center text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium group"
                >
                    <div className="p-2 rounded-full group-hover:bg-gray-100 dark:group-hover:bg-gray-800 mr-2 transition-colors">
                        <ArrowLeft size={20} />
                    </div>
                    Back to Dashboard
                </button>
            </div>
        </header>

        <main className="container mx-auto max-w-2xl px-4 py-8">
             <h1 className="text-3xl font-poppins font-bold text-text-primary dark:text-white mb-8">Account Settings</h1>

            {/* Profile Picture Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200 mb-6">
                <h2 className="text-xl font-poppins font-semibold mb-6 text-text-primary dark:text-white flex items-center">
                    <User className="mr-3 text-primary" /> Profile Picture
                </h2>

                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-primary">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <User size={40} />
                                </div>
                            )}
                        </div>
                        <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-blue-600 transition-colors shadow-md">
                            <Camera size={14} />
                            <input 
                                id="avatar-upload" 
                                type="file" 
                                accept="image/*" 
                                className="hidden" 
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    <div className="flex-1 w-full">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Upload a new profile picture. Recommended size: 500x500px. JPG or PNG.
                        </p>
                        
                        {uploadError && <p className="text-red-500 text-sm mb-2">{uploadError}</p>}
                        {uploadSuccess && <p className="text-green-500 text-sm mb-2">{uploadSuccess}</p>}

                        <button 
                            onClick={handleUploadAvatar}
                            disabled={!avatarFile || uploadLoading}
                            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center text-sm font-medium"
                        >
                            {uploadLoading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            ) : (
                                <Upload size={16} className="mr-2" />
                            )}
                            Save New Picture
                        </button>
                    </div>
                </div>
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md transition-colors duration-200">
                <h2 className="text-xl font-poppins font-semibold mb-6 text-text-primary dark:text-white flex items-center">
                    <Lock className="mr-3 text-primary" /> Change Password
                </h2>
                
                {passwordError && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 flex items-center"><ShieldAlert size={18} className="mr-2"/>{passwordError}</div>}
                {passwordSuccess && <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-3 rounded-lg mb-4">{passwordSuccess}</div>}

                <form onSubmit={handleUpdatePassword} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
                        <input 
                            type="password" 
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                            placeholder="Enter current password"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                            placeholder="Min. 6 characters"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-white dark:bg-gray-700 text-text-primary dark:text-white"
                            placeholder="Re-enter new password"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center font-medium w-full md:w-auto disabled:opacity-70"
                    >
                        {loading ? 'Updating...' : <><Save size={18} className="mr-2" /> Update Password</>}
                    </button>
                </form>
            </div>
        </main>
    </div>
  );
};

export default StudentSettings;
