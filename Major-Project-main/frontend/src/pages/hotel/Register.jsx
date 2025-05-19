import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Building, User, MapPin, Phone, UserPlus, Coffee } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import axios from "axios";
import { registerHotel, checkHotelEmail } from "../../services/api.jsx";

const HotelRegister = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hotelName: '',
    address: '',
    phone: ''
  });
  const [focused, setFocused] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
    hotelName: false,
    address: false,
    phone: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      navigate('/hotel/dashboard', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Validation functions
  const getEmailError = (email) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  const getPasswordError = (password) => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const getConfirmPasswordError = (confirmPassword) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (confirmPassword !== formData.password) return 'Passwords do not match';
    return '';
  };

  const getPhoneError = (phone) => {
    if (!phone) return 'Phone number is required';
    if (!/^[0-9+\-\s]{10,15}$/.test(phone)) {
      return 'Invalid phone number format';
    }
    return '';
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return !value ? 'Name is required' : '';
      case 'email':
        return getEmailError(value);
      case 'password':
        return getPasswordError(value);
      case 'confirmPassword':
        return getConfirmPasswordError(value);
      case 'hotelName':
        return !value ? 'Hotel name is required' : '';
      case 'address':
        return !value ? 'Address is required' : '';
      case 'phone':
        return getPhoneError(value);
      default:
        return '';
    }
  };

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
      
      // Special case for confirmPassword - validate when password changes
      if (name === 'password' && formData.confirmPassword) {
        const confirmError = formData.confirmPassword !== value ? 'Passwords do not match' : '';
        setErrors(prev => ({
          ...prev,
          confirmPassword: confirmError
        }));
      }
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
    setErrors({});
    setServerError('');
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      // Format the address to match the hotel schema
      const formattedAddress = {
        street: formData.address,
        city: 'Default City', // These should be added to your form in a real implementation
        state: 'Default State',
        zipCode: '12345',
        country: 'Default Country'
      };

      // First check if the email already exists
      try {
        const checkEmailResponse = await checkHotelEmail(formData.email);
        
        if (checkEmailResponse.data?.exists) {
          setErrors({ email: "Email already registered" });
          setIsLoading(false);
          return;
        }
        
        // Attempt to register with MongoDB using improved API service
        const response = await registerHotel({ 
          name: formData.hotelName,
          ownerName: formData.name,
          email: formData.email,
          password: formData.password,
          address: formattedAddress,
          phone: formData.phone,
          role: 'hotel', // Ensure the role is set to hotel
          isHotel: true  // Explicitly mark as hotel
        });
        
        if (response.status === 201) {
          console.log('Registration successful:', response.data);
          
          // Create a complete user object
          const userData = {
            ...response.data,
            role: 'hotel',
            isHotel: true,
            token: response.data.token
          };
          
          // Store complete user data
          localStorage.setItem('user', JSON.stringify(userData));
          localStorage.setItem('token', response.data.token);
          
          // Use the login function from UserContext to set up the session
          login(userData);
          
          setRegistrationSuccess(true);
          
          // Redirect to dashboard instead of login since we're already logged in
          setTimeout(() => {
            navigate("/hotel/dashboard");
          }, 2000);
        }
      } catch (err) {
        if (err.response) {
          // Server responded with an error status code
          const errorMessage = err.response.data?.message || 'Registration failed';
          
          if (errorMessage.includes('email')) {
            setErrors({ email: "Email already registered" });
          } else if (errorMessage.includes('phone')) {
            setErrors({ phone: "Phone number already in use" });
          } else {
            setServerError(errorMessage);
          }
        } else if (err.request) {
          // Request was made but no response (network error)
          setServerError("Cannot connect to server. Please check your internet connection and try again.");
        } else {
          // Error setting up the request
          setServerError("An error occurred. Please try again.");
        }
      }
    } catch (err) {
      console.error("Registration error:", err);
      setServerError("An unexpected error occurred. Please try again later.");
    } finally {
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

  return (
    <div className="min-h-screen bg-[#f8f9fa] overflow-x-hidden py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative min-h-screen flex flex-col items-center justify-center p-6"
      >
        {/* Decorative Elements */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Logo */}
        <motion.div 
          className="text-center mb-6 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                Hotel Connect
              </span>
            </div>
          </Link>
        </motion.div>

        {/* Registration Success */}
        {registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-lg border border-green-100 text-center mb-6"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Successful!</h2>
            <p className="text-gray-600 mb-4">Your hotel account has been created successfully.</p>
            <p className="text-gray-500 text-sm">Redirecting to dashboard...</p>
          </motion.div>
        )}

        {/* Form Card */}
        {!registrationSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl"
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 shadow-[0_2px_16px_-1px_rgba(0,0,0,0.1)] border border-indigo-50">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Register Your Hotel</h2>
                <p className="text-gray-600">
                  Create an account to manage your hotel
                </p>
              </div>

              {/* Server Error Message */}
              <AnimatePresence mode="wait" initial={false}>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm"
                  >
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Name Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused.name || formData.name ? 1.1 : 1,
                          color: errors.name 
                            ? '#ef4444' 
                            : focused.name || formData.name
                              ? '#4f46e5' 
                              : '#94a3b8'
                        }}
                        className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                      >
                        <User className="w-5 h-5" />
                      </motion.div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onFocus={() => handleFocus('name')}
                        onBlur={() => handleBlur('name')}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                          errors.name 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                        } focus:ring-4 transition-all duration-300`}
                        placeholder="Your Name"
                      />
                    </div>
                    <ErrorMessage error={errors.name} />
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused.email || formData.email ? 1.1 : 1,
                          color: errors.email 
                            ? '#ef4444' 
                            : focused.email || formData.email
                              ? '#4f46e5' 
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
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                        } focus:ring-4 transition-all duration-300`}
                        placeholder="Email Address"
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
                              ? '#4f46e5' 
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
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
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

                  {/* Confirm Password Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused.confirmPassword || formData.confirmPassword ? 1.1 : 1,
                          color: errors.confirmPassword 
                            ? '#ef4444' 
                            : focused.confirmPassword || formData.confirmPassword
                              ? '#4f46e5' 
                              : '#94a3b8'
                        }}
                        className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                      >
                        <Lock className="w-5 h-5" />
                      </motion.div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onFocus={() => handleFocus('confirmPassword')}
                        onBlur={() => handleBlur('confirmPassword')}
                        className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border ${
                          errors.confirmPassword 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                        } focus:ring-4 transition-all duration-300`}
                        placeholder="Confirm Password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 inset-y-0 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        ) : (
                          <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    <ErrorMessage error={errors.confirmPassword} />
                  </div>

                  {/* Hotel Name Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused.hotelName || formData.hotelName ? 1.1 : 1,
                          color: errors.hotelName 
                            ? '#ef4444' 
                            : focused.hotelName || formData.hotelName
                              ? '#4f46e5' 
                              : '#94a3b8'
                        }}
                        className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                      >
                        <Building className="w-5 h-5" />
                      </motion.div>
                      <input
                        type="text"
                        name="hotelName"
                        value={formData.hotelName}
                        onChange={handleChange}
                        onFocus={() => handleFocus('hotelName')}
                        onBlur={() => handleBlur('hotelName')}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                          errors.hotelName 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                        } focus:ring-4 transition-all duration-300`}
                        placeholder="Hotel Name"
                      />
                    </div>
                    <ErrorMessage error={errors.hotelName} />
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-1">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: focused.phone || formData.phone ? 1.1 : 1,
                          color: errors.phone 
                            ? '#ef4444' 
                            : focused.phone || formData.phone
                              ? '#4f46e5' 
                              : '#94a3b8'
                        }}
                        className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                      >
                        <Phone className="w-5 h-5" />
                      </motion.div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={() => handleFocus('phone')}
                        onBlur={() => handleBlur('phone')}
                        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                          errors.phone 
                            ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                            : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                        } focus:ring-4 transition-all duration-300`}
                        placeholder="Phone Number"
                      />
                    </div>
                    <ErrorMessage error={errors.phone} />
                  </div>
                </div>

                {/* Address Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: focused.address || formData.address ? 1.1 : 1,
                        color: errors.address 
                          ? '#ef4444' 
                          : focused.address || formData.address
                            ? '#4f46e5' 
                            : '#94a3b8'
                      }}
                      className="absolute left-4 top-4 flex items-center pointer-events-none"
                    >
                      <MapPin className="w-5 h-5" />
                    </motion.div>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      onFocus={() => handleFocus('address')}
                      onBlur={() => handleBlur('address')}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                        errors.address 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-100'
                      } focus:ring-4 transition-all duration-300 min-h-[100px]`}
                      placeholder="Hotel Address"
                    />
                  </div>
                  <ErrorMessage error={errors.address} />
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className={`w-full py-3.5 bg-indigo-600 text-white rounded-xl font-medium
                    shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2
                    ${isLoading ? 'opacity-90 cursor-not-allowed' : 'hover:bg-indigo-700'}`}
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
                      <UserPlus className="w-5 h-5" />
                      <span>Register Hotel</span>
                    </>
                  )}
                </motion.button>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <Link 
                    to="/login"
                    className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default HotelRegister; 