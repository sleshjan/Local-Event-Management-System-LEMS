import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Sparkles, Loader2 } from "lucide-react";
import { parseApiError } from "../../services/api";
import { authService } from "../../services/authService";
import { categoryService } from "../../services/categoryService";
import { userService } from "../../services/userService";
import Logo from "../../components/common/Logo";
import InterestCheckbox from "../../components/common/InterestCheckbox";
import SearchInput from "../../components/common/SearchInput";
import { interestIcons } from "../../data/categoryIcons";

const SelectInterests = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  // Storing IDs of selected interests
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Check mode: 'register' (default) or 'edit'
  const mode = location.state?.mode || "register";
  const registrationData = location.state?.registrationData;

  useEffect(() => {
    // Only redirect if in register mode and no data
    if (mode === "register" && !registrationData) {
      navigate("/register");
    }
  }, [registrationData, navigate, mode]);

  // Load categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getCategories();

        let fetchedData = [];
        if (Array.isArray(response)) {
          fetchedData = response;
        } else if (response && Array.isArray(response.data)) {
          fetchedData = response.data;
        } else if (response && response.data && Array.isArray(response.data.data)) {
          fetchedData = response.data.data;
        }

        if (fetchedData.length > 0) {
          setCategories(fetchedData);
        }
      } catch (err) {
        setError("Failed to load interests. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Load existing interests if in Edit Mode
  useEffect(() => {
    const fetchUserInterests = async () => {
      if (mode === "edit") {
        try {
          const profile = await userService.getProfile();
          // Assuming profile.interests is an array of objects or IDs
          // accessing interests might depend on backend structure (e.g. profile.data.interests)
          const interests = profile.interests || profile.data?.interests || [];

          // Map to IDs if they are objects
          const interestIds = interests.map(i => (typeof i === 'object' ? i.id : i));
          setSelectedInterests(interestIds);
        } catch (err) {
          setError("Failed to load your current interests.");
        }
      }
    };
    fetchUserInterests();
  }, [mode]);

  const handleInterestToggle = (id) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
    if (error) setError("");
  };

  const handleContinue = async () => {
    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests to continue");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (mode === "edit") {
        // Update existing user interests
        await userService.updateInterests(selectedInterests);
        setSuccessMessage("Interests updated successfully!");

        // Wait for user to see message before navigating
        setTimeout(() => {
          navigate("/dashboard");
        }, 1500);

      } else {
        // Register new user
        const finalData = {
          ...registrationData,
          interests: selectedInterests
        };
        await authService.register(finalData);
        navigate("/dashboard");
      }
    } catch (err) {
      const msg = parseApiError(err);
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate("/register");
  };

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Helper to get icon
  const getIconForCategory = (name) => {
    // Try exact match
    if (interestIcons[name]) return interestIcons[name];
    // Try partial match or defaults could be added here
    // For now returning undefined (InterestCheckbox handles no icon)
    return undefined;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Sidebar - Desktop Only */}
      <div className="hidden lg:block lg:w-64 bg-white border-r border-gray-200 p-6">
        <div className="mb-8">
          <Logo />
        </div>
        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-sm text-purple-900 font-medium">
            Step 2 of 2 • Choose your interests
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6 lg:px-12">
          <div className="flex items-center gap-2 text-gray-700">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium text-sm sm:text-base">
              Tailor your event feed
            </span>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-12">
            {/* Mobile Logo & Step */}
            <div className="lg:hidden mb-6">
              <Logo />
              <div className="mt-4 bg-purple-50 rounded-xl p-3 inline-block">
                <p className="text-xs text-purple-900 font-medium">
                  Step 2 of 2 • Choose your interests
                </p>
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Pick a few interests
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Select at least 3 to personalize recommendations for your user
                type.
              </p>
            </div>

            {/* Search */}
            <div className="mb-6">
              <SearchInput
                placeholder="Search interests"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm font-medium">{successMessage}</p>
              </div>
            )}

            {/* Selected Count */}
            {selectedInterests.length > 0 && (
              <div className="mb-6 p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <p className="text-purple-700 text-sm font-medium">
                  {selectedInterests.length} interest
                  {selectedInterests.length !== 1 ? "s" : ""} selected
                  {selectedInterests.length >= 3 && " ✓"}
                </p>
              </div>
            )}

            {/* Content Body */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-600" />
                <p>Loading interests...</p>
              </div>
            ) : (
              <>
                {/* Interest Grid - Flattened */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
                  {filteredCategories.map((category) => {
                    const Icon = getIconForCategory(category);
                    return (
                      <InterestCheckbox
                        key={category.id}
                        label={category.name}
                        name={`interest-${category.id}`}
                        icon={Icon}
                        checked={selectedInterests.includes(category.id)}
                        onChange={() => handleInterestToggle(category.id)}
                      />
                    );
                  })}
                </div>

                {/* No Results */}
                {!loading && filteredCategories.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No interests found matching "{searchQuery}"
                    </p>
                  </div>
                )}
              </>
            )}


            {/* Footer Note */}
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
              You can change these anytime from your profile.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-center items-center">
              <button
                onClick={mode === "edit" ? () => navigate("/dashboard") : handleBack}
                disabled={submitting}
                className="w-full sm:w-auto min-w-40 px-8 py-4 text-gray-700 text-lg bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow order-2 sm:order-1 disabled:opacity-50"
              >
                {mode === "edit" ? "Cancel" : "Back"}
              </button>
              <button
                onClick={handleContinue}
                disabled={submitting || loading}
                className="w-full sm:w-auto min-w-40 px-8 py-4 bg-purple-600 text-lg text-white rounded-xl hover:bg-purple-700 transition-all shadow-md hover:shadow-lg order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {submitting ? (mode === "edit" ? "Saving..." : "Creating Account...") : (mode === "edit" ? "Save Changes" : "Create Account")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
