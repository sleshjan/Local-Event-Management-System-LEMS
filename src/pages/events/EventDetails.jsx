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
  const { slug } = useParams();
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
      // If we have initial data (from link state), normalize and show it first
      if (locationStateEvent) {
        setEventData(normalizeEventData(locationStateEvent));
        setLoading(false);
      }

      // Identify what to fetch with: slug from URL, or slug/id from state
      const fetchIdentifier = slug || locationStateEvent?.slug || locationStateEvent?.id;

      if (fetchIdentifier && fetchIdentifier !== 'undefined') {
        try {
          // Use eventService.getEvent which calls /event/{id} (or /event/{slug})
          const response = await eventService.getEvent(fetchIdentifier);
          // Normalize the fresh data (handles data.other.data internally)
          const freshData = normalizeEventData(response);
          setEventData(freshData);
          setLoading(false);
        } catch (error) {
          // Fallback to location state if API fails, otherwise broken
          if (!locationStateEvent) {
            console.error("Failed to load event details");
          }
        }
      } else if (!locationStateEvent) {
        // No ID/Slug found at all
        navigate('/dashboard');
      }
    };

    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, navigate]);

  const handleJoinEvent = async () => {
    if (joining) return;

    // Check if user is logged in
    const currentUser = userService.getProfile ? (await userService.getProfile()) : JSON.parse(localStorage.getItem('user'));

    if (!currentUser) {
      alert("Please login to join events.");
      navigate('/login');
      return;
    }

    const userData = currentUser.data || currentUser;

    if (!userData.email_verified_at) {
      alert("Your email must be verified to join events. Please go to your profile settings to verify your email.");
      return;
    }

    setJoining(true);
    try {
      await eventService.registerForEvent(eventData.id);
      alert(`Successfully joined: ${eventData.title}!`);
      // Reload data
      const response = await eventService.getEvent(eventData.id);
      setEventData(normalizeEventData(response));
    } catch (error) {
      alert(error.message || "Failed to join event");
    } finally {
      setJoining(false);
    }
  };

  if (loading && !eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!eventData) return null;

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
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Navigation Bar */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between pointer-events-none">
          <div className="pointer-events-auto">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-full transition-all"
            >
              <Menu className="w-6 h-6 text-gray-700" />
            </button>
          </div>
          <div className="pointer-events-auto">
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-full transition-all text-sm font-medium text-gray-700 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              All Events
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Hero Section */}
          <div className="relative w-full h-[50vh] min-h-[400px]">
            {eventData.image ? (
              <img
                src={getImageUrl(eventData.image)}
                alt={eventData.title}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center">
                <Calendar className="w-24 h-24 text-white/20" />
              </div>
            )}
            {/* Fallback for Image Error */}
            <div className="hidden w-full h-full bg-gradient-to-br from-purple-800 to-indigo-900 absolute inset-0 items-center justify-center">
              <Calendar className="w-24 h-24 text-white/20" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-90"></div>

            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 lg:p-12 text-white">
              <div className="max-w-5xl mx-auto">
                <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-bottom-4 duration-500">
                  {eventData.categories && eventData.categories.map((category, index) => (
                    <span key={index} className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-sm font-medium border border-white/10">
                      {category}
                    </span>
                  ))}
                  {eventData.price === 0 && (
                    <span className="px-3 py-1 rounded-full bg-green-500/80 backdrop-blur-md text-sm font-bold shadow-lg">
                      FREE
                    </span>
                  )}
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight animate-in slide-in-from-bottom-6 duration-700">
                  {eventData.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-white/90 animate-in slide-in-from-bottom-8 duration-1000">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-300" />
                    <span className="text-lg">{eventData.date}</span>
                  </div>
                  <div className="hidden sm:block text-white/30">•</div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-300" />
                    <span className="text-lg">{eventData.time}</span>
                  </div>
                  <div className="hidden sm:block text-white/30">•</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-purple-300" />
                    <span className="text-lg">{eventData.venue ? `${eventData.venue}, ${eventData.location}` : eventData.location}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 pb-20">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Description & Organizer */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Description Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">About the Event</h2>
                    <div className="prose prose-purple max-w-none text-gray-600 leading-relaxed whitespace-pre-line">
                      {eventData.description}
                    </div>
                  </div>

                  {/* Organizer Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">Organizer</h2>
                    </div>
                    <div className="flex items-start gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-2xl flex items-center justify-center shrink-0 border border-purple-200">
                        <UserIcon className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{eventData.organizer}</h3>
                        {eventData.organizerBio ? (
                          <p className="text-gray-600 leading-relaxed">{eventData.organizerBio}</p>
                        ) : (
                          <p className="text-gray-400 italic">No bio available for this organizer.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ticket & Details */}
                <div className="lg:col-span-1 space-y-6">
                  {/* Action Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-xl border border-purple-100/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">Ticket Price</p>
                        <div className="flex items-baseline gap-1">
                          {eventData.price === 0 ? (
                            <span className="text-3xl font-bold text-gray-900">Free</span>
                          ) : (
                            <>
                              <span className="text-lg font-semibold text-gray-500 relative -top-2">$</span>
                              <span className="text-4xl font-bold text-gray-900">{eventData.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {eventData.maxParticipants > 0 && (
                        <div className="text-right">
                          <div className={`text-sm font-bold ${eventData.maxParticipants - eventData.attendees < 10 ? 'text-orange-500' : 'text-green-600'}`}>
                            {eventData.maxParticipants - eventData.attendees} spots left
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      text={joining ? "Processing..." : (eventData.price === 0 ? "Register for Free" : "Buy Ticket")}
                      onClick={handleJoinEvent}
                      fullWidth
                      disabled={joining}
                      className="h-14 text-lg shadow-lg shadow-purple-200"
                    />

                    <p className="text-center text-xs text-gray-400 mt-4">
                      Secure payment processing via Stripe
                    </p>
                  </div>

                  {/* Info Summary Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 space-y-5">
                    <h3 className="font-bold text-gray-900 text-lg">Event Information</h3>

                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Date</p>
                        <p className="text-sm text-gray-600">{eventData.date}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{eventData.time}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">{eventData.venue}</p>
                        {eventData.street && <p className="text-xs text-gray-500">{eventData.street}</p>}
                        <p className="text-xs text-gray-500">{eventData.location}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                      <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Participants</p>
                        <p className="text-sm text-gray-600">{eventData.attendees} attending</p>
                      </div>
                    </div>

                    {eventData.duration && (
                      <div className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                          <Clock className="w-5 h-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Duration</p>
                          <p className="text-sm text-gray-600">{eventData.duration}</p>
                        </div>
                      </div>
                    )}
                  </div>
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