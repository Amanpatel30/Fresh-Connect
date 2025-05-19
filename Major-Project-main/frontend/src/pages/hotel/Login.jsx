import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation, Navigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, LogIn, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { loginHotel } from "../../services/api.jsx";

const HotelLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn } = useUser();
  const from = location.state?.from?.pathname || '/hotel/dashboard';
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
  const [serverError, setServerError] = useState('');
  const [connectionError, setConnectionError] = useState(false);

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate(from, { replace: true });
    }
  }, [isLoggedIn, navigate, from]);

  // Set temporary notice in sessionStorage that will be displayed on the main login page
  useEffect(() => {
    sessionStorage.setItem('hotelLoginRedirectMessage', 'Please use the main login page for hotel access');
    // Clean up the message after 5 seconds to prevent it from persisting
    const timer = setTimeout(() => {
      sessionStorage.removeItem('hotelLoginRedirectMessage');
    }, 5001);
    
    return () => clearTimeout(timer);
  }, []);

  // Email validation
  const getEmailError = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  // Field validation
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (value.length > 0) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    } else {
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
    
    // Reset errors
    setErrors({});
    setServerError('');
    setConnectionError(false);
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with:', formData);
      
      // Make the login request
      const response = await loginHotel({
        email: formData.email,
        password: formData.password
      });
      
      console.log('Login response:', response);
      
      if (response.status === 200 && response.data) {
        // Extract the token and user data
        const { token, _id, name, email, role } = response.data;
        
        if (!token) {
          console.error('No token received from server');
          setServerError('Authentication error: No token received from server');
          setIsLoading(false);
          return;
        }
        
        // Create a user object with all necessary fields
        const userData = {
          status: 'success',
          data: {
            _id,
            name,
            email,
            role: role || 'hotel',
            isHotel: true,
            hotelId: _id,
            token,
            isLoggedIn: true
          }
        };
        
        console.log('Saving user data:', userData);
        
        // Save token to localStorage
        localStorage.setItem('token', token);
        
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(userData.data));
        
        // Call the login function from context
        login(userData);
        
        // Navigate to dashboard
        navigate('/hotel/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      setServerError(error.response?.data?.message || 'Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  // Error message component
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

  // Set background color on mount
  useEffect(() => {
    document.documentElement.style.backgroundColor = '#f8f9fa';
    return () => {
      document.documentElement.style.backgroundColor = '';
    };
  }, []);

  // Redirect to the main login page with type=hotel parameter
  return <Navigate to="/login?type=hotel" replace />;
};

export default HotelLogin; 