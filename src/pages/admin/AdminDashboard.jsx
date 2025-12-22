import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import SearchInput from "../../components/common/SearchInput";
import EventCard from "../../components/events/EventCard";
import Button from "../../components/common/Button";
import { Menu, X, Plus } from "lucide-react";
import { eventService } from "../../services/eventService";
import UserProfileIcon from "../../components/common/UserProfileIcon";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
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

        // Priority 2: Standard paths
        if (eventsData.length === 0) {
          const possibleArrays = [
            response,
            response?.data,
            response?.data?.data,
            response?.data?.events,
            response?.events,
            response?.results
          ];

          for (const data of possibleArrays) {
            if (Array.isArray(data)) {
              eventsData = data;
              break;
            }
          }
        }

        // Priority 3: Deep recursive search
        if (eventsData.length === 0) {
          const findEventsInObject = (obj, depth = 0) => {
            if (!obj || depth > 5) return null;
            if (Array.isArray(obj)) {
              if (obj.length === 0) return obj;
              const first = obj[0];
              if (first && typeof first === 'object' && (first.id !== undefined || first.title || first.name)) {
                return obj;
              }
              return null;
            }
            if (typeof obj === 'object') {
              for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                  const found = findEventsInObject(obj[key], depth + 1);
                  if (found) return found;
                }
              }
            }
            return null;
          };
          const found = findEventsInObject(response);
          if (found) eventsData = found;
        }

        // Map backend data to EventCard props
        const formattedEvents = eventsData.map(ev => ({
          ...ev,
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
        const validEvents = (formattedEvents || []).filter(e => e && (e.id || e.title));
        setEvents(validEvents);
      } catch (error) {
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
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
        <AdminSidebar />
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
              <AdminSidebar />
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
                placeholder="Search events, locations, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <button
                  onClick={() => navigate("/admin/create-event")}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Create
                </button>
              </div>
              <UserProfileIcon />
            </div>
          </div>

          {/* Mobile Create Event Button */}
          <div className="sm:hidden mt-3">
            <button
              onClick={() => navigate("/admin/create-event")}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-6 py-4 sm:py-6">
            {/* Stats Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Total Events</p>
                <p className="text-2xl font-bold text-gray-900">
                  {events.length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Active Events</p>
                <p className="text-2xl font-bold text-purple-600">
                  {events.length}
                </p>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wider font-semibold">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  0
                </p>
              </div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                All Events
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {filteredEvents.length}{" "}
                  {filteredEvents.length === 1 ? "event" : "events"}
                </span>
              </div>
            </div>

            {/* Events Grid - 3 columns on desktop */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.map((event, index) => (
                  <EventCard
                    key={event.id || `admin-event-${index}`}
                    event={event}
                    role="admin"
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  No events found matching "{searchQuery}"
                </p>
                <Button
                  text="Clear Search"
                  onClick={() => setSearchQuery("")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
