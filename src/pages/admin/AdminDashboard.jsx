import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Plus } from 'lucide-react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminEventCard from '../../components/admin/AdminEventCard';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mock events data (same as user dashboard for now)
  const events = [
    {
      id: 1,
      title: 'Indie Nights at The Loft',
      image: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=500&h=300&fit=crop',
      date: 'Fri 8 PM',
      location: 'Downtown',
      categories: ['Live Music', 'Indie'],
      attendees: 450,
      organizer: 'Music Events Co.'
    },
    {
      id: 2,
      title: 'AI & Pizza: Founder Meetup',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&h=300&fit=crop',
      date: 'Thu 6 PM',
      location: 'SoMa',
      categories: ['Tech', 'Startups', 'Networking'],
      attendees: 150,
      organizer: 'Tech Innovators'
    },
    {
      id: 3,
      title: 'First Friday Art Walk',
      image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01988ec?w=500&h=300&fit=crop',
      date: 'Sat 4 PM',
      location: 'Arts District',
      categories: ['Art', 'Design'],
      attendees: 320,
      organizer: 'Arts Collective'
    },
    {
      id: 4,
      title: 'Sunrise Hike & Coffee',
      image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=500&h=300&fit=crop',
      date: 'Sun 6 AM',
      location: 'Ridge Park',
      categories: ['Outdoors', 'Wellness'],
      attendees: 85,
      organizer: 'Mountain Wellness'
    }
  ];

  // Filter events based on search
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.categories.some(cat => cat.toLowerCase().includes(searchQuery.toLowerCase()))
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

            {/* Page Title */}
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Dashboard Overview
            </h1>

            {/* Create Button - Desktop */}
            <div className="hidden sm:block">
              <button className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">
                <Plus className="w-5 h-5" />
                Create
              </button>
            </div>
          </div>

          {/* Mobile Create Button */}
          <div className="sm:hidden mt-3">
            <button className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors">
              <Plus className="w-5 h-5" />
              Create Event
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {/* Recent Events Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-600">
                Recent events
              </h2>
              <button className="text-sm font-medium text-purple-600 hover:text-purple-700">
                See all
              </button>
            </div>

            {/* Events Grid */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredEvents.map((event) => (
                  <AdminEventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No events found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;