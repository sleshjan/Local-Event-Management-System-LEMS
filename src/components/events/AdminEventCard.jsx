import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTag from '../common/InterestTag';

const AdminEventCard = ({ event, onDelete }) => {
  const navigate = useNavigate();
  
  const { 
    id,
    image, 
    title, 
    date, 
    location, 
    attendees, 
    categories
  } = event;

  const handleView = () => {
    navigate(`/admin/events/${id}`, { state: { event } });
  };

  const handleEdit = () => {
    console.log("Edit event:", id);
    // Navigate to edit page (create this later)
    // navigate(`/admin/events/edit/${id}`, { state: { event } });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      console.log("Delete event:", id);
      // Call parent component's delete handler or API
      if (onDelete) {
        onDelete(id);
      }
      // In real app: call API to delete event
      alert("Event deleted successfully!");
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Event Image */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden shrink-0">
        {image ? (
          <img
            src={image}
            alt={title || 'Event'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5 flex flex-col grow">
        <div className="space-y-4 grow">
          {/* Title and Category Tag */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
              {title || 'Untitled Event'}
            </h3>
            {categories && categories.length > 0 && (
              <InterestTag text={categories[0]} />
            )}
          </div>

          {/* Date */}
          {date && (
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-4 h-4 shrink-0" />
              <span className="text-sm">{date}</span>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="text-sm line-clamp-1">{location}</span>
            </div>
          )}

          {/* Attendees */}
          {attendees !== undefined && attendees !== null && (
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-4 h-4 shrink-0" />
              <span className="text-sm">
                {attendees} {attendees === 1 ? 'person' : 'people'} attending
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons - View, Edit, Delete */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* View Button */}
          <button
            onClick={handleView}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
            <span className="text-sm">View</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={handleEdit}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
            title="Edit Event"
          >
            <Edit className="w-4 h-4" />
            <span className="text-sm">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors"
            title="Delete Event"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventCard;