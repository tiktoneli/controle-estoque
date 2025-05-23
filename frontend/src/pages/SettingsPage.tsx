import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { User, KeyRound, Mail, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleUpdateDisplayName = async () => {
    try {
      setIsLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', user?.id);

      if (error) throw error;

      addToast({
        title: 'Success',
        message: 'Display name updated successfully',
        type: 'success'
      });

      setIsEditingName(false);
    } catch (error) {
      console.error('Error updating display name:', error);
      addToast({
        title: 'Error',
        message: 'Failed to update display name',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsLoading(true);

      if (passwords.new !== passwords.confirm) {
        addToast({
          title: 'Error',
          message: 'New passwords do not match',
          type: 'error'
        });
        return;
      }

      if (passwords.new.length < 6) {
        addToast({
          title: 'Error',
          message: 'Password must be at least 6 characters',
          type: 'error'
        });
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: passwords.new
      });

      if (error) throw error;

      addToast({
        title: 'Success',
        message: 'Password updated successfully',
        type: 'success'
      });

      setPasswords({ current: '', new: '', confirm: '' });
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Error changing password:', error);
      addToast({
        title: 'Error',
        message: 'Failed to change password',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>

      <div className="space-y-6 max-w-2xl">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="w-5 h-5 mr-2" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Email</span>
              </div>
              <span className="text-sm text-gray-600">{user?.email}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Role</span>
              </div>
              <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Name</label>
                  <div className="mt-1">
                    {isEditingName ? (
                      <div className="flex items-center space-x-2">
                        <Input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter display name"
                        />
                        <Button
                          onClick={handleUpdateDisplayName}
                          disabled={isLoading}
                          size="sm"
                        >
                          Save
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingName(false);
                            setDisplayName(user?.display_name || '');
                          }}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">{user?.display_name || 'Not set'}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsEditingName(true)}
                        >
                          Edit
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Password Change */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <KeyRound className="w-5 h-5 mr-2" />
              Change Password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="change-password"
                  checked={isChangingPassword}
                  onChange={(e) => setIsChangingPassword(e.target.checked)}
                  className="h-4 w-4 text-[#00859e] focus:ring-[#00859e] border-gray-300 rounded"
                />
                <label htmlFor="change-password" className="ml-2 block text-sm text-gray-900">
                  I want to change my password
                </label>
              </div>

              {isChangingPassword && (
                <div className="space-y-4 pt-4">
                  <Input
                    type="password"
                    label="Current Password"
                    value={passwords.current}
                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                    required
                  />
                  <Input
                    type="password"
                    label="New Password"
                    value={passwords.new}
                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                    required
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                    required
                  />
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsChangingPassword(false);
                        setPasswords({ current: '', new: '', confirm: '' });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleChangePassword}
                      disabled={isLoading}
                    >
                      Change Password
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};