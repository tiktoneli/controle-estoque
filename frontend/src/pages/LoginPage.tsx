import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { signIn } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await signIn(email, password);

      if (error) {
        addToast({
          title: 'Login failed',
          message: error.message,
          type: 'error',
        });
        return;
      }

      if (data) {
        addToast({
          title: 'Login successful',
          type: 'success',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      addToast({
        title: 'Login failed',
        message: 'An unexpected error occurred',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="bg-white p-8 rounded-lg shadow-md"
      role="main"
      aria-label="Login form"
    >
      <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">Log in to your account</h1>

      <form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        aria-label="Login form"
        noValidate
      >
        <Input
          label="Email"
          type="email"
          id="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
          required
          aria-required="true"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <div id="email-error" className="text-red-500 text-sm" role="alert">
            {errors.email}
          </div>
        )}

        <Input
          label="Password"
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          fullWidth
          required
          aria-required="true"
          aria-invalid={!!errors.password}
          aria-describedby={errors.password ? "password-error" : undefined}
        />
        {errors.password && (
          <div id="password-error" className="text-red-500 text-sm" role="alert">
            {errors.password}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-[#00859e] focus:ring-[#00859e] border-gray-300 rounded"
              aria-label="Remember me"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a 
              href="#" 
              className="font-medium text-[#00859e] hover:text-[#006e84]"
              aria-label="Forgot your password?"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          aria-label={isLoading ? "Signing in..." : "Sign in"}
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
};