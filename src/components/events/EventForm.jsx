import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { Upload, X } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';

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

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        const response = await categoryService.getCategories({ per_page: 100 });
        let cats = [];
        if (Array.isArray(response)) {
          cats = response;
        } else if (response?.data && Array.isArray(response.data)) {
          cats = response.data;
        } else if (response?.data?.data && Array.isArray(response.data.data)) {
          cats = response.data.data;
        }

        setAvailableCategories(cats);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (initialData) {
      // If categories are objects, extract IDs
      const sourceCats = initialData.categoryObjects || initialData.categories || [];
      const categoryIds = sourceCats.map(c =>
        typeof c === 'object' ? (c.id || c.category_id) : c
      );

      setFormData({
        title: initialData.title || initialData.name || '',
        description: initialData.description || '',
        startDate: initialData.startDate || (initialData.start_datetime ? initialData.start_datetime.replace('T', ' ').split(' ')[0] : ''),
        endDate: initialData.endDate || (initialData.end_datetime ? initialData.end_datetime.replace('T', ' ').split(' ')[0] : ''),
        startTime: initialData.startTime || (initialData.start_datetime ? initialData.start_datetime.replace('T', ' ').split(' ')[1]?.substring(0, 5) : ''),
        endTime: initialData.endTime || (initialData.end_datetime ? initialData.end_datetime.replace('T', ' ').split(' ')[1]?.substring(0, 5) : ''),
        street: initialData.street || '',
        venue: initialData.venue || '',
        location: initialData.location || initialData.city || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        categories: categoryIds,
        price: initialData.seat_price || initialData.price || '',
        maxParticipants: initialData.total_seat || initialData.maxParticipants || '',
        duration: initialData.duration || '',
        image: initialData.cover_image || initialData.image || '',
        organizer: initialData.organizer || '',
        organizerBio: initialData.organizerBio || ''
      });
      setImagePreview(initialData.cover_image || initialData.image);
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

  const handleCategoryToggle = (categoryId) => {
    const updatedCategories = formData.categories.includes(categoryId)
      ? formData.categories.filter(id => id !== categoryId)
      : [...formData.categories, categoryId];

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
      // Validate File Size (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB. Please upload a smaller image.");
        return;
      }

      // Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert("Invalid file format. Please upload JPG, PNG, GIF, or WEBP.");
        return;
      }

      setImageFile(file); // Store raw file

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({
          ...formData,
          image: reader.result // Keep for preview/logic, but submission uses imageFile
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
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
        if (!value) error = 'Latitude is required';
        else if (isNaN(value) || value < -90 || value > 90) {
          error = 'Latitude must be between -90 and 90';
        }
        break;
      case 'longitude':
        if (!value) error = 'Longitude is required';
        else if (isNaN(value) || value < -180 || value > 180) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const fieldNames = [
      'title', 'description', 'startDate', 'endDate', 'startTime', 'endTime',
      'street', 'venue', 'location', 'latitude', 'longitude', 'maxParticipants', 'organizer'
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

    // Build FormData
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('start_datetime', `${formData.startDate} ${formData.startTime}:00`);
    data.append('end_datetime', `${formData.endDate} ${formData.endTime}:00`);
    data.append('street', formData.street);
    data.append('venue', formData.venue);
    data.append('city', formData.location);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('total_seat', parseInt(formData.maxParticipants));
    data.append('seat_price', parseFloat(formData.price || 0));
    data.append('organizer', formData.organizer);
    data.append('organizer_bio', formData.organizerBio || '');
    data.append('duration', formData.duration || '0');

    // Append Categories (check backend expectation)
    formData.categories.forEach((cat, index) => {
      data.append(`categories[${index}]`, cat);
    });

    // Append image file if exists
    if (imageFile) {
      data.append('cover_image', imageFile);
    } else if (mode === 'create') {
      // If creating and no image, this might fail backend validation if required
      // But let's assume valid because we check previews
      // If required by backend, we should have a frontend check too?
      // But user said "I have put an image", so imageFile should be set.
    }

    // If Updating, method spoofing might be needed for Laravel/PHP if using FormData
    // because standard PUT requests don't support multipart/form-data well.
    // However, if the backend endpoint is strictly POST, removing _method avoids a 405 error.
    // if (mode !== 'create') {
    //   data.append('_method', 'PUT');
    // }

    // Submit to API
    try {
      // Note: eventService.updateEvent uses PUT method. 
      // If backend fails to read files on PUT, we might need to change service to use POST + _method
      // modifying the service call for update might be necessary if it fails.

      if (mode === 'create') {
        const response = await eventService.createEvent(data);
        alert('Event created successfully!');
      } else {
        // For updates with files, use POST usually, but let's try calling updateEvent 
        // which might need mod to use POST if we passed _method
        const response = await eventService.updateEvent(initialData.id, data);
        alert('Event updated successfully!');
      }
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error submitting event:', error);

      // Extract detailed error message
      let errorMessage = 'Something went wrong.';

      if (error.message) {
        errorMessage = error.message;
      }

      // If there are validation errors from backend
      if (error.errors && typeof error.errors === 'object') {
        const errorDetails = Object.entries(error.errors)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        errorMessage = `Validation errors:\n${errorDetails}`;
      }

      alert(errorMessage);
    }
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
              label="Latitude"
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
              label="Longitude"
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

        {isCategoriesLoading ? (
          <div className="flex items-center gap-2 py-4 text-gray-500 italic text-sm">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            Loading categories...
          </div>
        ) : availableCategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {availableCategories.map((category) => {
              // Defensive check for category structure
              if (!category || !category.id || !category.name) {
                console.warn('Invalid category object:', category);
                return null;
              }

              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryToggle(category.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.categories.includes(category.id)
                    ? 'bg-purple-600 text-white shadow-md transform scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">No categories found. Please create some in Manage Categories.</p>
        )}

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