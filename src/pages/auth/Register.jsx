import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Loader2 } from "lucide-react";
import { authService } from "../../services/authService";
import { locationService } from "../../services/locationService";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    province: "", // Storing ID
    district: "", // Storing ID
    municipality: "", // Storing ID
    ward: "",
    street: "",
    profilePicture: null,
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingLocations, setFetchingLocations] = useState(true);

  // Full location data from API
  const [locationData, setLocationData] = useState([]);

  // Derived state for dropdowns
  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]); // Array of numbers

  // Load addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setFetchingLocations(true);
        const data = await locationService.getAddresses();
        setLocationData(data);
      } catch (err) {
        setApiError("Failed to load location data. Please refresh.");
      } finally {
        setFetchingLocations(false);
      }
    };
    fetchAddresses();
  }, []);

  // Handle Province Change
  useEffect(() => {
    if (formData.province) {
      // formData.province is an ID (string or number from value)
      const selectedProvince = locationData.find(p => p.id == formData.province);
      if (selectedProvince && selectedProvince.districts) {
        setDistricts(selectedProvince.districts);
      } else {
        setDistricts([]);
      }
      // Reset subsequent fields
      setFormData((prev) => ({
        ...prev,
        district: "",
        municipality: "",
        ward: "",
      }));
      setMunicipalities([]);
      setWards([]);
    }
  }, [formData.province, locationData]);

  // Handle District Change
  useEffect(() => {
    if (formData.district) {
      // formData.district is an ID
      const selectedDistrict = districts.find(d => d.id == formData.district);
      if (selectedDistrict && selectedDistrict.municipalities) {
        setMunicipalities(selectedDistrict.municipalities);
      } else {
        setMunicipalities([]);
      }
      setFormData((prev) => ({ ...prev, municipality: "", ward: "" }));
      setWards([]);
    }
  }, [formData.district, districts]);

  // Handle Municipality Change
  useEffect(() => {
    if (formData.municipality) {
      // formData.municipality is an ID
      const selectedMunicipality = municipalities.find(m => m.id == formData.municipality);

      if (selectedMunicipality && selectedMunicipality.no_of_ward) {
        // Generate ward numbers array [1, 2, ..., N]
        const wardCount = parseInt(selectedMunicipality.no_of_ward, 10);
        const wardArray = Array.from({ length: wardCount }, (_, i) => i + 1);
        setWards(wardArray);
      } else {
        setWards([]);
      }
      setFormData((prev) => ({ ...prev, ward: "" }));
    }
  }, [formData.municipality, municipalities]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setFormData({
      ...formData,
      [name]: newValue,
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate File Size (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please upload a smaller image.");
        return;
      }

      // Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file format. Please upload JPG, PNG, GIF, or WEBP.");
        return;
      }

      setFormData({
        ...formData,
        profilePicture: file,
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
      case "username":
        if (!value.trim()) error = "Username is required";
        else if (value.length < 3)
          error = "Username must be at least 3 characters";
        break;
      case "email":
        if (!value) {
          error = "Email is required";
        } else if (!validateEmail(value)) {
          error = "Please enter a valid email";
        }
        break;
      case "password":
        if (!value) {
          error = "Password is required";
        } else if (!validatePassword(value)) {
          error = "Password must be at least 8 characters";
        }
        break;
      case "confirmPassword":
        if (!value) {
          error = "Please confirm your password";
        } else if (value !== formData.password) {
          error = "Passwords do not match";
        }
        break;
      case "province":
        if (!value) error = "Province is required";
        break;
      case "district":
        if (!value) error = "District is required";
        break;
      case "municipality":
        if (!value) error = "Municipality is required";
        break;
      case "ward":
        if (!value) error = "Ward number is required";
        break;
      case "street":
        if (!value.trim()) error = "Street is required";
        break;
      case "agreedToTerms":
        if (!formData.agreedToTerms) {
          error = "You must agree to the Terms and Privacy Policy";
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

    const fieldNames = [
      "username",
      "email",
      "password",
      "confirmPassword",
      "province",
      "district",
      "municipality",
      "ward",
      "street",
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

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms =
        "You must agree to the Terms and Privacy Policy";
      hasErrors = true;
    }

    const allTouched = {};
    fieldNames.forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Navigate to select interests page with form data
    navigate("/select-interests", { state: { registrationData: formData } });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Logo />
          <div className="flex flex-col items-end">
            <Link
              to="/"
              className="text-sm text-purple-600 hover:underline font-medium"
            >
              Go back to Dashboard
            </Link>
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>

        {/* Title */}
        <div className="pl-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-600">Register to discover events.</p>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{apiError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Account Details Section */}
          <div className="rounded-2xl p-3 md:p-3 space-y-5">
            <h2 className="text-xl font-semibold text-gray-900 my-2">
              Account details
            </h2>

            {/* Username */}
            <div>
              <Input
                label="Username"
                type="text"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.username && errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username}</p>
              )}
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
                  <p className="text-red-500 text-sm mt-1">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-2">
                Profile Picture
              </label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-purple-300 border-dashed rounded-xl cursor-pointer bg-purple-50 hover:bg-purple-100 transition-all group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-3 text-purple-400 group-hover:text-purple-600 transition-colors" />
                    <p className="mb-2 text-sm text-gray-500 group-hover:text-gray-700">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      {formData.profilePicture ? formData.profilePicture.name : "SVG, PNG, JPG or GIF (MAX. 800x400px)"}
                    </p>
                  </div>
                  <input
                    type="file"
                    name="profilePicture"
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Address Section Title */}
            <h3 className="text-lg font-semibold text-gray-900 pt-2 flex items-center gap-2">
              Address
              {fetchingLocations && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
            </h3>

            {/* Province & District */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Province
                </label>
                <select
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={fetchingLocations}
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all disabled:opacity-50"
                >
                  <option value="">Select province</option>
                  {locationData.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
                {touched.province && errors.province && (
                  <p className="text-red-500 text-sm mt-1">{errors.province}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  District
                </label>
                <select
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!formData.province}
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select district</option>
                  {districts.map((district) => (
                    <option key={district.id} value={district.id}>
                      {district.name}
                    </option>
                  ))}
                </select>
                {touched.district && errors.district && (
                  <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                )}
              </div>
            </div>

            {/* Municipality & Ward */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Municipality
                </label>
                <select
                  name="municipality"
                  value={formData.municipality}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!formData.district}
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select municipality</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </option>
                  ))}
                </select>
                {touched.municipality && errors.municipality && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.municipality}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Ward No.
                </label>
                <select
                  name="ward"
                  value={formData.ward}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  disabled={!formData.municipality}
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="">Select ward</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {touched.ward && errors.ward && (
                  <p className="text-red-500 text-sm mt-1">{errors.ward}</p>
                )}
              </div>
            </div>

            {/* Street */}
            <div>
              <Input
                label="Street"
                type="text"
                name="street"
                placeholder="Enter street name"
                value={formData.street}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              {touched.street && errors.street && (
                <p className="text-red-500 text-sm mt-1">{errors.street}</p>
              )}
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="pb-2">
            <Checkbox
              label={
                <span>
                  I agree to the{" "}
                  <Link
                    to="/terms-and-privacy"
                    className="text-purple-600 hover:underline font-medium"
                  >
                    Terms and Privacy Policy
                  </Link>
                </span>
              }
              name="agreedToTerms"
              checked={formData.agreedToTerms}
              onChange={handleChange}
            />
            {errors.agreedToTerms && (
              <p className="text-red-500 text-sm mt-1">
                {errors.agreedToTerms}
              </p>
            )}
          </div>

          {/* Create Account Button */}
          <Button
            text={loading ? "Creating account..." : "Create account"}
            type="submit"
            fullWidth
            disabled={loading}
          />

          {/* Sign In Link */}
          <div className="text-center">
            <span className="text-gray-600 text-sm">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
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