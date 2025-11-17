import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { Upload, X } from 'lucide-react';

const EventForm = ({ initialData = null, mode = 'create' }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    street: '',
    venue: '',
    location: '',
    latitude: '',
    longitude: '',
    categories: [],
    price: '',
    maxParticipants: '',
    duration: '',
    image: '',
    organizer: '',
    organizerBio: ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Available categories
  const availableCategories = [
    'Music', 'Concert', 'Tech', 'Workshop', 'AI & Data', 'Design Talks',
    'Food & Drink', 'Wine & Tastings', 'Coffee & Brunch', 'Vegan & Healthy',
    'Outdoors', 'Hiking & Outdoors', 'Fitness & Yoga', 'Cycling', 'Mindfulness',
    'Art & Design', 'Culture', 'Theatre', 'Photography', 'Museums',
    'Social', 'Networking', 'Volunteering', 'Language Exchange', 'Board Games'
  ];

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        startTime: initialData.startTime || initialData.time || '',
        endTime: initialData.endTime || '',
        street: initialData.street || '',
        venue: initialData.venue || '',
        location: initialData.location || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        categories: initialData.categories || [],
        price: initialData.price || '',
        maxParticipants: initialData.maxParticipants || '',
        duration: initialData.duration || '',
        image: initialData.image || '',
        organizer: initialData.organizer || '',
        organizerBio: initialData.organizerBio || ''
      });
      setImagePreview(initialData.image);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData({
      ...formData,
      [name]: value
    });

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };

  const handleCategoryToggle = (category) => {
    const updatedCategories = formData.categories.includes(category)
      ? formData.categories.filter(c => c !== category)
      : [...formData.categories, category];
    
    setFormData({
      ...formData,
      categories: updatedCategories
    });

    if (errors.categories) {
      setErrors({
        ...errors,
        categories: ''
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setFormData({
      ...formData,
      image: ''
    });
  };

  const validateField = (name, value) => {
    let error = '';

    switch (name) {
      case 'title':
        if (!value.trim()) error = 'Event title is required';
        else if (value.length < 5) error = 'Title must be at least 5 characters';
        break;
      case 'description':
        if (!value.trim()) error = 'Description is required';
        else if (value.length < 20) error = 'Description must be at least 20 characters';
        break;
      case 'startDate':
        if (!value) error = 'Start date is required';
        break;
      case 'endDate':
        if (!value) error = 'End date is required';
        else if (formData.startDate && value < formData.startDate) {
          error = 'End date cannot be before start date';
        }
        break;
      case 'startTime':
        if (!value) error = 'Start time is required';
        break;
      case 'endTime':
        if (!value) error = 'End time is required';
        break;
      case 'street':
        if (!value.trim()) error = 'Street is required';
        break;
      case 'venue':
        if (!value.trim()) error = 'Venue name is required';
        break;
      case 'location':
        if (!value.trim()) error = 'Location is required';
        break;
      case 'latitude':
        if (value && (isNaN(value) || value < -90 || value > 90)) {
          error = 'Latitude must be between -90 and 90';
        }
        break;
      case 'longitude':
        if (value && (isNaN(value) || value < -180 || value > 180)) {
          error = 'Longitude must be between -180 and 180';
        }
        break;
      case 'price':
        if (value && isNaN(value)) error = 'Price must be a number';
        break;
      case 'maxParticipants':
        if (!value) error = 'Max participants is required';
        else if (isNaN(value) || value < 1) error = 'Must be a positive number';
        break;
      case 'organizer':
        if (!value.trim()) error = 'Organizer name is required';
        break;
      default:
        break;
    }

    setErrors(prev => ({
      ...prev,
      [name]: error
    }));

    return error;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldNames = [
      'title', 'description', 'startDate', 'endDate', 'startTime', 'endTime',
      'street', 'venue', 'location', 'maxParticipants', 'organizer'
    ];
    const newErrors = {};
    let hasErrors = false;

    fieldNames.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    // Validate categories
    if (formData.categories.length === 0) {
      newErrors.categories = 'Please select at least one category';
      hasErrors = true;
    }

    const allTouched = {};
    fieldNames.forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    console.log('Event data:', formData);
    
    if (mode === 'create') {
      alert('Event created successfully!');
    } else {
      alert('Event updated successfully!');
    }
    
    navigate('/admin/dashboard');
  };

  const handleCancel = () => {
    navigate('/admin/dashboard');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Image Upload */}
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Event Image
        </label>
        
        {!imagePreview ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
            <label className="cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-2">Click to upload event image</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>
        ) : (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Event preview"
              className="w-full h-64 object-cover rounded-xl"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Event Title */}
      <div>
        <Input
          label="Event Title"
          type="text"
          name="title"
          placeholder="Summer Music Festival 2024"
          value={formData.title}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {touched.title && errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-gray-700 text-sm font-medium mb-2">
          Description
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Describe your event in detail..."
          rows="6"
          className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
        />
        {touched.description && errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Start Date & End Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Start Date"
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.startDate && errors.startDate && (
            <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
          )}
        </div>
        <div>
          <Input
            label="End Date"
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.endDate && errors.endDate && (
            <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
          )}
        </div>
      </div>

      {/* Start Time & End Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Start Time"
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.startTime && errors.startTime && (
            <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>
          )}
        </div>
        <div>
          <Input
            label="End Time"
            type="time"
            name="endTime"
            value={formData.endTime}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.endTime && errors.endTime && (
            <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>
          )}
        </div>
      </div>

      {/* Location Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Location</h3>
        
        {/* Venue Name */}
        <div className="mb-4">
          <Input
            label="Venue Name"
            type="text"
            name="venue"
            placeholder="Central Park Amphitheater"
            value={formData.venue}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.venue && errors.venue && (
            <p className="text-red-500 text-sm mt-1">{errors.venue}</p>
          )}
        </div>

        {/* Street */}
        <div className="mb-4">
          <Input
            label="Street"
            type="text"
            name="street"
            placeholder="123 Main Street"
            value={formData.street}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.street && errors.street && (
            <p className="text-red-500 text-sm mt-1">{errors.street}</p>
          )}
        </div>

        {/* City/Location */}
        <div className="mb-4">
          <Input
            label="City/Location"
            type="text"
            name="location"
            placeholder="New York, NY"
            value={formData.location}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.location && errors.location && (
            <p className="text-red-500 text-sm mt-1">{errors.location}</p>
          )}
        </div>

        {/* Latitude & Longitude */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Input
              label="Latitude (Optional)"
              type="text"
              name="latitude"
              placeholder="40.7829"
              value={formData.latitude}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.latitude && errors.latitude && (
              <p className="text-red-500 text-sm mt-1">{errors.latitude}</p>
            )}
          </div>
          <div>
            <Input
              label="Longitude (Optional)"
              type="text"
              name="longitude"
              placeholder="-73.9654"
              value={formData.longitude}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.longitude && errors.longitude && (
              <p className="text-red-500 text-sm mt-1">{errors.longitude}</p>
            )}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-t border-gray-200 pt-6">
        <label className="block text-gray-700 text-sm font-medium mb-3">
          Categories (Select at least one)
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => handleCategoryToggle(category)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                formData.categories.includes(category)
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        {errors.categories && (
          <p className="text-red-500 text-sm mt-2">{errors.categories}</p>
        )}
      </div>

      {/* Price & Max Participants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Input
            label="Price (Leave 0 for free)"
            type="number"
            name="price"
            placeholder="0"
            value={formData.price}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.price && errors.price && (
            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
          )}
        </div>
        <div>
          <Input
            label="Max Participants"
            type="number"
            name="maxParticipants"
            placeholder="100"
            value={formData.maxParticipants}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          {touched.maxParticipants && errors.maxParticipants && (
            <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
          )}
        </div>
      </div>

      {/* Duration */}
      <div>
        <Input
          label="Duration (Optional)"
          type="text"
          name="duration"
          placeholder="3 hours"
          value={formData.duration}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>

      {/* Organizer Details */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Details</h3>
        
        <div className="space-y-4">
          <div>
            <Input
              label="Organizer Name"
              type="text"
              name="organizer"
              placeholder="Event Company Name"
              value={formData.organizer}
              onChange={handleChange}
              onBlur={handleBlur}
            />
            {touched.organizer && errors.organizer && (
              <p className="text-red-500 text-sm mt-1">{errors.organizer}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              Organizer Bio (Optional)
            </label>
            <textarea
              name="organizerBio"
              value={formData.organizerBio}
              onChange={handleChange}
              placeholder="Brief description of the organizer..."
              rows="3"
              className="w-full px-4 py-3 bg-purple-50 border border-transparent rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={handleCancel}
          className="w-full sm:w-1/2 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <div className="w-full sm:w-1/2">
          <Button 
            text={mode === 'create' ? 'Create Event' : 'Update Event'} 
            type="submit" 
            fullWidth 
          />
        </div>
      </div>
    </form>
  );
};

export default EventForm;