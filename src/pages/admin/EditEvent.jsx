import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import EventForm from '../../components/events/EventForm';
import { eventService } from '../../services/eventService';
import { normalizeEventData } from '../../utils/eventUtils';

const EditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      // 1. Check if event data was passed via navigation state
      if (location.state?.event) {
        console.log("Loading event from state:", location.state.event);
        // Ensure it's normalized (it might be already if coming from EventCard/Details)
        // But running it through normalizeEventData again is safe and ensures consistency
        const normalized = normalizeEventData(location.state.event);
        setEventData(normalized);
        setLoading(false);
        return;
      }

      // 2. Fetch from API if not in state
      try {
        console.log("Fetching event from API:", id);
        const response = await eventService.getEvent(id);
        const normalized = normalizeEventData(response);
        setEventData(normalized);
      } catch (error) {
        console.error("Failed to load event:", error);
        alert("Failed to load event details");
        navigate('/admin/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, navigate, location.state]);

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="text-gray-500">Loading event...</div>
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Edit Event
            </h1>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <EventForm mode="edit" initialData={eventData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEvent;