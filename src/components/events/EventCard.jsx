import { Calendar, MapPin, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTag from '../common/InterestTag';
import Button from '../common/Button';

const EventCard = ({ event, role = 'user' }) => {
  const navigate = useNavigate();
  
  const { 
    id,
    image, 
    title, 
    date, 
    location, 
    attendees, 
    categories,
    viewCount = 0
  } = event;

  const handleViewDetails = () => {
    // Navigate to event details page based on role
    if (role === 'user') {
      navigate(`/event/${id}`, { state: { event } });
    } else if (role === 'admin') {
      navigate(`/admin/event/${id}`, { state: { event } });
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

          {/* View Count */}
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-4 h-4 shrink-0" />
            <span className="text-sm">
              {viewCount.toLocaleString()} {viewCount === 1 ? 'view' : 'views'}
            </span>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-4">
          <Button 
            text={role === 'admin' ? 'Manage' : 'View Details'}
            fullWidth 
            onClick={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default EventCard;