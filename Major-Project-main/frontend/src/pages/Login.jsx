import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, Leaf } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../context/UserContext";
import * as authService from "../services/authService";
import { loginHotel } from "../services/api.jsx";
import LoginDebugger from "../components/LoginDebugger";
import { shouldShowDebugger } from "../config/debugConfig";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const location = useLocation();
  const fromRegister = location.state?.fromRegister;
  const redirectTo = location.state?.redirectTo || '/home';
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [focused, setFocused] = useState({
    email: false,
    password: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Enhanced email validation
  const getEmailError = (email) => {
    if (!email) return 'Email is required';
    if (!email.includes('@')) return 'Please add @ symbol';
    const [localPart, domain] = email.split('@');
    
    if (!localPart) return 'Username is required before @';
    if (!domain) return 'Domain is required after @';
    if (!domain.includes('.')) return 'Please add domain extension (e.g., .com)';
    
    const extension = domain.split('.')[1];
    if (!extension) return 'Please add domain extension';
    if (extension.length < 2) return 'Invalid domain extension';
    
    // Final email regex check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'Invalid email format';
    }
    
    return '';
  };

  // Update validateField function
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        return getEmailError(value);
      case 'password':
        if (!value) return 'Password is required';
        return '';
      default:
        return '';
    }
  };

  // Update handleChange to provide real-time validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Only show errors after user starts typing
    if (value.length > 0) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
      // Clear error when field is empty
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFocus = (name) => {
    setFocused(prev => ({
      ...prev,
      [name]: true
    }));
  };

  const handleBlur = (name) => {
    setFocused(prev => ({
      ...prev,
      [name]: false
    }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors first
    setErrors({});
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return; // Stop here if there are validation errors
    }

    setIsLoading(true);

    try {
      // Clear any existing token before attempting to log in
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('Attempting login with:', { email: formData.email });
      
      let userData = null;
      let redirectPath = '/home'; // Default redirect
      let loginSuccess = false;

      // First try regular user/seller login
      try {
        const userResponse = await authService.login({ 
          email: formData.email, 
          password: formData.password 
        });
        
        // The login was successful
        userData = userResponse;
        loginSuccess = login(userData);

        // Determine redirect path based on user role
        if (userData && userData.role === 'seller') {
          redirectPath = '/seller';
        } else if (userData && userData.role === 'hotel') {
          redirectPath = '/hotel';
        } else {
          redirectPath = '/home';
        }
      } catch (userLoginError) {
        // If user login fails, try hotel login
        console.log('User login failed, trying hotel login...');
        
        try {
          const hotelResponse = await loginHotel({ 
            email: formData.email, 
            password: formData.password 
          });
          
          if (hotelResponse && hotelResponse.data) {
            const { _id, name, email, token } = hotelResponse.data;
            
            userData = {
              _id,
              name,
              email,
              role: 'hotel',
              isHotel: true,
              hotelId: _id,
              token
            };
            
            // Log the hotel user data for debugging
            console.log('Created hotel user data:', userData);
            
            // Store the token and user data using the UserContext
            loginSuccess = login(userData);
            redirectPath = '/hotel';
          }
        } catch (hotelLoginError) {
          // If both fail, throw the original error
          throw userLoginError;
        }
      }
      
      if (!loginSuccess || !userData) {
        console.error('Failed to store authentication data');
        setErrors({ general: 'Failed to store authentication data' });
        setIsLoading(false);
        return;
      }
      
      console.log('Login successful, user data stored');
      console.log('User role:', userData.role);
      console.log('Redirecting to:', redirectPath);
      
      // Small delay to ensure storage is complete
      setTimeout(() => {
        navigate(redirectPath);
        // Log the successful login
        console.log('Login successful, redirected to:', redirectPath);
      }, 100);
      
    } catch (err) {
      console.error('Login error:', err);
      const apiErrors = {};
      // Check the exact error message from the backend
      const errorMessage = err.response?.data?.message || err.message;
      
      if (errorMessage === 'Email not registered') {
        apiErrors.email = "Email not registered";
      } else if (errorMessage === 'Incorrect password' || errorMessage === 'Invalid email or password') {
        apiErrors.password = "Incorrect password";
      } else {
        apiErrors.general = errorMessage || "An error occurred. Please try again.";
      }
      setErrors(apiErrors);
      setIsLoading(false);
    }
  };

  // Update ErrorMessage component to handle transitions better
  const ErrorMessage = ({ error }) => (
    <AnimatePresence mode="wait" initial={false}>
      {error && (
        <motion.p
          key={error}
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            height: 'auto',
            transition: { duration: 0.2, ease: 'easeOut' }
          }}
          exit={{ 
            opacity: 0, 
            y: -10, 
            height: 0,
            transition: { duration: 0.15, ease: 'easeIn' }
          }}
          className="text-red-500 text-sm mt-1.5 ml-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );

  // Fix the initial page load flicker
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#f0fdf4';
    return () => {
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // Check for redirect message
  const [redirectMessage, setRedirectMessage] = useState('');
  
  useEffect(() => {
    // Check for redirect message in session storage
    const message = sessionStorage.getItem('hotelLoginRedirectMessage');
    if (message) {
      setRedirectMessage(message);
      // Remove the message to prevent it from showing on future renders
      sessionStorage.removeItem('hotelLoginRedirectMessage');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f0fdf4] overflow-x-hidden">
      {/* Debug Panel - Only visible if enabled in config */}
      {shouldShowDebugger('login') && (
        <div className="container mx-auto px-4 py-4">
          <LoginDebugger />
        </div>
      )}

      {/* Redirect Notification */}
      <AnimatePresence>
        {redirectMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-0 right-0 mx-auto w-max z-50 bg-indigo-100 text-indigo-800 px-6 py-3 rounded-lg shadow-md"
          >
            {redirectMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#dcfce7_1px,transparent_1px),linear-gradient(to_bottom,#dcfce7_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="absolute top-0 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
      </div>

      {/* Content */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative min-h-screen flex flex-col items-center justify-center p-6"
      >
        {/* Logo */}
        <Link to="/" className="inline-block">
          <div className="flex items-center justify-center gap-2">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-800">
              FreshConnect
            </span>
          </div>
        </Link>

        {/* Form Card */}
        <motion.div
          className="w-full max-w-md"
        >
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_2px_16px_-1px_rgba(0,0,0,0.1)] border border-green-100 mt-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to your account
              </p>
            </div>

            {/* Error Message */}
            <AnimatePresence mode="wait" initial={false}>
              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm"
                >
                  {errors.general}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message from Registration */}
            <AnimatePresence mode="wait" initial={false}>
              {fromRegister && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-3 rounded-lg bg-green-50 text-green-600 text-sm"
                >
                  Registration successful! Please log in with your new account.
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: focused.email || formData.email ? 1.1 : 1,
                      color: errors.email 
                        ? '#ef4444' 
                        : focused.email || formData.email
                          ? '#22c55e'
                          : '#94a3b8'
                    }}
                    className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                  >
                    <Mail className="w-5 h-5" />
                  </motion.div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleFocus('email')}
                    onBlur={() => handleBlur('email')}
                    className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                      errors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                    } focus:ring-4 transition-all duration-300`}
                    placeholder="Email"
                  />
                </div>
                <ErrorMessage error={errors.email} />
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="relative">
                  <motion.div
                    animate={{
                      scale: focused.password || formData.password ? 1.1 : 1,
                      color: errors.password 
                        ? '#ef4444' 
                        : focused.password || formData.password
                          ? '#22c55e'
                          : '#94a3b8'
                    }}
                    className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => handleFocus('password')}
                    onBlur={() => handleBlur('password')}
                    className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border ${
                      errors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                        : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                    } focus:ring-4 transition-all duration-300`}
                    placeholder="Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 inset-y-0 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <ErrorMessage error={errors.password} />
              </div>

              {/* Forgot Password Link */}
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={`w-full py-3.5 bg-gray-900 text-white rounded-xl font-medium
                  shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2
                  ${isLoading ? 'opacity-90 cursor-not-allowed' : 'hover:bg-gray-800'}`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </motion.button>

              {/* Create Account Link */}
              <div className="text-center mt-6 flex justify-center space-x-4">
                <Link 
                  to="/register"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  Create account
                </Link>
                <span className="text-gray-400">•</span>
                <Link 
                  to="/hotel/register"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  Register hotel
                </Link>
                <span className="text-gray-400">•</span>
                <Link 
                  to="/seller/register"
                  className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                >
                  Register as seller
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;