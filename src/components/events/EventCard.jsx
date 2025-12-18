import { Calendar, MapPin, Users, Eye, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTag from '../common/InterestTag';
import Button from '../common/Button';
import { getImageUrl } from '../../services/api';

const EventCard = ({ event, role = 'user', onDelete }) => {
  const navigate = useNavigate();

  if (!event) {
    return null;
  }

  const {
    id,
    image,
    title,
    date,
    location,
    attendees,
    categories
  } = event || {};

  const handleViewDetails = () => {
    if (role === 'user') {
      navigate(`/event/${id}`, { state: { event } });
    } else if (role === 'admin') {
      navigate(`/admin/events/${id}`, { state: { event } });
    }
  };

  const handleEdit = () => {
    navigate(`/admin/edit-event/${id}`, { state: { event } });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      if (onDelete) onDelete(id);
    }
  };

  // Safe checks for rendering
  const displayTitle = title || 'Untitled Event';
  const displayLocation = location || 'Location TBA';
  const displayDate = date || 'Date TBA';
  const displayCategory = (categories && Array.isArray(categories) && categories.length > 0) ? categories[0] : null;

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Event Image */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden shrink-0">
        {image ? (
          <img
            src={getImageUrl(image)}
            alt={displayTitle}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: image ? 'none' : 'flex' }}>
          <span className="text-gray-500">No Image</span>
        </div>
      </div>

      {/* Event Details */}
      <div className="p-5 flex flex-col grow">
        <div className="space-y-4 grow">
          {/* Title and Category Tag */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
              {displayTitle}
            </h3>
            {displayCategory && (
              <InterestTag text={displayCategory} />
            )}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="text-sm">{displayDate}</span>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm line-clamp-1">{displayLocation}</span>
          </div>

          {/* Attendees Count */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-sm">
              {attendees || 0} {(attendees === 1) ? 'attendee' : 'attendees'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {role === 'admin' ? (
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleViewDetails}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">View</span>
              </button>

              <button
                onClick={handleEdit}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-purple-100 text-purple-700 font-medium rounded-xl hover:bg-purple-200 transition-colors"
                title="Edit Event"
              >
                <Edit className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Edit</span>
              </button>

              <button
                onClick={handleDelete}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-100 text-red-700 font-medium rounded-xl hover:bg-red-200 transition-colors"
                title="Delete Event"
              >
                <Trash2 className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Delete</span>
              </button>
            </div>
          ) : (
            <Button
              text="View Details"
              fullWidth
              onClick={handleViewDetails}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;