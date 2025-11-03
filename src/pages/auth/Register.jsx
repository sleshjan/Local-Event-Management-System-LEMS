import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Checkbox from '../../components/common/Checkbox';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    phone: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    return password.length >= 8;
  };

  const validatePhone = (phone) => {
    // Basic phone validation - digits, spaces, +, -, ()
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData({
      ...formData,
      [name]: newValue
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'firstName':
        if (!value.trim()) error = 'First name is required';
        break;
      case 'lastName':
        if (!value.trim()) error = 'Last name is required';
        break;
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!validateEmail(value)) {
          error = 'Please enter a valid email';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (!validatePassword(value)) {
          error = 'Password must be at least 8 characters';
        }
        break;
      case 'confirmPassword':
        if (!value) {
          error = 'Please confirm your password';
        } else if (value !== formData.password) {
          error = 'Passwords do not match';
        }
        break;
      case 'location':
        if (!value.trim()) error = 'Location is required';
        break;
      case 'phone':
        if (!value) {
          error = 'Phone number is required';
        } else if (!validatePhone(value)) {
          error = 'Please enter a valid phone number';
        }
        break;
      case 'agreedToTerms':
        if (!formData.agreedToTerms) {
          error = 'You must agree to the Terms and Privacy Policy';
        }
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error;
  };

 const handleSubmit = (e) => {
  e.preventDefault();

  // Validate all fields
  const fieldNames = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'location', 'phone'];
  const newErrors = {};
  let hasErrors = false;

  fieldNames.forEach(field => {
    const error = validateField(field, formData[field]);
    if (error) {
      newErrors[field] = error;
      hasErrors = true;
    }
  });

  // Check terms agreement
  if (!formData.agreedToTerms) {
    newErrors.agreedToTerms = 'You must agree to the Terms and Privacy Policy';
    hasErrors = true;
  }

  // Mark all fields as touched
  const allTouched = {};
  fieldNames.forEach(field => {
    allTouched[field] = true;
  });
  setTouched(allTouched);

  if (hasErrors) {
    setErrors(newErrors);
    return;
  }

  // Success - navigate to interest selection
  console.log('Register submitted:', formData);
  navigate('/select-interests');
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Logo />
          <Link
            to = '/login'
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </div>

        {/* Title */}
        <div className='pl-3'>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-600">
            Register to discover events.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Account Details Section */}
          <div className="rounded-2xl p-3 md:p-3 space-y-5">
            <h2 className="text-xl font-semibold text-gray-900 my-2">
              Account details
            </h2>

            {/* First Name & Last Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="First name"
                  type="text"
                  name="firstName"
                  placeholder="Jane"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.firstName && errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <Input
                  label="Last name"
                  type="text"
                  name="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.lastName && errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <Input
                label="Email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.email && errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.password && errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>
              <div>
                <Input
                  label="Confirm password"
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.confirmPassword && errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Location & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Location"
                  type="text"
                  name="location"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.location && errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>
              <div>
                <Input
                  label="Phone"
                  type="tel"
                  name="phone"
                  placeholder="+1 555 123 4567"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {touched.phone && errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className='pb-2'>
            <Checkbox
              label="I agree to the Terms and Privacy Policy"
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            {errors.agreedToTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms}</p>
            )}
          </div>

          {/* Create Account Button */}
          <Button text="Create account" type="submit" fullWidth />

          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">
              Already have an account?{' '}
            </span>
            <Link
              to = '/login'
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;