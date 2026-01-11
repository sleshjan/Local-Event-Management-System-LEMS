import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import InterestTag from "../../components/common/InterestTag";
import RegistrationModal from "../../components/events/RegistrationModal";
import CancellationModal from "../../components/events/CancellationModal";
import { eventService } from "../../services/eventService";
import { userService } from "../../services/userService";
import { categoryService } from "../../services/categoryService";
import EventCard from "../../components/events/EventCard";
import { parseApiError } from "../../services/api";
import { useToast } from "../../context/ToastContext";
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
  Mail,
  Phone,
} from "lucide-react";

import { normalizeEventData } from '../../utils/eventUtils';
import { getImageUrl } from '../../services/api';
import EventFeedback from '../../components/events/EventFeedback';

const EventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const { showToast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // User specific state
  const [userInterests, setUserInterests] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [similarEvents, setSimilarEvents] = useState([]);
  const [categoryRelations, setCategoryRelations] = useState([]);

  // Registration State
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [registrationLoading, setRegistrationLoading] = useState(false);

  // Cancellation State
  const [registrationId, setRegistrationId] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationLoading, setCancellationLoading] = useState(false);

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
      // Need event ID and token to check
      const token = localStorage.getItem('token');
      // Prioritize numeric ID from event object or location state, fall back to slug only if it's likely an ID
      const currentEventId = event?.id || locationStateEvent?.id || (slug && !isNaN(slug) ? slug : null);

      if (!currentEventId || !token) return;

      try {
        const registrations = await eventService.getMyRegistrations();

        let myRegs = [];
        if (Array.isArray(registrations)) {
          myRegs = registrations;
        } else if (registrations && Array.isArray(registrations.data)) {
          myRegs = registrations.data;
        } else if (registrations?.data && Array.isArray(registrations.data.data)) {
          myRegs = registrations.data.data;
        }

        // Check if any registration matches this event
        const matchingReg = myRegs.find(reg => {
          // Registration object might have event_id or nested event object
          const regEventId = reg.event_id || (reg.event && reg.event.id);
          return parseInt(regEventId) === parseInt(currentEventId);
        });

        if (matchingReg) {
          setIsRegistered(true);
          setRegistrationId(matchingReg.id);

          // Check if ticket is generated from API logic
          if (matchingReg.is_ticket_generated || matchingReg.ticket_generated) {
            localStorage.setItem(`ticket_accessed_${matchingReg.id}`, 'true');
          }
        } else {
          setIsRegistered(false);
          setRegistrationId(null);
        }
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

    const loadSimilarEvents = async () => {
      try {
        // Fetch all events using robust extraction
        const eventsResponse = await eventService.getAllEvents();
        let eventsData = [];

        // Recursive helper to find any array of objects that look like events (from UserDashboard.jsx)
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
            const commonKeys = ['data', 'other', 'events', 'results'];
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

        const found = findEventsInObject(eventsResponse);
        if (found) eventsData = found;

        const formattedEvents = eventsData.map(normalizeEventData);

        // Current event categories (normalized slugs)
        if (event) {
          const normalizeSlug = (str) =>
            (typeof str === 'string' ? str : '')
              .toLowerCase()
              .replace(/[&\s]+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-+|-+$/g, '');

          const currentSlugs = (event.categories || []).map(normalizeSlug);

          const scored = formattedEvents
            .filter(e => e.id !== event.id) // Exclude self
            .map(e => {
              let maxScore = 0;
              const eSlugs = (e.categories || []).map(normalizeSlug);

              eSlugs.forEach(eSlug => {
                currentSlugs.forEach(cSlug => {
                  if (eSlug === cSlug) {
                    maxScore = 1.0;
                  }
                });
              });

              return { ...e, similarity: maxScore };
            })
            .filter(e => e.similarity > 0) // Only exact matches
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 3); // Top 3

          setSimilarEvents(scored);
        }
      } catch (err) {
        console.error("Failed to load similar events", err);
      }
    };

    if (event) {
      loadSimilarEvents();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, navigate, event?.id]);

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
      showToast("Please login to join events.", "info");
      navigate('/login');
      return;
    }

    const userData = currentUser.data || currentUser; // Handle potential structure diffs

    const isEmailVerified = userData.email_verified_at || userData.is_email_verified;

    if (!isEmailVerified) {
      showToast("You need a verified email for registration. Verification email has been sent. Please check your Gmail to verify.", "info");
      // navigate('/profile'); // Removed redirection as per request
      return;
    }

    setShowRegisterModal(true);
  };

  const handleRegister = async (registrationData) => {
    setRegistrationLoading(true);
    try {
      await eventService.registerForEvent(registrationData);
      showToast(`Successfully registered for: ${event.title}!`, "success");
      setShowRegisterModal(false);

      // Refresh event data to update attendees count
      await fetchEvent();

    } catch (error) {
      showToast(parseApiError(error), "error");
    } finally {
      setRegistrationLoading(false);
    }
  };

  const handleConfirmCancellation = async (data) => {
    if (!registrationId) return;

    setCancellationLoading(true);
    try {
      await eventService.cancelRegistration(registrationId, data);
      showToast("Registration cancelled successfully.", "success");
      setIsRegistered(false);
      setRegistrationId(null);
      setShowCancelModal(false);
      // Refresh event data to update attendees count
      await fetchEvent();
    } catch (error) {
      showToast(parseApiError(error), "error");
    } finally {
      setCancellationLoading(false);
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
  const isEventUpcoming = event.status === 'Upcoming';
  // Use strict equality for 0 to handle potential string "0" from API
  const isFree = event.price === 0 || event.price === "0" || event.price === null;
  const isEventFull = event.maxParticipants && (event.attendees >= event.maxParticipants);

  // Check local storage for ticket access if registered
  const isTicketAccessed = registrationId && localStorage.getItem(`ticket_accessed_${registrationId}`) === 'true';

  let buttonText = isFree ? "Register" : "Buy Ticket";
  let buttonAction = handleJoinClick;
  let isActionDisabled = false;
  let buttonColorClass = "bg-purple-600 text-white hover:bg-purple-700";

  // Logic Flow
  if (isRegistered) {
    if (isTicketAccessed) {
      buttonText = "Ticket Accessed - Cannot Cancel";
      isActionDisabled = true;
      buttonColorClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
    } else if (!isEventUpcoming) {
      // Can't cancel past/active events typically? or stick to strict "Upcoming" rule
      buttonText = "Cannot Cancel (Event Started/Ended)";
      isActionDisabled = true;
      buttonColorClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
    } else {
      buttonText = "Cancel Registration";
      buttonAction = () => setShowCancelModal(true);
      buttonColorClass = "bg-red-600 text-white hover:bg-red-700";
    }
  } else {
    // Not registered
    if (!isEventUpcoming) {
      buttonText = "Event Not Available";
      if (event.status === 'Ongoing') buttonText = "Event Ongoing";
      if (event.status === 'Cancelled') buttonText = "Event Cancelled";
      if (isEventEnded) buttonText = "Event Ended";
      isActionDisabled = true;
      buttonColorClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
    } else if (isEventFull) {
      buttonText = "Event Full";
      isActionDisabled = true;
      buttonColorClass = "bg-gray-300 text-gray-500 cursor-not-allowed";
    }
    // Else default state (Register/Buy)
  }

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
                  crossOrigin="anonymous"
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
                    <div
                      className="text-gray-700 leading-relaxed prose prose-purple max-w-none"
                      dangerouslySetInnerHTML={{ __html: event.description }}
                    />
                  </div>
                )}

                {/* Organizer Info */}
                {event.organizer && (
                  <div className="bg-purple-50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Organized By
                    </h2>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-3xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                        {event.organizerImage ? (
                          <img
                            src={getImageUrl(event.organizerImage)}
                            alt={typeof event.organizer === 'object' ? event.organizer.name : event.organizer}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                          />
                        ) : null}
                        <div className={`w-full h-full bg-purple-600 flex items-center justify-center ${event.organizerImage ? 'hidden' : 'flex'}`}>
                          <UserIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {typeof event.organizer === 'object' ? event.organizer.name : event.organizer}
                        </p>
                        <div className="flex flex-col gap-1 mt-1 text-sm text-gray-600">
                          {event.organizerEmail && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3.5 h-3.5" />
                              <a href={`mailto:${event.organizerEmail}`} className="hover:text-purple-600 transition-colors">
                                {event.organizerEmail}
                              </a>
                            </div>
                          )}
                          {event.organizerPhone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-3.5 h-3.5" />
                              <a href={`tel:${event.organizerPhone}`} className="hover:text-purple-600 transition-colors">
                                {event.organizerPhone}
                              </a>
                            </div>
                          )}
                        </div>
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
                      onClick={buttonAction}
                      disabled={isActionDisabled}
                      className={`w-full px-6 py-3 font-medium rounded-xl transition-colors flex items-center justify-center gap-2
                        ${buttonColorClass}
                      `}
                    >
                      {buttonText}
                    </button>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast("Event link copied to clipboard!", "success");
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

            {/* Event Feedback Section - Only for completed events where user is registered */}
            {event && isRegistered && new Date(event.fullEndDate || event.end_datetime) < new Date() && (
              <div className="mt-12 border-t border-gray-100 pt-12">
                <EventFeedback eventId={event.id} eventName={event.title} />
              </div>
            )}

            {/* Similar Events Section */}
            {similarEvents.length > 0 && (
              <div className="mt-16 border-t border-gray-100 pt-12">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Similar Events You Might Like</h2>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                  >
                    View All
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarEvents.map((similarEvent) => (
                    <EventCard
                      key={similarEvent.id}
                      event={similarEvent}
                      role="user"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <RegistrationModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        event={event}
        loading={registrationLoading}
        onConfirm={handleRegister}
      />

      <CancellationModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancellation}
        loading={cancellationLoading}
      />
    </div>
  );
};

export default EventDetails;