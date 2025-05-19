import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Store, ChevronRight, Upload, Mail, 
  Phone, MapPin, User, Lock, Building, FileCheck 
} from 'lucide-react';
import axios from 'axios';

const BusinessRegistration = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState('');
  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
    businessLicense: null,
    registrationNumber: '',
    // Hotel specific fields
    hotelType: '',
    cuisine: [],
    seatingCapacity: '',
    // Seller specific fields
    productCategories: [],
    storageType: '',
    deliveryRadius: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateStep = (currentStep) => {
    const newErrors = {};

    switch (currentStep) {
      case 1:
        if (!businessType) {
          newErrors.businessType = 'Please select a business type';
        }
        break;

      case 2:
        if (!formData.businessName.trim()) {
          newErrors.businessName = 'Business name is required';
        }
        if (!formData.ownerName.trim()) {
          newErrors.ownerName = 'Owner name is required';
        }
        if (!formData.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = 'Invalid email format';
        }
        if (!formData.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        } else if (!/^\d{10}$/.test(formData.phone)) {
          newErrors.phone = 'Invalid phone number';
        }
        break;

      case 3:
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 4:
        if (!formData.address.street.trim()) {
          newErrors['address.street'] = 'Street address is required';
        }
        if (!formData.address.city.trim()) {
          newErrors['address.city'] = 'City is required';
        }
        if (!formData.address.state.trim()) {
          newErrors['address.state'] = 'State is required';
        }
        if (!formData.address.zipCode.trim()) {
          newErrors['address.zipCode'] = 'ZIP code is required';
        }
        break;

      case 5:
        if (!formData.businessLicense) {
          newErrors.businessLicense = 'Business license is required';
        }
        if (!formData.registrationNumber.trim()) {
          newErrors.registrationNumber = 'Registration number is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'businessLicense') {
          formDataToSend.append(key, formData[key]);
        } else if (key === 'address') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      formDataToSend.append('businessType', businessType);

      const response = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/business/register`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.status === 201) {
        navigate('/login', {
          state: {
            message: 'Registration successful! Please login to continue.',
            type: 'success',
          },
        });
      }
    } catch (error) {
      setErrors({
        submit: error.response?.data?.message || 'Registration failed. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Choose Your Business Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <BusinessTypeCard
                icon={<Building2 className="w-8 h-8" />}
                title="Hotel Owner"
                description="Register your hotel/restaurant and connect with customers"
                selected={businessType === 'hotel'}
                onClick={() => setBusinessType('hotel')}
              />
              <BusinessTypeCard
                icon={<Store className="w-8 h-8" />}
                title="Vegetable Seller"
                description="Sell fresh vegetables directly to customers and businesses"
                selected={businessType === 'seller'}
                onClick={() => setBusinessType('seller')}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Basic Information
            </h2>
            <div className="space-y-4">
              <InputField
                icon={<Building />}
                label="Business Name"
                name="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                error={errors.businessName}
              />
              <InputField
                icon={<User />}
                label="Owner Name"
                name="ownerName"
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                error={errors.ownerName}
              />
              <InputField
                icon={<Mail />}
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
              />
              <InputField
                icon={<Phone />}
                label="Phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                error={errors.phone}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Set Your Password
            </h2>
            <div className="space-y-4">
              <InputField
                icon={<Lock />}
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                error={errors.password}
              />
              <InputField
                icon={<Lock />}
                label="Confirm Password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                error={errors.confirmPassword}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Business Address
            </h2>
            <div className="space-y-4">
              <InputField
                icon={<MapPin />}
                label="Street Address"
                name="street"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value }
                })}
                error={errors['address.street']}
              />
              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="City"
                  name="city"
                  value={formData.address.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value }
                  })}
                  error={errors['address.city']}
                />
                <InputField
                  label="State"
                  name="state"
                  value={formData.address.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value }
                  })}
                  error={errors['address.state']}
                />
              </div>
              <InputField
                label="ZIP Code"
                name="zipCode"
                value={formData.address.zipCode}
                onChange={(e) => setFormData({
                  ...formData,
                  address: { ...formData.address, zipCode: e.target.value }
                })}
                error={errors['address.zipCode']}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center mb-8">
              Business Verification
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Business License
                </label>
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PDF, PNG, JPG or JPEG (MAX. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFormData({
                        ...formData,
                        businessLicense: e.target.files[0]
                      })}
                    />
                  </label>
                </div>
                {errors.businessLicense && (
                  <p className="text-red-500 text-sm mt-1">{errors.businessLicense}</p>
                )}
              </div>
              <InputField
                icon={<FileCheck />}
                label="Registration Number"
                name="registrationNumber"
                value={formData.registrationNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  registrationNumber: e.target.value
                })}
                error={errors.registrationNumber}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-8">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Back
                </button>
              )}
              <div className="text-sm text-gray-500">
                Step {step} of 5
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8">
              {errors.submit && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {errors.submit}
                </div>
              )}
              
              {step === 5 ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Complete Registration'
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Next Step
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BusinessTypeCard = ({ icon, title, description, selected, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={`p-6 rounded-xl cursor-pointer transition-all duration-300 ${
      selected
        ? 'bg-green-50 border-2 border-green-500'
        : 'bg-white border-2 border-gray-200 hover:border-green-200'
    }`}
    onClick={onClick}
  >
    <div className={`${selected ? 'text-green-600' : 'text-gray-600'}`}>
      {icon}
    </div>
    <h3 className={`text-lg font-semibold mt-4 ${
      selected ? 'text-green-700' : 'text-gray-900'
    }`}>
      {title}
    </h3>
    <p className={`mt-2 text-sm ${
      selected ? 'text-green-600' : 'text-gray-500'
    }`}>
      {description}
    </p>
  </motion.div>
);

const InputField = ({
  icon,
  label,
  type = 'text',
  name,
  value,
  onChange,
  error,
}) => (
  <div className="space-y-1">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700">
      {label}
    </label>
    <div className="relative rounded-md shadow-sm">
      {icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-500 sm:text-sm">{icon}</span>
        </div>
      )}
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        className={`block w-full ${
          icon ? 'pl-10' : 'pl-3'
        } pr-3 py-2 sm:text-sm border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 ${
          error ? 'border-red-300' : ''
        }`}
      />
    </div>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default BusinessRegistration;