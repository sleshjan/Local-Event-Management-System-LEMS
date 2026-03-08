import { Calendar, MapPin, Users, Eye, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InterestTag from '../common/InterestTag';
import Button from '../common/Button';
import { getImageUrl } from '../../services/api';
import { normalizeEventData } from '../../utils/eventUtils';

const EventCard = ({ event, role = 'user', onDelete }) => {
  const navigate = useNavigate();

  if (!event) {
    return null;
  }

  // Normalize event data to ensure consistency across Admin and User views
  // This applies defaults (Chakupat, LEC Club) and parses dates correctly
  const displayEvent = normalizeEventData(event);

  const handleViewDetails = () => {
    // Navigate using the ID or Slug from normalized data
    const param = displayEvent.slug || displayEvent.id;

    if (role === 'user') {
      navigate(`/event/${param}`, { state: { event } });
    } else if (role === 'admin') {
      navigate(`/admin/events/${param}`, { state: { event } });
    }
  };

  const handleEdit = () => {
    navigate(`/admin/edit-event/${displayEvent.id}`, { state: { event } });
  };

  const displayCategory = (displayEvent.categories && displayEvent.categories.length > 0)
    ? displayEvent.categories[0]
    : 'Event';

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
      {/* Event Image */}
      <div className="relative w-full h-48 bg-gray-200 overflow-hidden shrink-0">
        {displayEvent.image ? (
          <img
            src={getImageUrl(displayEvent.image)}
            alt={displayEvent.title}
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="w-full h-full flex items-center justify-center bg-gray-300" style={{ display: displayEvent.image ? 'none' : 'flex' }}>
          <span className="text-gray-500">No Image</span>
        </div>

        {/* View Count Overlay */}
        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-lg bg-purple-600/70 backdrop-blur-lg border border-white/10 text-white shadow-sm">
            <Eye className="w-3.5 h-3.5 text-white" />
            <span className="text-sm font-bold">{displayEvent.view_count || 0}</span>
          </div>
        </div>

        {/* Status Badge */}
        {displayEvent.status && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm capitalize border ${displayEvent.status.toLowerCase() === 'ongoing' || displayEvent.status.toLowerCase() === 'active'
              ? 'bg-green-500 text-white border-green-600'
              : displayEvent.status.toLowerCase() === 'upcoming'
                ? 'bg-blue-500 text-white border-blue-600'
                : (displayEvent.status.toLowerCase() === 'completed' || displayEvent.status.toLowerCase() === 'past')
                  ? 'bg-gray-600 text-white border-gray-700'
                  : 'bg-gray-100 text-gray-600 border-gray-200'
              }`}>
              {displayEvent.status === 'Past' ? 'Completed' : displayEvent.status}
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-5 flex flex-col grow">
        <div className="space-y-4 grow">
          {/* Title and Category Tag */}
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900 flex-1 line-clamp-2">
              {displayEvent.title}
            </h3>
            <div className="flex flex-col items-end gap-1">
              {displayCategory && (
                <InterestTag text={displayCategory} />
              )}
              {displayEvent.categories && displayEvent.categories.length > 1 && (
                <span className="inline-block px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                  +{displayEvent.categories.length - 1} more
                </span>
              )}
            </div>
          </div>

          {/* Date */}
          <div className="flex items-start gap-2 text-gray-600">
            <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col text-sm leading-relaxed font-medium">
              <div>
                <span className="text-xs text-purple-600 uppercase font-bold tracking-wider mr-1">Starts:</span>
                <span>{displayEvent.date}</span>
                {displayEvent.time && <span className="ml-1 text-xs text-gray-500">{displayEvent.time}</span>}
              </div>
              
              {displayEvent.endDate && (
                <div className="mt-0.5">
                  <span className="text-xs text-purple-500 uppercase font-bold tracking-wider mr-1">Ends:</span>
                  <span>{displayEvent.endDate}</span>
                  {displayEvent.endTime && <span className="ml-1 text-xs text-gray-500">{displayEvent.endTime}</span>}
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm line-clamp-1">{displayEvent.location}</span>
          </div>

          {/* Attendees */}
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4 shrink-0" />
            <span className="text-sm">
              {displayEvent.attendees} {displayEvent.attendees === 1 ? 'Attendee' : 'Attendees'}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button
            text="View Details"
            fullWidth
            onClick={handleViewDetails}
          />
        </div>
      </div>
    </div>
  );
};

export default EventCard;