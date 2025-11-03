import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from '../../components/common/Logo';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
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
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true
    });

    // If there are errors, don't submit
    if (emailError || passwordError) {
      return;
    }

    // Success - proceed with login
    console.log('Login submitted:', formData);
    // alert('Login successful! (This is where you would call your API)');
    navigate('/dashboard'); // Navigate after successful login
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8 md:p-12">
        {/* Logo */}
        <div className="mb-5">
          <Logo />
        </div>

        {/* Welcome Text */}
        <div className="mb-5">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Welcome back
          </h1>
          <p className="text-gray-600">
            Sign in to discover events tailored to your interests.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Input */}
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

          {/* Password Input */}
          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.password && errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-purple-600 hover:underline "
            >
              Forgot password?
            </Link>
            </div>

          {/* Sign In Button */}
          <Button text="Sign in" type="submit" fullWidth />

          {/* Create Account Link */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">
              Don't have an account?{' '}
            </span>

            {/* Link to register */}
             <Link
              to = '/register'
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;