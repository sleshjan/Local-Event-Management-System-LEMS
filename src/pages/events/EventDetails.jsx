import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import InterestTag from "../../components/common/InterestTag";
import RegistrationModal from "../../components/events/RegistrationModal";
import { eventService } from "../../services/eventService";
import { userService } from "../../services/userService";
import { parseApiError } from "../../services/api";
import {
  Menu,
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  DollarSign,
  User as UserIcon,
  ArrowLeft,
  Share2,
} from "lucide-react";

import { normalizeEventData } from '../../utils/eventUtils';
import { getImageUrl } from '../../services/api';

const EventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // User specific state
  const [userInterests, setUserInterests] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);

  // Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Get event data from navigation state if available
  const locationStateEvent = location.state?.event;

  // Fetch User Interests for Sidebar (User View Specific)
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await userService.getProfile();
        const interests = profile.interests || profile.data?.interests || [];
        setUserInterests(interests);
      } catch (err) {
        // User might not be logged in, ignoring
      }
    };

    const checkRegistration = async () => {
      // Need event ID to check
      const currentEventId = slug || locationStateEvent?.id || event?.id;
      if (!currentEventId) return;

      try {
        const registrations = await eventService.getMyRegistrations();

        let myRegs = [];
        if (Array.isArray(registrations)) {
          myRegs = registrations;
        } else if (registrations && Array.isArray(registrations.data)) {
          myRegs = registrations.data;
        }

        // Check if any registration matches this event
        const alreadyJoined = myRegs.some(reg => {
          // Registration object might have event_id or nested event object
          const regEventId = reg.event_id || (reg.event && reg.event.id);
          return parseInt(regEventId) === parseInt(currentEventId);
        });

        setIsRegistered(alreadyJoined);
      } catch (e) {
        console.error("Failed to check registration status", e);
      }
    };

    loadProfile();
    checkRegistration();
  }, [slug, event?.id]);

  const fetchEvent = async () => {
    if (locationStateEvent && !event) {
      setEvent(normalizeEventData(locationStateEvent));
      setLoading(false);
    }

    // Fetch by slug (or id if passed as slug param)
    const fetchIdentifier = slug || locationStateEvent?.slug || locationStateEvent?.id || event?.id;

    if (fetchIdentifier && fetchIdentifier !== 'undefined') {
      try {
        const response = await eventService.getEvent(fetchIdentifier);
        const freshData = response.data || response;
        setEvent(normalizeEventData(freshData));
        setLoading(false);
      } catch (error) {
        if (!locationStateEvent) {
          console.error("Event not found");
        }
      }
    } else if (!locationStateEvent) {
      navigate("/dashboard");
    }
  };

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, navigate]);

  const handleJoinClick = async () => {
    // Check if user is logged in
    let currentUser = null;
    try {
      currentUser = await userService.getProfile();
    } catch (e) {
      const local = localStorage.getItem('user');
      if (local) currentUser = JSON.parse(local);
    }

    if (!currentUser) {
      alert("Please login to join events.");
      navigate('/login');
      return;
    }

    const userData = currentUser.data || currentUser; // Handle potential structure diffs

    const isEmailVerified = userData.email_verified_at || userData.is_email_verified;
    const isPhoneVerified = userData.phone_verified_at || userData.is_phone_verified;

    if (!isEmailVerified || !isPhoneVerified) {
      alert("Both Email and Phone must be verified to join events. Please go to your profile settings to verify them.");
      return;
    }

    setShowRegisterModal(true);
  };

  const handleRegister = async (registrationData) => {
    setRegistrationLoading(true);
    try {
      await eventService.registerForEvent(registrationData);
      alert(`Successfully registered for: ${event.title}!`);
      setShowRegisterModal(false);

      // Refresh event data to update attendees count
      await fetchEvent();

    } catch (error) {
      alert(parseApiError(error));
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (loading && !event) {
    return <div className="p-10 text-center">Loading event details...</div>;
  }

  if (!event) return null;

  // Determine button state
  const isEventEnded = event.status === 'Past' || event.status === 'Completed';
  const isEventFull = event.maxParticipants && (event.attendees >= event.maxParticipants);
  const isRegisterDisabled = isEventEnded || isEventFull || isRegistered;

  let buttonText = "Register";
  if (event.price > 0) buttonText = "Buy Ticket";
  if (isEventFull) buttonText = "Event Full";
  if (isEventEnded) buttonText = "Event Ended";
  if (isRegistered) buttonText = "Already Registered";

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
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium hidden sm:inline">
                  Back to Events
                </span>
              </button>
            </div>

            {/* User Action Buttons (Empty in header for now, or could have Share) */}
            <div className="flex items-center gap-2">
              {/* Placeholder for header actions if needed */}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

            {/* Event Image */}
            <div className="w-full h-64 sm:h-96 bg-gray-200 rounded-3xl overflow-hidden mb-8">
              {event.image ? (
                <img
                  src={getImageUrl(event.image)}
                  alt={event.title}
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
                {/* Title and Categories */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {event.categories &&
                      event.categories.map((category, index) => (
                        <InterestTag key={index} text={category} />
                      ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                    {event.title}
                  </h1>
                </div>

                {/* Description */}
                {event.description && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      About This Event
                    </h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                      {event.description}
                    </p>
                  </div>
                )}

                {/* Organizer Info */}
                {event.organizer && (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Organized By
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {event.organizer}
                        </p>
                        {event.organizerBio && (
                          <p className="text-sm text-gray-600">
                            {event.organizerBio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Event Details Card */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 sticky top-6 space-y-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    Event Details
                  </h2>

                  {/* Date & Time */}
                  {event.date && (
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Date & Time</p>
                        <p className="text-sm text-gray-600">{event.date}</p>
                        {event.time && (
                          <p className="text-sm text-gray-600">{event.time}</p>
                        )}
                        {event.endDate && (
                          <div className="mt-1">
                            <p className="text-sm text-gray-600 font-medium">Ends:</p>
                            <p className="text-sm text-gray-600">
                              {event.endDate}
                            </p>
                            {event.endTime && (
                              <p className="text-sm text-gray-600">
                                {event.endTime}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Location</p>
                        <p className="text-sm text-gray-600">
                          {event.location}
                        </p>
                        {event.venue && (
                          <p className="text-sm text-gray-500">{event.venue}</p>
                        )}
                        {event.mapUrl && (
                          <a
                            href={event.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-semibold text-sm w-full justify-center group"
                          >
                            <MapPin className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            View on Map
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Attendees */}
                  {event.total_seat !== undefined && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Attendees</p>
                        <p className="text-sm text-gray-600">
                          {event.total_seat - event.remaining_seat}{" "}
                          {(event.total_seat - event.remaining_seat) === 1 ? "person" : "people"}{" "}
                          attending
                        </p>
                        {(event.remaining_seat !== undefined || (event.maxParticipants && event.maxParticipants > 0)) && (
                          <p className="text-sm text-gray-500">
                            {event.remaining_seat !== undefined
                              ? `${event.remaining_seat} spots left`
                              : `${event.maxParticipants - event.attendees} spots left`
                            }
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Duration */}
                  {event.duration && (
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Duration</p>
                        <p className="text-sm text-gray-600">
                          {event.duration}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price */}
                  {event.price !== undefined && (
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Price</p>
                        <p className="text-sm text-gray-600">
                          {event.price === 0 || event.price === "0"
                            ? "Free"
                            : `Rs. ${event.price}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* User Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleJoinClick}
                      disabled={isRegisterDisabled}
                      className={`w-full px-6 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2
                        ${isRegisterDisabled
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-purple-600 text-white hover:bg-purple-700"}
                      `}
                    >
                      {buttonText}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Event link copied to clipboard!");
                      }}
                      className="w-full px-6 py-3 bg-gray-50 text-gray-700 font-medium rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      Copy Event Link
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onConfirm={handleRegister}
        event={event}
        loading={registrationLoading}
      />
    </div>
  );
};

export default EventDetails;