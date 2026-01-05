import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { Upload, X } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import LocationPicker from './LocationPicker';
import RichTextEditor from '../common/RichTextEditor';

const EventForm = ({ initialData = null, mode = 'create' }) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: '',
    latitude: '',
    longitude: '',
    categories: [],
    price: '',
    maxParticipants: '',
    duration: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      ).map(id => !isNaN(id) ? parseInt(id) : id);

      setFormData({
        title: initialData.title || initialData.name || '',
        description: initialData.description || '',
        // Prioritize raw datetime strings over potentially formatted 'startDate'/'startTime' props
        // The backend/utils might provide 'date' (pretty string) but we need YYYY-MM-DD for input.
        startDate: (initialData.start_datetime ? initialData.start_datetime.split(/T| /)[0] : '') || initialData.startDate || '',
        endDate: (initialData.end_datetime ? initialData.end_datetime.split(/T| /)[0] : '') || initialData.endDate || '',
        startTime: (initialData.start_datetime ? initialData.start_datetime.split(/T| /)[1]?.substring(0, 5) : '') || initialData.startTime || '',
        endTime: (initialData.end_datetime ? initialData.end_datetime.split(/T| /)[1]?.substring(0, 5) : '') || initialData.endTime || '',
        location: initialData.location || initialData.city || '',
        latitude: initialData.latitude || '',
        longitude: initialData.longitude || '',
        categories: initialData.categories || categoryIds || [],
        price: initialData.seat_price || initialData.price || '',
        maxParticipants: initialData.maxParticipants || initialData.total_seat || '',
        duration: initialData.duration || '',
        image: initialData.cover_image || initialData.image || '',
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
        showToast("File size exceeds 5MB. Please upload a smaller image.", "error");
        return;
      }

      // Validate File Type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        showToast("Invalid file format. Please upload JPG, PNG, GIF, or WEBP.", "error");
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

  const handleDescriptionChange = (content) => {
    setFormData({
      ...formData,
      description: content
    });

    if (errors.description) {
      setErrors({
        ...errors,
        description: ''
      });
    }
  };

  const handleMapLocationChange = (locationData) => {
    setFormData({
      ...formData,
      location: locationData.locationName,
      latitude: locationData.lat.toString(),
      longitude: locationData.lng.toString()
    });

    // Clear errors when a location is picked
    setErrors(prev => ({
      ...prev,
      location: '',
      latitude: '',
      longitude: ''
    }));
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
    setIsSubmitting(true);

    // Validate all fields
    const fieldNames = [
      'title', 'description', 'startDate', 'endDate', 'startTime', 'endTime',
      'location', 'latitude', 'longitude', 'maxParticipants'
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
    data.append('city', formData.location);
    data.append('latitude', formData.latitude);
    data.append('longitude', formData.longitude);
    data.append('total_seat', parseInt(formData.maxParticipants));
    data.append('seat_price', parseFloat(formData.price || 0));
    data.append('duration', formData.duration || '0');

    // Sanitize Categories: Ensure we're sending IDs (integers), not names
    const finalCategoryIds = formData.categories.map(catVal => {
      // If it's already a number or numeric string
      if (!isNaN(catVal)) return parseInt(catVal);

      // If it's a string (name), try to find ID in availableCategories
      const match = availableCategories.find(c => c.name.toLowerCase() === catVal.toLowerCase());
      return match ? match.id : null;
    }).filter(id => id !== null);

    // Append Categories
    if (finalCategoryIds.length === 0 && formData.categories.length > 0) {
      // If mapping failed but we had data, might be better to send what we have or warn?
      // But to fix the "must be integer" error, we must filter out strings.
      // If this results in empty, the validation "at least one" might trigger below if we checked earlier,
      // but we checked earlier against raw formData.categories.
    }

    finalCategoryIds.forEach((catId, index) => {
      data.append(`categories[${index}]`, catId);
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
      if (initialData?.id) {
        await eventService.updateEvent(initialData.id, data);
        showToast('Event updated successfully!', 'success');
        navigate(`/admin/events/${initialData.slug || initialData.id}`);
      } else {
        await eventService.createEvent(data);
        showToast('Event created successfully!', 'success');
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Error submitting event:', err);
      // Construct a better error message from the API response
      let errorMessage = 'Failed to save event.';

      if (err.response && err.response.data && err.response.data.errors) {
        // Validation errors object
        errorMessage = Object.values(err.response.data.errors).flat().join('\n');
      } else if (err.errors) {
        // Propagated errors from api.js
        errorMessage = Object.values(err.errors).flat().join('\n');
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      showToast(`Error: ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
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
              crossOrigin="anonymous"
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
        <RichTextEditor
          label="Description"
          value={formData.description}
          onChange={handleDescriptionChange}
          placeholder="Describe your event in detail..."
          error={touched.description ? errors.description : ''}
        />
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Event Location</h3>
          {formData.location && (
            <span className="text-sm font-medium text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {formData.location}
            </span>
          )}
        </div>

        <LocationPicker
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          onLocationChange={handleMapLocationChange}
        />

        {(errors.location || errors.latitude || errors.longitude) && (
          <p className="text-red-500 text-sm mt-1">
            {errors.location || 'Please pick a location on the map'}
          </p>
        )}
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