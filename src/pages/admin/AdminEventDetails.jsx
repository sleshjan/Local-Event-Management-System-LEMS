import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import InterestTag from "../../components/common/InterestTag";
import { eventService } from "../../services/eventService";
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
  Edit,
  Trash2,
} from "lucide-react";

import { normalizeEventData } from '../../utils/eventUtils';
import { getImageUrl } from '../../services/api';

const AdminEventDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get event data from navigation state if available
  const locationStateEvent = location.state?.event;

  useEffect(() => {
    const fetchEvent = async () => {
      if (locationStateEvent) {
        setEvent(normalizeEventData(locationStateEvent));
        setLoading(false);
      }

      if (id && id !== 'undefined') {
        try {
          const response = await eventService.getEvent(id);
          const freshData = response.data || response;
          setEvent(normalizeEventData(freshData));
          setLoading(false);
        } catch (error) {
          if (!locationStateEvent) {
            alert("Event not found");
            navigate("/admin/dashboard");
          }
        }
      }
    };
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  if (loading && !event) {
    return <div className="p-10 text-center">Loading event details...</div>;
  }

  if (!event) return null;

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  const handleEdit = () => {
    navigate(`/admin/edit-event/${event.id}`, { state: { event } });
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      try {
        await eventService.deleteEvent(event.id);
        alert("Event deleted successfully!");
        navigate("/admin/dashboard");
      } catch (error) {
        alert("Failed to delete event");
      }
    }
  };

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

            {/* Admin Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Event</span>
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Admin Badge */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                Admin View
              </span>
            </div>

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

                {/* Admin Statistics */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Event Statistics
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Total Views</p>
                      <p className="text-2xl font-bold text-gray-900">-</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600 mb-1">Registrations</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {event.attendees || 0}
                      </p>
                    </div>
                  </div>
                </div>
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

                  {/* Admin Actions */}
                  <div className="space-y-3">
                    {/* <button
                      onClick={handleEdit}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit Event
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Event
                    </button> */}
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        alert("Event link copied to clipboard!");
                      }}
                      className="w-full px-6 py-3 bg-gray-500 text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                    >
                      Copy Event Link
                    </button>
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

export default AdminEventDetails;