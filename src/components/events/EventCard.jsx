import { Calendar, MapPin, Users, Eye, Edit } from 'lucide-react';
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
    name,
    title,
    start_date,
    end_date,
    location,
    attendees,
    categories,
    other,
    data: nestedData
  } = event || {};

  const handleViewDetails = () => {
    const rawSlug = event.slug || event.other?.data?.slug || nestedData?.other?.data?.slug;
    const slug = rawSlug || (displayTitle ? displayTitle.toLowerCase().replace(/ /g, '-') + '-' + id : id);
    const param = slug || id;

    if (role === 'user') {
      navigate(`/event/${param}`, { state: { event } });
    } else if (role === 'admin') {
      navigate(`/admin/events/${param}`, { state: { event } });
    }
  };

  const handleEdit = () => {
    const rawSlug = event.slug || event.other?.data?.slug || nestedData?.other?.data?.slug;
    const slug = rawSlug || (displayTitle ? displayTitle.toLowerCase().replace(/ /g, '-') + '-' + id : id);
    const param = slug || id;

    navigate(`/admin/edit-event/${param}`, { state: { event } });
  };

  // Helper to format ISO date string: 2025-12-11T14:30:01.000000Z -> 2025-12-11 14:30:01
  const formatDateTime = (dt) => {
    if (!dt || typeof dt !== 'string') return dt;
    // Check if it contains 'T' to identify ISO format
    if (dt.includes('T')) {
      return dt.replace('T', ' ').split('.')[0];
    }
    return dt;
  };

  // Safe checks for rendering
  const displayTitle = name || title || 'Untitled Event';
  // Use user-provided path: data.other.data.city (assuming event object or nested data)
  const displayLocation = event.city || nestedData?.other?.data?.city || other?.data?.city || location || 'Location TBA';

  const start = event.start_datetime || nestedData?.other?.data?.start_datetime || other?.data?.start_datetime || start_date;
  const end = event.end_datetime || nestedData?.other?.data?.end_datetime || other?.data?.end_datetime || end_date;

  const formattedStart = formatDateTime(start);
  const formattedEnd = formatDateTime(end);

  const displayCategory = (categories && Array.isArray(categories) && categories.length > 0) ? categories[0] : null;
  const displayStatus = event.status || nestedData?.other?.data?.status || other?.data?.status;

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

        {/* Status Badge */}
        {displayStatus && (
          <div className="absolute top-3 right-3 z-10">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium shadow-sm capitalize ${displayStatus.toLowerCase() === 'active' || displayStatus.toLowerCase() === 'open' || displayStatus.toLowerCase() === 'ongoing'
              ? 'bg-green-500 text-white'
              : displayStatus.toLowerCase() === 'upcoming' || displayStatus.toLowerCase() === 'pending'
                ? 'bg-orange-500 text-white'
                : displayStatus.toLowerCase() === 'completed' || displayStatus.toLowerCase() === 'closed'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-500 text-white'
              }`}>
              {displayStatus}
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
              {displayTitle}
            </h3>
            {displayCategory && (
              <InterestTag text={displayCategory} />
            )}
          </div>

          {/* Date */}
          <div className="flex items-start gap-2 text-gray-600">
            <Calendar className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex flex-col text-sm leading-relaxed font-medium">
              {formattedStart && formattedEnd ? (
                <>
                  <span className="whitespace-nowrap">From {formattedStart}</span>
                  <span className="whitespace-nowrap">To {formattedEnd}</span>
                </>
              ) : (
                <span>{event.date && event.date !== 'Date TBA' ? event.date : 'TBA'}</span>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="w-4 h-4 shrink-0" />
            <span className="text-sm line-clamp-1">{displayLocation}</span>
          </div>

          {/* Views (Previously Attendees) */}
          <div className="flex items-center gap-2 text-gray-600">
            <Eye className="w-4 h-4 shrink-0" />
            <span className="text-sm"></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          {role === 'admin' ? (
            <div className="grid grid-cols-2 gap-2">
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