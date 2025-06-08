import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { UserRole } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: UserRole;
    expires_at: string;
  } | null>(null);

  useEffect(() => {
    const validateInvite = async () => {
      const token = searchParams.get('token');
      if (!token) {
        addToast({
          title: 'Error',
          message: 'Invalid invite link',
          type: 'error'
        });
        navigate('/');
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/invites/validate/${token}`);
        if (!response.ok) {
          throw new Error('Invalid or expired invite');
        }

        const data = await response.json();
        setInviteData(data);
        setIsValid(true);
      } catch (error) {
        console.error('Error validating invite:', error);
        addToast({
          title: 'Error',
          message: error instanceof Error ? error.message : 'Failed to validate invite',
          type: 'error'
        });
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    validateInvite();
  }, [searchParams, navigate, addToast]);

  const handleAcceptInvite = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast({
        title: 'Error',
        message: 'Passwords do not match',
        type: 'error'
      });
      return;
    }

    if (password.length < 6) {
      addToast({
        title: 'Error',
        message: 'Password must be at least 6 characters',
        type: 'error'
      });
      return;
    }

    const token = searchParams.get('token');
    if (!token || !inviteData) return;

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteData.email,
          password,
          displayName: inviteData.email.split('@')[0], // Use email username as display name
          role: inviteData.role,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create account');
      }

      addToast({
        title: 'Success',
        message: 'Account created successfully! You can now log in.',
        type: 'success'
      });

      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Error accepting invite:', error);
      addToast({
        title: 'Error',
        message: error instanceof Error ? error.message : 'Failed to create account',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00859e]"></div>
      </div>
    );
  }

  if (!isValid || !inviteData) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Welcome to the Inventory Management System! Please set your password to complete your registration.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleAcceptInvite}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Input
                label="Email"
                type="email"
                value={inviteData.email}
                disabled
              />
            </div>
            <div>
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
            >
              Complete Registration
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitePage; 