import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('No verification token provided.');
      return;
    }

    authService
      .verifyEmail(token)
      .then(() => setStatus('success'))
      .catch((err) => {
        setStatus('error');
        setErrorMessage(err?.response?.data?.message || 'Email verification failed.');
      });
  }, [token]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your email...</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Email Verified!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Your email has been verified successfully. You can now log in.
            </p>
          </div>
          <Link to="/login" className="btn btn-primary w-full block text-center">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900">Verification Failed</h2>
          <p className="mt-2 text-sm text-gray-600">{errorMessage}</p>
        </div>
        <div className="space-y-3">
          <Link to="/login" className="btn btn-primary w-full block text-center">
            Go to Login
          </Link>
          <Link to="/forgot-password" className="btn btn-outline w-full block text-center">
            Request New Link
          </Link>
        </div>
      </div>
    </div>
  );
};
