import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { Menu, X } from "lucide-react";

const BecomeOrganizer = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formData, setFormData] = useState({
    organizationName: "",
    organizationType: "",
    location: "",
    phone: "",
    bio: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }
  }, []);

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
      case "organizationName":
        if (!value.trim()) error = "Organization name is required";
        break;
      case "organizationType":
        if (!value) error = "Organization type is required";
        break;
      case "location":
        if (!value.trim()) error = "Location is required";
        break;
      case "phone":
        if (!value) {
          error = "Phone number is required";
        } else if (!validatePhone(value)) {
          error = "Please enter a valid phone number";
        }
        break;
      case "bio":
        if (!value.trim()) error = "Bio is required";
        else if (value.trim().length < 10)
          error = "Bio must be at least 10 characters";
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const fieldNames = [
      "organizationName",
      "organizationType",
      "location",
      "phone",
      "bio",
    ];
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

    console.log("Organizer request submitted:", formData);
    alert("Your request to become an organizer has been submitted!");
    navigate("/dashboard");
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

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Organization Name and Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Organization Name"
                      type="text"
                      name="organizationName"
                      placeholder="ABC Events"
                      value={formData.organizationName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.organizationName && errors.organizationName && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.organizationName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                      Organization Type
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                    >
                      <option value="">Choose an option</option>
                      <option value="Company">Company</option>
                      <option value="Community">Community</option>
                      <option value="Individual">Individual</option>
                    </select>
                    {touched.organizationType && errors.organizationType && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.organizationType}
                      </p>
                    )}
                  </div>
                </div>

                {/* Location and Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Primary Location"
                      type="text"
                      name="location"
                      placeholder="City, Country"
                      value={formData.location}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.location && errors.location && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>

                  <div>
                    <Input
                      label="Contact Phone"
                      type="tel"
                      name="phone"
                      placeholder="+1 555 123 4567"
                      value={formData.phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {touched.phone && errors.phone && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">
                    Organizer Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Short description of your events and mission"
                    rows="4"
                    className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
                  />
                  {touched.bio && errors.bio && (
                    <p className="text-red-500 text-sm mt-1">{errors.bio}</p>
                  )}
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
                    <Button text="Submit Request" type="submit" fullWidth />
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
