import { Calendar, MapPin, Users, User as UserIcon } from 'lucide-react';
import InterestTag from '../common/InterestTag';

const AdminEventCard = ({ event }) => {
  const { 
    id,
    image, 
    title, 
    date, 
    location, 
    categories,
    attendees,
    organizer
  } = event;

  const handleManage = () => {
    console.log('Manage event:', id);
    // Navigate to event management page
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col h-full border border-gray-200">
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
        <div className="space-y-3 grow">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
            {title || 'Untitled Event'}
          </h3>

          {/* Date & Location */}
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" />
              <span className="line-clamp-1">{location}</span>
            </div>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories && categories.map((category, index) => (
              <InterestTag key={index} text={category} />
            ))}
          </div>
        </div>

        {/* Manage Button */}
        <div className="mt-4">
          <button
            onClick={handleManage}
            className="w-full bg-purple-600 text-white font-medium px-6 py-3 rounded-xl hover:bg-purple-700 transition-colors duration-200"
          >
            Manage
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEventCard;