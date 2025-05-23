import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

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
    role: string;
    expires_at: string;
  } | null>(null);

  useEffect(() => {
    const validateInvite = async () => {
      const token = searchParams.get('token');
      if (!token) {
        addToast({
          title: 'Invalid Invite',
          message: 'No invite token found',
          type: 'error'
        });
        navigate('/');
        return;
      }

      try {
        console.log('Validating invite with token:', token);
        
        // Check if invite exists and is valid
        const { data, error } = await supabase
          .from('invites')
          .select('*')
          .eq('invite_token', token)
          .maybeSingle();

        console.log('Query response:', { data, error });

        if (error) {
          console.error('Query error:', error);
          throw error;
        }

        if (!data) {
          addToast({
            title: 'Invalid Invite',
            message: 'Invite not found',
            type: 'error'
          });
          navigate('/');
          return;
        }

        // Check if invite is expired
        const now = new Date();
        const expiresAt = new Date(data.expires_at);
        if (now > expiresAt) {
          addToast({
            title: 'Invite Expired',
            message: 'This invite has expired',
            type: 'error'
          });
          navigate('/');
          return;
        }

        // Check if invite has already been accepted
        if (data.status === 'accepted') {
          addToast({
            title: 'Invite Used',
            message: 'This invite has already been used',
            type: 'error'
          });
          navigate('/');
          return;
        }

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
      // 1. Sign up the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: inviteData.email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (signUpError) throw signUpError;

      if (!authData.user) {
        throw new Error('No user data returned');
      }

      // 2. Check if profile exists and update/create accordingly
      const { data: existingProfile, error: profileCheckError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', authData.user.id)
        .single();

      if (profileCheckError && profileCheckError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw profileCheckError;
      }

      let profileError;
      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('profiles')
          .update({
            email: inviteData.email,
            role: inviteData.role as 'manager' | 'admin' | 'auditor' | 'user' | 'visitor',
          })
          .eq('id', authData.user.id);
        profileError = error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: inviteData.email,
              role: inviteData.role as 'manager' | 'admin' | 'auditor' | 'user' | 'visitor',
            }
          ]);
        profileError = error;
      }

      if (profileError) throw profileError;

      // 3. Update the invite status
      const { error: inviteError } = await supabase
        .from('invites')
        .update({ status: 'accepted' })
        .eq('invite_token', token);

      if (inviteError) throw inviteError;

      addToast({
        title: 'Success',
        message: 'Account created successfully! Please check your email to confirm your account.',
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