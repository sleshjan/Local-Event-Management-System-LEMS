import { useState , useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Logo from "../../components/common/Logo";
// import Button from "../../components/common/Button";
import InterestCheckbox from "../../components/common/InterestCheckbox";
import SearchInput from "../../components/common/SearchInput";
import { categoryIcons, interestIcons } from "../../data/categoryIcons";

const SelectInterests = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [error, setError] = useState("");

  // Load previously selected interests when page loads
  useEffect(() => {
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setSelectedInterests(JSON.parse(storedInterests));
    }
  }, []);

  // Interest categories
  const categories = [
    {
      title: "Music & Nightlife",
      interests: ["Live Music", "DJ & Clubs", "Classical", "Open Mic"],
    },
    {
      title: "Tech & Learning",
      interests: ["Tech Meetups", "AI & Data", "Design Talks", "Workshops"],
    },
    {
      title: "Food & Drink",
      interests: [
        "Food & Drink",
        "Wine & Tastings",
        "Coffee & Brunch",
        "Vegan & Healthy",
      ],
    },
    {
      title: "Outdoors & Wellness",
      interests: [
        "Hiking & Outdoors",
        "Fitness & Yoga",
        "Cycling",
        "Mindfulness",
      ],
    },
    {
      title: "Arts & Culture",
      interests: ["Art & Design", "Theatre", "Photography", "Museums"],
    },
    {
      title: "Social & Community",
      interests: [
        "Networking",
        "Volunteering",
        "Language Exchange",
        "Board Games",
      ],
    },
  ];

  const handleInterestToggle = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
    // Clear error when user selects
    if (error) setError("");
  };

  const handleContinue = () => {
    if (selectedInterests.length < 3) {
      setError("Please select at least 3 interests to continue");
      return;
    }
    console.log("Selected interests:", selectedInterests);
    // Store interests in localStorage (temporary - in real app use context/redux)
    localStorage.setItem("userInterests", JSON.stringify(selectedInterests));
    navigate("/dashboard");
  };

  const handleBack = () => {
    navigate("/register");
  };

  // Filter categories based on search
  const filteredCategories = categories
    .map((category) => ({
      ...category,
      interests: category.interests.filter((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((category) => category.interests.length > 0);

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

            {/* Interest Categories Grid - 3 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
              {filteredCategories.map((category, index) => {
                const CategoryIcon = categoryIcons[category.title];
                return (
                  <div
                    key={index}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Category Header with Icon */}
                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-100">
                      {CategoryIcon && (
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center shrink-0">
                          <CategoryIcon className="w-5 h-5 text-purple-600" />
                        </div>
                      )}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                        {category.title}
                      </h3>
                    </div>

                    {/* Interest Checkboxes */}
                    <div className="space-y-2">
                      {category.interests.map((interest, idx) => {
                        const InterestIcon = interestIcons[interest];
                        return (
                          <InterestCheckbox
                            key={idx}
                            label={interest}
                            name={interest}
                            icon={InterestIcon}
                            checked={selectedInterests.includes(interest)}
                            onChange={() => handleInterestToggle(interest)}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No interests found matching "{searchQuery}"
                </p>
              </div>
            )}

            {/* Footer Note */}
            <p className="text-xs sm:text-sm text-gray-500 text-center mb-6">
              You can change these anytime from your profile.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:justify-center items-center">
              <button
                onClick={handleBack}
                className="w-full sm:w-auto min-w-40 px-8 py-4 text-gray-700 text-lg bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all shadow-sm hover:shadow order-2 sm:order-1"
              >
                Back
              </button>
              <button
                onClick={handleContinue}
                className="w-full sm:w-auto min-w-40 px-8 py-4 bg-purple-600 text-lg text-white rounded-xl hover:bg-purple-700 transition-all shadow-md hover:shadow-lg order-1 sm:order-2"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectInterests;
