import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import SearchInput from "../../components/common/SearchInput";
import EventCard from "../../components/events/EventCard";
import Button from "../../components/common/Button";
import { Menu, X } from "lucide-react";
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import UserProfileIcon from "../../components/common/UserProfileIcon";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);

  // Get user interests from backend
  const [userInterests, setUserInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        // Assuming profile.interests is array of objects or strings
        const interests = profile.interests || profile.data?.interests || [];
        setUserInterests(interests);
      } catch (err) {
        // Profile load error
      }
    };

    const loadEvents = async () => {
      try {
        const response = await eventService.getAllEvents();

        let eventsData = [];

        // Priority 1: Standard API/Laravel paths
        if (Array.isArray(response)) {
          eventsData = response;
        } else if (response?.data && Array.isArray(response.data)) {
          eventsData = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          eventsData = response.data.data;
        }
        // Priority 2: User specified path
        else if (response?.data?.other?.data && Array.isArray(response.data.other.data)) {
          eventsData = response.data.other.data;
        }
        else if (response?.other?.data && Array.isArray(response.other.data)) {
          eventsData = response.other.data;
        }

        // Fallback: Recursive helper to find any array of objects that look like events
        if (eventsData.length === 0) {
          const findEventsInObject = (obj, depth = 0) => {
            if (!obj || depth > 5) return null; // Avoid circular/too deep

            // If this object itself is an array of events
            if (Array.isArray(obj)) {
              if (obj.length === 0) return obj; // Empty array might be it
              // Check if first item looks like an event (has ID or title/name)
              const first = obj[0];
              if (first && typeof first === 'object' && (first.id !== undefined || first.title || first.name || first.event_name)) {
                return obj;
              }
              return null;
            }

            if (typeof obj === 'object') {
              // 1. Check common keys first for efficiency
              const commonKeys = ['data', 'events', 'results', 'payload'];
              for (const key of commonKeys) {
                if (obj[key]) {
                  const found = findEventsInObject(obj[key], depth + 1);
                  if (found) return found;
                }
              }

              // 2. Check all other keys
              for (const key in obj) {
                if (!commonKeys.includes(key) && Object.prototype.hasOwnProperty.call(obj, key)) {
                  const found = findEventsInObject(obj[key], depth + 1);
                  if (found) return found;
                }
              }

              // 3. Fallback: Treat object values as a list (associative array case)
              const values = Object.values(obj);
              const meaningfulObjects = values.filter(v =>
                v && typeof v === 'object' && (v.id !== undefined || v.title || v.name)
              );
              if (meaningfulObjects.length > 0 && meaningfulObjects.length > 2) {
                return meaningfulObjects;
              }
            }

            return null;
          };

          const found = findEventsInObject(response);
          if (found) eventsData = found;
        }

        const formattedEvents = eventsData.map(ev => ({
          ...ev, // Spread all original properties first
          id: ev.id,
          title: ev.name || ev.title || "Untitled Event",
          date: ev.date || "Date TBA",
          location: ev.location || ev.venue || "Location TBA",
          image: ev.image || ev.image_url || ev.cover_image,
          categories: Array.isArray(ev.categories)
            ? ev.categories.map(c => (typeof c === 'object' ? c.name : c))
            : (typeof ev.category === 'string' ? [ev.category] : []),
          attendees: ev.attendees_count || ev.attendees || 0
        }));

        setEvents(formattedEvents);
      } catch (err) {
        // Failed to load events
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    loadEvents();
  }, []);

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

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Button
                text="Adjust interests"
                onClick={() => navigate("/select-interests", { state: { mode: "edit" } })}
              />
              <UserProfileIcon />
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">


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
                {filteredEvents.map((event, index) => (
                  <EventCard key={event.id || `event-${index}`} event={event} role='user' />
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