import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import SearchInput from "../../components/common/SearchInput";
import EventCard from "../../components/events/EventCard";
import Button from "../../components/common/Button";
import { Menu, X, Filter } from "lucide-react";
import { userService } from "../../services/userService";
import { eventService } from "../../services/eventService";
import { categoryService } from "../../services/categoryService";
import UserProfileIcon from "../../components/common/UserProfileIcon";
import EventFilters from "../../components/events/EventFilters";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);

  // Get user interests from backend
  const [userInterests, setUserInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState([]);
  const [activeFilters, setActiveFilters] = useState({
    categories: [],
    status: 'all',
    dateRange: { start: '', end: '', preset: 'all' },
    price: { free: false, min: 0, max: 10000 },
    nearMe: { enabled: false, radius: 5, userLocation: null }
  });

  // Robust event data extractor helper
  const findEventsInObject = (obj, depth = 0) => {
    if (!obj || depth > 5) return null;
    if (Array.isArray(obj)) {
      if (obj.length === 0) return obj;
      const first = obj[0];
      if (first && typeof first === 'object' && (first.id !== undefined || first.title || first.name || first.event_name)) {
        return obj;
      }
      return null;
    }
    if (typeof obj === 'object') {
      const commonKeys = ['data', 'events', 'results', 'payload'];
      for (const key of commonKeys) {
        if (obj[key]) {
          const found = findEventsInObject(obj[key], depth + 1);
          if (found) return found;
        }
      }
      for (const key in obj) {
        if (!commonKeys.includes(key) && Object.prototype.hasOwnProperty.call(obj, key)) {
          const found = findEventsInObject(obj[key], depth + 1);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const fetchEvents = async (filtersToUse) => {
    setLoading(true);
    let response;
    try {
      // 1. "Near Me" Filter (Priority)
      if (filtersToUse.nearMe.enabled && filtersToUse.nearMe.userLocation) {
        response = await eventService.getNearbyEvents({
          latitude: filtersToUse.nearMe.userLocation.lat,
          longitude: filtersToUse.nearMe.userLocation.lng,
          radius: filtersToUse.nearMe.radius
        });
      }
      // 2. Single Category Filter (Use API if possible)
      else if (filtersToUse.categories.length === 1) {
        // We need to find the slug for the selected category ID
        // Note: categories state might be empty on first render, but this branch 
        // is only taken when user applies a filter, by which time categories should be loaded.
        const catId = filtersToUse.categories[0];
        const category = categories.find(c => c.id === catId);

        if (category && category.slug) {
          response = await eventService.getEventsByCategory(category.slug);
        } else {
          // Fallback to all events if slug not found
          response = await eventService.getAllEvents();
        }
      }
      // 3. Price Filter (Server-side)
      else if (filtersToUse.price.free || filtersToUse.price.min > 0 || filtersToUse.price.max < 10000) {
        let min = filtersToUse.price.min;
        let max = filtersToUse.price.max;

        if (filtersToUse.price.free) {
          min = 0;
          max = 0;
        }

        response = await eventService.getEventsByPrice(min, max);
      }
      // 4. All Events (Default or Multi-category)
      else {
        response = await eventService.getAllEvents();
      }

      // Extract events
      let eventsData = [];

      // Robust extraction based on browser trace: { data: { recommended: [], other: { data: [...] } } }
      const dataObj = response?.data || response;

      if (dataObj) {
        // 1. Collect Recommended (if non-empty)
        const recommended = dataObj.recommended && Array.isArray(dataObj.recommended) ? dataObj.recommended : [];

        // 2. Collect Other/Standard (checking various nesting levels)
        let other = [];
        if (dataObj.other?.data && Array.isArray(dataObj.other.data)) {
          other = dataObj.other.data;
        } else if (dataObj.other && Array.isArray(dataObj.other)) {
          other = dataObj.other;
        } else if (dataObj.data && Array.isArray(dataObj.data)) {
          other = dataObj.data;
        } else if (Array.isArray(dataObj)) {
          other = dataObj;
        }

        // 3. Combine
        eventsData = [...recommended, ...other];

        // 4. Fallback if still empty
        if (eventsData.length === 0) {
          const found = findEventsInObject(response);
          if (found) eventsData = found;
        }
      }

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

      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to fetch events", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const profile = await userService.getProfile();
        const interests = profile.interests || profile.data?.interests || [];
        setUserInterests(interests);
      } catch (err) { console.error(err); }
    };

    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories({ per_page: 100 });
        const categoriesData = response.data?.data || response.data || response || [];
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } catch (err) { console.error(err); }
    };

    loadProfile();
    loadCategories();
    fetchEvents(activeFilters);
  }, []);

  const handleApplyFilters = (newFilters) => {
    setActiveFilters(newFilters);
    fetchEvents(newFilters);
  };

  // Helper to calculate relevance score
  const calculateRelevance = (event) => {
    if (!userInterests || userInterests.length === 0) return 0;

    const eventCategories = event.categories || [];
    if (eventCategories.length === 0) return 0.05;

    // Helper to normalize category name to slug consistently
    const normalizeSlug = (str) =>
      (typeof str === 'string' ? str : '')
        .toLowerCase()
        .replace(/[&\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');

    // Check for exact matches only (Score: 1.0 for match)
    let maxRelatedness = 0;

    eventCategories.forEach(eventCat => {
      const eventSlug = normalizeSlug(eventCat);

      userInterests.forEach(interest => {
        const interestName = typeof interest === 'object' ? interest.name : interest;
        const interestSlug = typeof interest === 'object'
          ? (interest.slug || normalizeSlug(interest.name))
          : normalizeSlug(interest);

        // Exact Name/Slug Match (Score: 1.0)
        if (eventCat.toLowerCase() === interestName.toLowerCase() || eventSlug === interestSlug) {
          maxRelatedness = 1.0;
        }
      });
    });

    return maxRelatedness || 0.05; // Default low score
  };



  // Combined Filter, Search, Relevance and Sort Logic
  const getProcessedEvents = () => {
    // 1. Initial Filter (Search + Advanced Filters)
    const filtered = events.filter(event => {
      // Search Query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.location?.toLowerCase().includes(query) ||
          (event.categories || []).some(cat =>
            (typeof cat === 'string' ? cat : cat.name || '').toLowerCase().includes(query)
          );
        if (!matchesSearch) return false;
      }

      // Category Filter (Robust ID vs Name matching)
      if (activeFilters.categories.length > 0) {
        const eventCats = event.categories || [];

        // Map active IDs to Names
        const activeNames = activeFilters.categories.map(id => {
          const c = categories.find(cat => cat.id === id);
          return c ? c.name : null;
        }).filter(Boolean);

        const matchesCategory = eventCats.some(catName =>
          activeNames.some(activeName =>
            activeName.toLowerCase() === (typeof catName === 'string' ? catName : catName.name).toLowerCase()
          )
        );

        if (!matchesCategory) return false;
      }

      // Status Filter
      if (activeFilters.status !== 'all') {
        const now = new Date();
        const startRaw = event.start_datetime || event.date;
        const endRaw = event.end_datetime || event.date;

        const start = startRaw ? new Date(startRaw) : null;
        const end = endRaw ? new Date(endRaw) : null;

        // If dates are invalid, allow them to pass the status filter rather than hiding them
        if (!start || isNaN(start.getTime()) || !end || isNaN(end.getTime())) return true;

        if (activeFilters.status === 'upcoming' && start <= now) return false;
        if (activeFilters.status === 'ongoing' && (start > now || end < now)) return false;
        if (activeFilters.status === 'past' && end >= now) return false;
      }

      // Date Range Filter
      if (activeFilters.dateRange.start || activeFilters.dateRange.end) {
        const eventDate = new Date(event.start_datetime);
        const start = activeFilters.dateRange.start ? new Date(activeFilters.dateRange.start) : null;
        const end = activeFilters.dateRange.end ? new Date(activeFilters.dateRange.end) : null;

        if (end) end.setHours(23, 59, 59);

        if (start && eventDate < start) return false;
        if (end && eventDate > end) return false;
      }

      // Price Filter
      // Skip strict client-side filter if we already fetched using the Price API
      // This allows the server response to be trusted even if it includes edge cases
      const isPriceFetch = !activeFilters.nearMe.enabled && activeFilters.categories.length !== 1 &&
        (activeFilters.price.free || activeFilters.price.min > 0 || activeFilters.price.max < 10000);

      if (!isPriceFetch) {
        const price = parseFloat(event.seat_price || event.price || 0);
        if (activeFilters.price.free && price > 0) return false;
        if (price < activeFilters.price.min || price > activeFilters.price.max) return false;
      }

      return true;
    });

    // 2. Map Relevance Score & Sort
    return filtered
      .map(event => ({
        ...event,
        relevanceScore: calculateRelevance(event)
      }))
      .sort((a, b) => {
        // Prioritize relevance score
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        // Then by date (newest first for same relevance)
        return new Date(b.date || b.start_datetime) - new Date(a.date || a.start_datetime);
      });
  };

  const filteredEvents = getProcessedEvents();
  const activeFilterCount =
    activeFilters.categories.length +
    (activeFilters.status !== 'all' ? 1 : 0) +
    (activeFilters.dateRange.start || activeFilters.dateRange.end ? 1 : 0) +
    (activeFilters.price.free || activeFilters.price.min > 0 || activeFilters.price.max < 10000 ? 1 : 0) +
    (activeFilters.nearMe.enabled ? 1 : 0);

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
          <div className="flex flex-col gap-4">

            <div className="flex items-center justify-between gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Search Bar & Filter */}
              <div className="flex-1 flex gap-4 max-w-6xl">
                <SearchInput
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <button
                  onClick={() => setShowFilters(true)}
                  className={`relative px-6 py-3.5 rounded-xl border transition-all flex items-center gap-3 ${activeFilterCount > 0
                    ? 'bg-purple-50 border-purple-200 text-purple-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline font-semibold">Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center border-2 border-white">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-2">
                {localStorage.getItem('token') ? (
                  <>
                    <Button
                      text="Adjust Interests"
                      onClick={() => navigate("/select-interests", { state: { mode: "edit" } })}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-xl shadow-md transition-all transform hover:scale-105 hidden sm:block"
                    />
                    <UserProfileIcon />
                  </>
                ) : (
                  <Button
                    text="Login"
                    onClick={() => navigate("/login")}
                    className="bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 font-medium py-2 px-4 rounded-xl transition-all"
                  />
                )}
              </div>
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                {activeFilters.nearMe.enabled && (
                  <div className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-green-100">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Near Me ({activeFilters.nearMe.radius}km)
                    <span className="text-xs opacity-75">
                      [{activeFilters.nearMe.userLocation?.lat?.toFixed(4)}, {activeFilters.nearMe.userLocation?.lng?.toFixed(4)}]
                    </span>
                  </div>
                )}
                {activeFilters.categories.length > 0 && (
                  <div className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100">
                    {activeFilters.categories.length} Categories
                  </div>
                )}
                {activeFilters.status !== 'all' && (
                  <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-100 capitalize">
                    {activeFilters.status}
                  </div>
                )}
                {activeFilters.price.free && (
                  <div className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-100">
                    Free Only
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative">

            {/* Tailored Message */}
            {localStorage.getItem('token') && (
              <p className="text-sm text-gray-600 mb-6">
                Tailored by your interests
              </p>
            )}

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {localStorage.getItem('token') ? "Recommended for you" : "All Events"}
              </h2>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                See all
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading ? (
                <div className="col-span-full flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <EventCard key={event.id || `event-${index}`} event={event} role='user' />
                ))
              ) : (
                <div className="col-span-full py-12 text-center text-gray-500">
                  {searchQuery || activeFilterCount > 0
                    ? "No events match your search or filters."
                    : "No events available at the moment."}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <EventFilters
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        categories={categories}
        currentFilters={activeFilters}
      />
    </div>
  );
};

export default UserDashboard;