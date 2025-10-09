import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { googleAuth } from '../Redux/slices/authSlice';

const GoogleCallback = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleGoogleCallback = async () => {
      try {
        // Get the authorization code from URL parameters
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');

        if (!code) {
          console.error('No authorization code found in URL');
          navigate('/');
          return;
        }

        // Dispatch googleAuth action with the code and redirect URI
        const response = await dispatch(googleAuth({
          code,
          redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI,
          clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          clientSecret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET
        })).unwrap();

        if (response) {
          // Successfully authenticated
          navigate('/'); // Navigate to home page or dashboard
        }
      } catch (error) {
        console.error('Google authentication error:', error);
        // Handle error - navigate to login page with error message
        navigate('/?authError=google-auth-failed');
      }
    };

    handleGoogleCallback();
  }, [dispatch, navigate, location]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-lg text-gray-600">Processing your Google sign-in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;