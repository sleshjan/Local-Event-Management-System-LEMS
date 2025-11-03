import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import SearchInput from "../../components/common/SearchInput";
import EventCard from "../../components/common/EventCard";
import Button from "../../components/common/Button";
import { Menu, X } from "lucide-react";
import { mockEvents } from "../../data/eventsData";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events] = useState(mockEvents);

  // Mock user interests
  // const userInterests = [
  //   "Live Music",
  //   "Tech Meetups",
  //   "Food & Drink",
  //   "Outdoors",
  //   "Art & Design",
  // ];
  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);
  useEffect(() => {
    // Load interests from localStorage
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    } else {
      // Fallback to default interests if none selected
      setUserInterests(["Live Music", "Tech Meetups", "Food & Drink"]);
    }
  }, []);

  // Dynamic events data - This structure matches your backend
  // Enhanced events data with full details for event details page

  // Filter events based on search
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.categories.some((cat) =>
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

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
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl">
              <SearchInput
                placeholder="Search events, locations, interests"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Adjust Interests Button - Desktop */}
            <div className="hidden sm:block">
              <Button
                text="Adjust interests"
                onClick={() => navigate("/select-interests")}
              />
            </div>
          </div>

          {/* Mobile Adjust Interests */}
          <div className="sm:hidden mt-3">
            <Button
              text="Adjust interests"
              onClick={() => navigate("/select-interests")}
              fullWidth
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Tailored Message */}
            <p className="text-sm text-gray-600 mb-6">
              Tailored by your interests
            </p>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Recommended for you
              </h2>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                See all
              </button>
            </div>

            {/* Events Grid - 3 columns on desktop */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No events found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
