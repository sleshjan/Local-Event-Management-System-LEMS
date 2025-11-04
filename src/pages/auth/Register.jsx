import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../../components/common/Logo";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Checkbox from "../../components/common/Checkbox";
import locationData from "../../data/locationData.json";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
    street: "",
    agreedToTerms: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const [districts, setDistricts] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [wards, setWards] = useState([]);

  useEffect(() => {
    if (formData.province) {
      const selectedProvince = locationData[formData.province];
      setDistricts(Object.keys(selectedProvince));
      setFormData((prev) => ({
        ...prev,
        district: "",
        municipality: "",
        ward: "",
      }));
      setMunicipalities([]);
      setWards([]);
    }
  }, [formData.province]);

  useEffect(() => {
    if (formData.province && formData.district) {
      const selectedDistrict =
        locationData[formData.province][formData.district];
      setMunicipalities(Object.keys(selectedDistrict));
      setFormData((prev) => ({ ...prev, municipality: "", ward: "" }));
      setWards([]);
    }
  }, [formData.district]);

  useEffect(() => {
    if (formData.province && formData.district && formData.municipality) {
      const selectedMunicipality =
        locationData[formData.province][formData.district][
          formData.municipality
        ];
      setWards(selectedMunicipality);
      setFormData((prev) => ({ ...prev, ward: "" }));
    }
  }, [formData.municipality]);

  // const provinces = [
  //   'Province No. 1',
  //   'Madhesh Province',
  //   'Bagmati Province',
  //   'Gandaki Province',
  //   'Lumbini Province',
  //   'Karnali Province',
  //   'Sudurpashchim Province'
  // ];
  // const districts = [
  //   'Kathmandu',
  //   'Lalitpur',
  //   'Bhaktapur',
  //   'Chitwan',
  //   'Pokhara',
  //   'Dharan',
  //   'Butwal',
  //   'Biratnagar'
  // ];
  // const municipalities = [
  //   'Kathmandu Metropolitan City',
  //   'Lalitpur Metropolitan City',
  //   'Bhaktapur Municipality',
  //   'Kirtipur Municipality',
  //   'Madhyapur Thimi Municipality'
  // ];

  // Validation functions

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
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

    // Check terms agreement
    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms =
        "You must agree to the Terms and Privacy Policy";
      hasErrors = true;
    }

    // Mark all fields as touched
    const allTouched = {};
    fieldNames.forEach((field) => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    // Success - navigate to interest selection
    console.log("Register submitted:", formData);
    navigate("/select-interests");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-lg p-6 md:p-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Logo />
          <Link
            to="/login"
            className="text-sm text-purple-600 hover:underline font-medium"
          >
            Back to sign in
          </Link>
        </div>

        {/* Title */}
        <div className="pl-3">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-gray-600">Register to discover events.</p>
        </div>

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

            {/* Address Section Title */}
            <h3 className="text-lg font-semibold text-gray-900 pt-2">
              Address
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
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Select province{/*प्रदेश छान्नुहोस्*/}</option>
                  {Object.keys(locationData).map((province) => (
                    <option key={province} value={province}>
                      {province}
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
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Select district{/*जिल्ला छान्नुहोस्*/}</option>
                  {districts.map((district) => (
                    <option key={district} value={district}>
                      {district}
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
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Select municipality{/* नगरपालिका/गाउँपालिका छान्नुहोस्*/}</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality} value={municipality}>
                      {municipality}
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
                  className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
                >
                  <option value="">Select ward{/* वडा नम्बर छान्नुहोस्*/}</option>
                  {wards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
{/*  */}
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
              label="I agree to the Terms and Privacy Policy"
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
          <Button text="Create account" type="submit" fullWidth />

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
