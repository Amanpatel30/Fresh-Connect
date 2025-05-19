import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, ArrowRightCircle, Leaf, CheckCircle, Phone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [focused, setFocused] = useState({
    firstname: false,
    lastname: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const getEmailError = (email) => {
    if (!email) return 'Email is required';
    
    // Check for @ symbol
    if (!email.includes('@')) {
      return 'Please add @ symbol';
    }

    const [localPart, domain] = email.split('@');

    // Check username part (before @)
    if (!localPart) {
      return 'Username is required before @';
    }
    if (localPart.length < 3) {
      return 'Username must be at least 3 characters';
    }
    if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
      return 'Username can only contain letters, numbers, dots, hyphens and underscores';
    }

    // Check domain part (after @)
    if (!domain) {
      return 'Domain is required after @';
    }
    if (!domain.includes('.')) {
      return 'Please add domain extension (e.g., .com)';
    }

    const [domainName, extension] = domain.split('.');

    // Check domain name
    if (!domainName) {
      return 'Domain name is required';
    }
    if (!/^[a-zA-Z0-9-]+$/.test(domainName)) {
      return 'Domain can only contain letters, numbers and hyphens';
    }

    // Check extension
    if (!extension) {
      return 'Please add domain extension';
    }
    if (extension.length < 2) {
      return 'Invalid domain extension';
    }
    if (!/^[a-zA-Z]{2,}$/.test(extension)) {
      return 'Domain extension can only contain letters';
    }

    // Final complete email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return 'Invalid email format';
    }

    return '';
  };

  const validateField = (name, value, allValues = formData) => {
    switch (name) {
      case 'firstname':
      case 'lastname':
        if (!value) return `${name === 'firstname' ? 'First' : 'Last'} name is required`;
        if (value.length < 2) return 'At least 2 characters required';
        if (!/^[A-Za-z]+$/.test(value)) return 'Only letters allowed';
        return '';

      case 'email':
        return getEmailError(value);

      case 'phone':
        if (!value) return 'Phone number is required';
        if (!/^\d{10}$/.test(value)) return 'Phone number must be 10 digits';
        return '';

      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'At least 8 characters required';
        if (!/[A-Z]/.test(value)) return 'Add at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Add at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Add at least one number';
        if (!/[!@#$%^&*]/.test(value)) return 'Add at least one special character';
        return '';

      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== allValues.password) return 'Passwords do not match';
        return '';

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
    
    // Validate on change for better user experience
    const error = validateField(name, value, {
      ...formData,
      [name]: value // Include the current change
    });
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        name: `${formData.firstname.trim()} ${formData.lastname.trim()}`,
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone,
        password: formData.password
      };

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/users/register`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        // Show success animation before redirecting
        setIsSuccess(true);
        
        // Wait for animation to complete before redirecting
        setTimeout(() => {
          navigate("/login", { 
            state: { 
              message: "Registration successful! Please login.",
              fromRegister: true 
            }
          });
        }, 1500);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          "Registration failed. Please try again.";
      
      // Set specific field error if available, otherwise show general error
      if (err.response?.data?.field) {
        setErrors({ [err.response.data.field]: errorMessage });
      } else {
        setErrors({ general: errorMessage });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const ErrorMessage = ({ error }) => (
    <AnimatePresence mode="wait" initial={false}>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -10, height: 0 }}
          transition={{ duration: 0.2 }}
          className="text-red-500 text-sm mt-1.5 ml-1"
        >
          {error}
        </motion.p>
      )}
    </AnimatePresence>
  );

  // Clean up on unmount
  useEffect(() => {
    const originalBgColor = document.documentElement.style.backgroundColor;
    document.documentElement.style.backgroundColor = '#f0fdf4';
    
    return () => {
      document.documentElement.style.backgroundColor = originalBgColor;
    };
  }, []);

  // Display general error if present
  const GeneralError = () => (
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
  );

  return (
    <div className="min-h-screen bg-[#f0fdf4] overflow-x-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative min-h-screen flex flex-col items-center justify-center p-6"
      >
        {/* Decorative Elements */}
        <div className="fixed inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#dcfce7_1px,transparent_1px),linear-gradient(to_bottom,#dcfce7_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          <div className="absolute top-0 -left-4 w-72 h-72 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
          <div className="absolute top-0 -right-4 w-72 h-72 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />
        </div>

        {/* Content */}
        <motion.div 
          className="text-center mb-6 relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Logo */}
          <motion.div 
            className="text-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
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
          </motion.div>

          {/* Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-md"
          >
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-[0_2px_16px_-1px_rgba(0,0,0,0.1)] border border-green-100">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Create an account</h2>
                <p className="text-gray-600">
                  Join our community of farmers and food lovers
                </p>
              </div>
              <GeneralError />

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* First Name Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: focused.firstname || formData.firstname ? 1.1 : 1,
                        color: errors.firstname 
                          ? '#ef4444' 
                          : focused.firstname || formData.firstname
                            ? '#22c55e' 
                            : '#94a3b8'
                      }}
                      className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                    >
                      <User className="w-5 h-5" />
                    </motion.div>
                    <input
                      type="text"
                      name="firstname"
                      value={formData.firstname}
                      onChange={handleChange}
                      onFocus={() => handleFocus('firstname')}
                      onBlur={() => handleBlur('firstname')}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                        errors.firstname 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      } focus:ring-4 transition-all duration-300`}
                      placeholder="First Name"
                    />
                  </div>
                  <ErrorMessage error={errors.firstname} />
                </div>

                {/* Last Name Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: focused.lastname || formData.lastname ? 1.1 : 1,
                        color: errors.lastname 
                          ? '#ef4444' 
                          : focused.lastname || formData.lastname
                            ? '#22c55e' 
                            : '#94a3b8'
                      }}
                      className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                    >
                      <User className="w-5 h-5" />
                    </motion.div>
                    <input
                      type="text"
                      name="lastname"
                      value={formData.lastname}
                      onChange={handleChange}
                      onFocus={() => handleFocus('lastname')}
                      onBlur={() => handleBlur('lastname')}
                      className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 border ${
                        errors.lastname 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      } focus:ring-4 transition-all duration-300`}
                      placeholder="Last Name"
                    />
                  </div>
                  <ErrorMessage error={errors.lastname} />
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

                {/* Phone Field */}
                <div className="space-y-1">
                  <div className="relative">
                    <motion.div
                      animate={{
                        scale: focused.phone || formData.phone ? 1.1 : 1,
                        color: errors.phone 
                          ? '#ef4444' 
                          : focused.phone || formData.phone
                            ? '#22c55e' 
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
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      } focus:ring-4 transition-all duration-300`}
                      placeholder="Phone Number (10 digits)"
                      maxLength="10"
                    />
                  </div>
                  <ErrorMessage error={errors.phone} />
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
                      type={showPassword.password ? 'text' : 'password'}
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
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        password: !prev.password
                      }))}
                      className="absolute right-4 inset-y-0 flex items-center"
                    >
                      {showPassword.password ? (
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
                            ? '#22c55e' 
                            : '#94a3b8'
                      }}
                      className="absolute left-4 inset-y-0 flex items-center pointer-events-none"
                    >
                      <Lock className="w-5 h-5" />
                    </motion.div>
                    <input
                      type={showPassword.confirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      onFocus={() => handleFocus('confirmPassword')}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={`w-full pl-12 pr-12 py-3.5 rounded-xl bg-gray-50 border ${
                        errors.confirmPassword 
                          ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                          : 'border-gray-200 focus:border-green-500 focus:ring-green-100'
                      } focus:ring-4 transition-all duration-300`}
                      placeholder="Confirm Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword
                      }))}
                      className="absolute right-4 inset-y-0 flex items-center"
                    >
                      {showPassword.confirmPassword ? (
                        <EyeOff className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  <ErrorMessage error={errors.confirmPassword} />
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
                      <ArrowRightCircle className="w-5 h-5" />
                      <span>Create Account</span>
                    </>
                  )}
                </motion.button>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <Link 
                    to="/login"
                    className="text-sm text-gray-600 hover:text-green-600 transition-colors"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;