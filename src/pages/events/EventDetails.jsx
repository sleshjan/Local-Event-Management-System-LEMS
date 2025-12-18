import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { eventService } from '../../services/eventService';
import Sidebar from '../../components/common/Sidebar';
import Button from '../../components/common/Button';
import InterestTag from '../../components/common/InterestTag';
import { Menu, X, Calendar, MapPin, Users, Clock, DollarSign, User as UserIcon, ArrowLeft } from 'lucide-react';


import { userService } from '../../services/userService';
import { normalizeEventData } from '../../utils/eventUtils';
import { getImageUrl } from '../../services/api';

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  // Get event data from navigation state if available (for instant load)
  const locationStateEvent = location.state?.event;

  // Get user interests from backend (same as Dashboard)
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        // Handle potentially different response structures
        const interests = profile.interests || profile.data?.interests || [];
        setUserInterests(interests);
      } catch (err) {
        // Sidebar profile error
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadEvent = async () => {
      // If we have initial data passed from navigation, use it first
      if (locationStateEvent) {
        setEventData(normalizeEventData(locationStateEvent));
        setLoading(false);
      }

      // If we have an ID, fetch the latest data
      const eventId = id || locationStateEvent?.id;

      if (eventId && eventId !== 'undefined') {
        try {
          const response = await eventService.getEvent(eventId);
          const freshData = response.data || response;
          // Normalize the fresh data to match dashboard format
          setEventData(normalizeEventData(freshData));
          setLoading(false);
        } catch (error) {
          // Event error
          if (!locationStateEvent) {
            // Optional: Handle 404/422 explicitly
            // navigate('/dashboard');
          }
        }
      } else if (!locationStateEvent) {
        // No ID found at all
        navigate('/dashboard');
      }
    };

    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  if (loading && !eventData) {
    return <div className="p-10 text-center">Loading event details...</div>;
  }

  if (!eventData) {
    return null;
  }

  const handleJoinEvent = async () => {
    if (joining) return;

    // Check if user is logged in
    const currentUser = userService.getProfile ? (await userService.getProfile()) : JSON.parse(localStorage.getItem('user'));

    if (!currentUser) {
      alert("Please login to join events.");
      navigate('/login');
      return;
    }

    // Check Email Verification
    // Need to ensure we have the latest user data, so we fetched it above or rely on what we have.
    // The previous line fetches profile which returns data.data or data.
    const userData = currentUser.data || currentUser;

    if (!userData.email_verified_at) {
      alert("Your email must be verified to join events. Please go to your profile settings to verify your email.");
      return;
    }

    setJoining(true);
    try {
      await eventService.registerForEvent(eventData.id);
      alert(`Successfully joined: ${eventData.title}!`);
      // Optimistically update UI or fully reload data
      // For now, let's reload to be safe
      const response = await eventService.getEvent(eventData.id);
      setEventData(normalizeEventData(response.data || response));
    } catch (error) {
      alert(error.message || "Failed to join event");
    } finally {
      setJoining(false);
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
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">Back to Events</span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Event Image */}
            <div className="w-full h-64 sm:h-96 bg-gray-200 rounded-3xl overflow-hidden mb-8">
              {eventData.image ? (
                <img
                  src={getImageUrl(eventData.image)}
                  alt={eventData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-gray-500">No Image</span>
                </div>
              )}
            </div>

            {/* Event Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Info */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {eventData.categories && eventData.categories.map((category, index) => (
                      <InterestTag key={index} text={category} />
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {eventData.title}
                  </h1>
                </div>

                {eventData.description && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">About This Event</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {eventData.description}
                    </p>
                  </div>
                )}

                {eventData.organizer && (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Organized By</h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{eventData.organizer}</p>
                        {eventData.organizerBio && (
                          <p className="text-sm text-gray-600">{eventData.organizerBio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Event Details Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">Event Details</h2>

                  {eventData.date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Date & Time</p>
                        <p className="text-sm text-gray-600">{eventData.date}</p>
                        {eventData.time && (
                          <p className="text-sm text-gray-600">{eventData.time}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {eventData.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{eventData.location}</p>
                      </div>
                    </div>
                  )}

                  {eventData.attendees !== undefined && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Attendees</p>
                        <p className="text-sm text-gray-600">
                          {eventData.attendees} {eventData.attendees === 1 ? 'person' : 'people'} attending
                        </p>
                        {eventData.maxParticipants && (
                          <p className="text-sm text-gray-500">
                            {eventData.maxParticipants - eventData.attendees} spots left
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {eventData.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">{eventData.duration}</p>
                      </div>
                    </div>
                  )}

                  {eventData.price !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Price</p>
                        <p className="text-sm text-gray-600">
                          {eventData.price === 0 || eventData.price === '0' ? 'Free' : `$${eventData.price}`}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-200"></div>

                  <Button
                    text={joining ? "Joining..." : "Join Event"}
                    onClick={handleJoinEvent}
                    fullWidth
                    disabled={joining}
                  />

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Event link copied to clipboard!');
                    }}
                    className="w-full px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Share Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;