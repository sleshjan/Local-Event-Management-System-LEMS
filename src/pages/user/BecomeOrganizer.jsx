import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Menu, X } from "lucide-react";
import { organizerService } from "../../services/organizerService";
import { userService } from "../../services/userService";
import { parseApiError } from "../../services/api";
import { useToast } from "../../context/ToastContext";
import RichTextEditor from "../../components/common/RichTextEditor";

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

  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }

    // specific effect to load phone number
    const loadUserPhone = async () => {
      try {
        const user = await userService.getProfile();
        const userData = user.data || user;
        if (userData.phone_number) {
          setFormData(prev => ({ ...prev, phone_no: userData.phone_number }));
        }
      } catch (err) {
        // Error load
      }
    };
    loadUserPhone();
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const response = await organizerService.getMyRequests();
      const requests = response.data || response || [];
      setMyRequests(requests);

      // Determine if user can submit a new request
      // Requirements: if list is empty OR last entry status is 'rejected'
      if (requests.length === 0) {
        setCanSubmit(true);
      } else {
        const lastRequest = requests[0]; // Assuming latest is first
        if (lastRequest.status === 'rejected' || lastRequest.status === 'Rejected') {
          setCanSubmit(true);
        } else {
          setCanSubmit(false);
        }
      }
    } catch (err) {
      console.error("Failed to fetch my requests", err);
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
      const isPhoneVerified = userData.phone_verified_at || userData.is_phone_verified;

      if (!isEmailVerified || !isPhoneVerified) {
        showToast("Both Email and Phone must be verified to become an organizer. Please verify them in your Profile settings.", "warning");
        navigate('/profile');
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-8">
            {/* Page Title */}
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Become an Organizer
            </h1>

            {/* Form Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 sm:p-8 lg:px-10 lg:py-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                Request Organizer Access
              </h2>
              <p className="text-gray-600 mb-4">
                Fill out the form below to request organizer privileges.
              </p>

              {/* Recent Requests List */}
              {myRequests.length > 0 && (
                <div className="mb-8 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wider">
                    Recent Requests
                  </h3>
                  <div className="space-y-3">
                    {myRequests.map((req, index) => (
                      <div key={req.id || index} className="flex items-center justify-between bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-800 line-clamp-1">
                            {req.reason}
                          </span>
                          <span className="text-xs text-gray-400">
                            {req.created_at ? new Date(req.created_at).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize ${req.status === 'approved' ? 'bg-green-100 text-green-700 border border-green-200' :
                          req.status === 'rejected' ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                          {req.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Phone Number */}
                <div>
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
                    <p className="text-red-500 text-sm mt-1">
                      {errors.phone_no}
                    </p>
                  )}
                </div>

                {/* Reason for becoming an organizer */}
                <div>
                  <RichTextEditor
                    label="Reason for becoming an organizer"
                    value={formData.reason}
                    onChange={(content) => setFormData({ ...formData, reason: content })}
                    placeholder="Enter the reason for becoming an organizer"
                    error={touched.reason ? errors.reason : ''}
                  />
                </div>

                {/* Additional Information */}
                <div>
                  <RichTextEditor
                    label="Additional Information"
                    value={formData.additional_information}
                    onChange={(content) => setFormData({ ...formData, additional_information: content })}
                    placeholder="Any extra details you'd like to share"
                  />
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button
                    type="button"
                    onClick={() => navigate("/dashboard")}
                    className="w-full sm:w-1/2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>

                  <div className="w-full sm:w-1/2">
                    <Button
                      text={!canSubmit ? `Status: ${myRequests[0]?.status || 'Pending'}` : "Submit Request"}
                      type="submit"
                      fullWidth
                      disabled={!canSubmit}
                      className={!canSubmit ? "bg-gray-300 text-gray-500 cursor-not-allowed opacity-75" : ""}
                    />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeOrganizer;
