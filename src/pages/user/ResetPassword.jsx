import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import AdminSidebar from "../../components/admin/AdminSidebar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Menu, X, Eye, EyeOff } from "lucide-react";
import { authService } from "../../services/authService";
import { parseApiError } from "../../services/api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // UI State
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Password Visibility State
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    // Check for admin role
    const userString = localStorage.getItem('user');
    if (userString) {
      try {
        const user = JSON.parse(userString);
        // Robust check for admin role in case of nested data structures
        const role = user?.role || user?.data?.role || '';
        setIsAdmin(role === 'admin' || user?.is_admin === 1 || user?.is_admin === true);
      } catch (e) {
        console.error("Error parsing user data", e);
      }
    }

    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }
  }, []);

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "oldPassword":
        if (!value) error = "Current password is required";
        break;
      case "newPassword":
        if (!value) {
          error = "New password is required";
        } else if (!validatePassword(value)) {
          error = "Password must be at least 8 characters";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your new password";
        } else if (value !== formData.newPassword) {
          error = "Passwords do not match";
        }
        break;
      default:
        break;
    }

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));

    return error;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    setSuccessMessage("");

    // Validate all fields
    const oldPasswordError = validateField("oldPassword", formData.oldPassword);
    const newPasswordError = validateField("newPassword", formData.newPassword);
    const confirmPasswordError = validateField(
      "confirmPassword",
      formData.confirmPassword
    );

    // Mark all fields as touched
    setTouched({
      oldPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    // If there are errors, don't submit
    if (oldPasswordError || newPasswordError || confirmPasswordError) {
      return;
    }

    setLoading(true);

    try {
      await authService.updatePassword({
        old_password: formData.oldPassword,
        password: formData.newPassword,
        password_confirmation: formData.confirmPassword
      });
      setSuccessMessage("Password updated successfully!");
      setFormData({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setTouched({});

      // Navigate after a delay to let user see success message
      setTimeout(() => {
        navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
      }, 2000);
    } catch (err) {
      setApiError(parseApiError(err));
    } finally {
      setLoading(false);
    }
  };

  // Helper to render password input with toggle
  const renderPasswordInput = (label, name, value, showState, setShowState) => (
    <div className="relative">
      <Input
        label={label}
        type={showState ? "text" : "password"}
        name={name}
        placeholder={`Enter ${label.toLowerCase()}`}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
      <button
        type="button"
        onClick={() => setShowState(!showState)}
        className="absolute right-4 top-[38px] text-gray-500 hover:text-gray-700"
        tabIndex="-1" // Prevent tab focus
      >
        {showState ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
      {touched[name] && errors[name] && (
        <p className="text-red-500 text-sm mt-1">
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        {isAdmin ? <AdminSidebar /> : <Sidebar userInterests={userInterests} />}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="absolute left-0 top-0 h-full w-64 bg-white flex flex-col">
            <div className="p-4 flex justify-end border-b border-gray-200">
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {isAdmin ? <AdminSidebar /> : <Sidebar userInterests={userInterests} />}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar - Mobile Only */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-4">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
            {/* Page Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Change Password
            </h1>

            {/* Change Password Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 lg:py-5 lg:px-10 max-w-2xl">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">
                Update your password
              </h2>

              {/* Feedback Messages */}
              {apiError && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {apiError}
                </div>
              )}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">
                  {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Old Password */}
                {renderPasswordInput("Old Password", "oldPassword", formData.oldPassword, showOldPassword, setShowOldPassword)}

                {/* New Password */}
                {renderPasswordInput("New Password", "newPassword", formData.newPassword, showNewPassword, setShowNewPassword)}

                {/* Confirm New Password */}
                {renderPasswordInput("Confirm New Password", "confirmPassword", formData.confirmPassword, showConfirmPassword, setShowConfirmPassword)}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8">
                  {/* Cancel Button */}
                  <button
                    type="button"
                    onClick={() => {
                      navigate(isAdmin ? "/admin/dashboard" : "/dashboard");
                    }}
                    className="w-full sm:w-1/2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>

                  {/* Update Password Button */}
                  <div className="w-full sm:w-1/2">
                    <Button
                      text={loading ? "Updating..." : "Update Password"}
                      type="submit"
                      fullWidth
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Helper Text */}
                <p className="text-sm text-gray-500 text-center">
                  Make sure your password is at least 8 characters.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
