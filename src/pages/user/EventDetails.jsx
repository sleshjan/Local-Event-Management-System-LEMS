import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import Button from "../../components/common/Button";
import InterestTag from "../../components/common/InterestTag";
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
} from "lucide-react";

const EventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get event data from navigation state
  const event = location.state?.event;

  // Get user interests from localStorage
  const [userInterests, setUserInterests] = useState([]);

  useEffect(() => {
    const storedInterests = localStorage.getItem("userInterests");
    if (storedInterests) {
      setUserInterests(JSON.parse(storedInterests));
    }
  }, []);

  // Redirect if no event data
  useEffect(() => {
    if (!event) {
      navigate("/dashboard");
    }
  }, [event, navigate]);

  if (!event) {
    return null;
  }

  const handleJoinEvent = () => {
    console.log("Joining event:", event.id);
    alert(`You've joined: ${event.title}!`);
    // In real app, call API to register user for event
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
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium hidden sm:inline">
                Back to Events
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Event Image */}
            <div className="w-full h-64 sm:h-96 bg-gray-200 rounded-3xl overflow-hidden mb-8">
              {event.image ? (
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
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
                      </div>
                    </div>
                  )}

                  {/* Attendees */}
                  {event.attendees !== undefined && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">Attendees</p>
                        <p className="text-sm text-gray-600">
                          {event.attendees}{" "}
                          {event.attendees === 1 ? "person" : "people"}{" "}
                          attending
                        </p>
                        {event.maxParticipants && (
                          <p className="text-sm text-gray-500">
                            {event.maxParticipants - event.attendees} spots left
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
                            : `$${event.price}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="border-t border-gray-200"></div>

                  {/* Join Button */}
                  <Button
                    text="Join Event"
                    onClick={handleJoinEvent}
                    fullWidth
                  />

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Event link copied to clipboard!");
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
