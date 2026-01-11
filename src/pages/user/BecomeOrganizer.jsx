import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Menu, X, Loader2 } from "lucide-react";
import { organizerService } from "../../services/organizerService";
import { userService } from "../../services/userService";
import { parseApiError } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import RichTextEditor from "../../components/common/RichTextEditor";
import ConfirmationModal from "../../components/common/ConfirmationModal";

const BecomeOrganizer = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    phone_no: "",
    reason: "",
    additional_information: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [myRequests, setMyRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [canSubmit, setCanSubmit] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }

    // specific effect to load phone number
    const checkUserStatus = async () => {
      try {
        const user = await userService.getProfile();
        const userData = user.data || user;

        // Check Email Verification
        const isEmailVerified = userData.email_verified_at || userData.is_email_verified;
        if (!isEmailVerified) {
          setShowVerificationModal(true);
        }

        if (userData.phone_number) {
          setFormData(prev => ({ ...prev, phone_no: userData.phone_number }));
        }

        // Only fetch requests if phone is verified to avoid 403
        // Backend enforces strict phone verification for this endpoint
        if (userData.is_phone_verified) {
          fetchMyRequests();
        } else {
          setIsLoadingRequests(false);
        }

      } catch (err) {
        setIsLoadingRequests(false);
      }
    };
    checkUserStatus();
    // fetchMyRequests(); // Moved inside checkUserStatus to depend on verification
  }, []);

  const fetchMyRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await organizerService.getMyRequests();
      console.log("Raw Organizer Requests Response:", response);

      let requests = [];
      if (Array.isArray(response)) {
        requests = response;
      } else if (response && Array.isArray(response.data)) {
        requests = response.data;
      } else if (response?.data && Array.isArray(response.data.data)) {
        requests = response.data.data;
      }

      console.log("Extracted Requests:", requests);
      setMyRequests(requests);

      // Determine if user can submit a new request
      // Requirements: if list is empty OR last entry status is 'rejected'
      if (!Array.isArray(requests) || requests.length === 0) {
        setCanSubmit(true);
      } else {
        const lastRequest = requests[0];
        if (lastRequest && (lastRequest.status === 'rejected' || lastRequest.status === 'Rejected')) {
          setCanSubmit(true);
        } else {
          setCanSubmit(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch my requests", err);
      // Handle the cases where backend reports phone not verified despite user's claim
      if (err.status === 403) {
        const errorMsg = err.data?.error || err.message || "";
        if (errorMsg.toLowerCase().includes('phone')) {
          // Suppress warning as we moved to Email-only verification, but backend might still be enforcing phone on GET.
          // We allow submission effectively treating this as "no requests found/access denied due to old rule".
          // console.warn("Backend reported phone verification issue. User believes they are verified."); 
          setCanSubmit(true);
        }
      }
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, "").length >= 10;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });

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
      case "phone_no":
        if (!value) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      case "reason":
        if (!value.trim()) error = "Reason is required";
        else if (value.trim().length < 10)
          error = "Reason must be at least 10 characters";
        break;
      case "additional_information":
        // Optional field, simplistic validation if needed
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

    // Check Verification Status
    try {
      const currentUser = await userService.getProfile();
      const userData = currentUser.data || currentUser;

      const isEmailVerified = userData.email_verified_at || userData.is_email_verified;

      if (!isEmailVerified) {
        showToast("You need a verified email to become an organizer. Verification email has been sent. Please check your Gmail to verify.", "info");
        // navigate('/profile'); // Removed redirection as per request
        return;
      }
    } catch (err) {
      // Error check
      showToast("Failed to verify account status. Please try again.", "error");
      return;
    }

    const fieldNames = ["phone_no", "reason", "additional_information"];
    const newErrors = {};
    let hasErrors = false;

    fieldNames.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    const allTouched = {};
    fieldNames.forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    try {
      await organizerService.createRequest(formData);
      showToast("Your request to become an organizer has been submitted!", "success");
      navigate("/dashboard");
    } catch (error) {
      showToast(parseApiError(error), "error");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar userInterests={userInterests} />
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
              <Sidebar userInterests={userInterests} />
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
            {/* Page Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Become an Organizer
            </h1>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 sm:p-8 lg:p-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                    Submit Your Request
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {myRequests.length === 0
                      ? "Tell us why you'd like to become an organizer."
                      : "Your previous request was rejected. You can submit a new one below."}
                  </p>
                </div>
                {myRequests.length > 0 && (
                  <button
                    onClick={() => navigate('/organizer-list')}
                    className="text-purple-600 text-sm font-bold hover:underline flex items-center gap-1"
                  >
                    View History
                  </button>
                )}
              </div>

              {isLoadingRequests ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
                  <p className="text-gray-500">Processing...</p>
                </div>
              ) : !canSubmit ? (
                <div className="p-8 text-center bg-blue-50/50 rounded-3xl border border-blue-100">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-pulse" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Request Pending</h3>
                  <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                    You already have an organizer request being reviewed. You'll be notified once it's processed.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => navigate("/organizer-list")}
                      className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Check Status
                    </button>
                    <button
                      onClick={() => navigate("/dashboard")}
                      className="px-6 py-2.5 bg-white text-gray-700 border border-gray-200 font-bold rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Return Home
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Phone Number */}
                  <div className="space-y-1">
                    <Input
                      label="Phone Number"
                      type="tel"
                      name="phone_no"
                      placeholder="9800000000"
                      value={formData.phone_no}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.phone_no && errors.phone_no && (
                      <p className="text-red-500 text-xs font-medium ml-1">
                        {errors.phone_no}
                      </p>
                    )}
                  </div>

                  {/* Reason for becoming an organizer */}
                  <div className="space-y-1">
                    <RichTextEditor
                      label="Reason for becoming an organizer"
                      value={formData.reason}
                      onChange={(content) => setFormData({ ...formData, reason: content })}
                      placeholder="Why do you want to host events on our platform?"
                      error={touched.reason ? errors.reason : ''}
                    />
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-1">
                    <RichTextEditor
                      label="Additional Information (Optional)"
                      value={formData.additional_information}
                      onChange={(content) => setFormData({ ...formData, additional_information: content })}
                      placeholder="Any additional details or portfolio links?"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      className="w-full sm:w-1/2 px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
                    >
                      Cancel
                    </button>

                    <div className="w-full sm:w-1/2">
                      <Button
                        text="Submit Application"
                        type="submit"
                        fullWidth
                        className="py-3.5 shadow-lg shadow-purple-200"
                      />
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <ConfirmationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onConfirm={() => navigate('/profile')}
        title="Email Verification Required"
        message="You need a verified email to submit an organizer request. Please verify your email in your profile settings or check your inbox."
        confirmText="Go to Profile"
        cancelText="Close"
        type="info"
      />
    </div >
  );
};

export default BecomeOrganizer;
