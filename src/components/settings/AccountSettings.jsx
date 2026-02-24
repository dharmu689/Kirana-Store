import React, { useState, useEffect } from 'react';
import API from '../../utils/api';
import { toast } from 'react-hot-toast';
import { FiSave, FiLoader, FiUser, FiLock } from 'react-icons/fi';

const AccountSettings = () => {
    const [profile, setProfile] = useState({
        name: '',
        email: '',
        role: '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await API.get('/auth/profile');
            if (data && data.user) {
                setProfile((prev) => ({
                    ...prev,
                    name: data.user.name || '',
                    email: data.user.email || '',
                    role: data.user.role || '',
                }));
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch user profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfile((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Client-side validation for passwords
        if (profile.newPassword && profile.newPassword !== profile.confirmPassword) {
            return toast.error('New password and Confirm password do not match');
        }

        setSaving(true);
        try {
            // Build payload dynamically based on whether password update is intented
            const payload = {
                name: profile.name,
            };

            if (profile.newPassword) {
                payload.oldPassword = profile.oldPassword;
                payload.newPassword = profile.newPassword;
            }

            const { data } = await API.put('/auth/profile', payload);
            toast.success('Profile updated successfully');

            // Update local storage if name changed to reflect globally
            const user = JSON.parse(localStorage.getItem('user'));
            if (user) {
                user.name = data.user.name;
                localStorage.setItem('user', JSON.stringify(user));
            }

            // Reset password fields after success
            setProfile((prev) => ({
                ...prev,
                name: data.user.name,
                oldPassword: '',
                newPassword: '',
                confirmPassword: '',
            }));
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-sm border border-gray-100">
                <FiLoader className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mb-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center text-gray-800 gap-2">
                <FiUser className="text-indigo-600" />
                Account Profile
            </h2>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Readonly Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Personal Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={profile.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={profile.email}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg cursor-not-allowed"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <input
                                type="text"
                                name="role"
                                value={profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                                disabled
                                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                            />
                        </div>
                    </div>

                    {/* Password Change Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                            <FiLock /> Change Password
                        </h3>
                        <p className="text-xs text-gray-500 italic mb-2">Leave blank if you don't want to change</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Old Password
                            </label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={profile.oldPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="Enter current password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPassword"
                                value={profile.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={profile.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        type="button"
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        onClick={() => {
                            fetchProfile();
                            setProfile(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }));
                        }}
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 font-medium flex items-center justify-center gap-2 transition-colors min-w-[120px]"
                    >
                        {saving ? (
                            <FiLoader className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <FiSave className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AccountSettings;
