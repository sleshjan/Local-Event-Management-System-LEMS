import { useState } from 'react';
import { Camera, X, Send, Loader2, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { parseApiError } from '../../services/api';

const EventFeedback = ({ eventId, eventName }) => {
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [comment, setComment] = useState('');
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);
        const maxSize = 2048 * 1024; // 2 MB

        // Validate file sizes
        const invalidFiles = files.filter(f => f.size > maxSize);
        if (invalidFiles.length > 0) {
            setError(`${invalidFiles.length} image(s) exceed 2 MB limit. Please select smaller images.`);
            return;
        }

        setError('');
        setImages(prev => [...prev, ...files]);

        // Create previews
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, { file: file.name, url: reader.result }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!comment.trim()) {
            setError('Please enter your feedback comment.');
            return;
        }

        try {
            setUploading(true);
            setError('');

            // Upload images first if any
            if (images.length > 0) {
                await eventService.uploadEventImages(eventId, images);
            }

            // Submit feedback comment
            await eventService.submitEventFeedback(eventId, comment);

            setSubmitted(true);
            setImages([]);
            setImagePreviews([]);
            setComment('');
        } catch (err) {
            setError(parseApiError(err));
        } finally {
            setUploading(false);
        }
    };

    if (submitted) {
        return (
            <div className="bg-green-50 border border-green-200 rounded-3xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-green-900 mb-2">Thank You for Your Feedback!</h3>
                <p className="text-green-700">
                    Your feedback for <span className="font-semibold">{eventName}</span> has been submitted successfully.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100 rounded-3xl p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Camera className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Share Your Experience</h3>
                    <p className="text-sm text-gray-600">Tell us about your experience at {eventName}</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Add Photos (Optional)
                    </label>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={preview.url}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-32 object-cover rounded-xl border-2 border-purple-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload Button */}
                    <label className="flex items-center justify-center gap-2 px-6 py-4 bg-white border-2 border-dashed border-purple-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                        <ImageIcon className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-700">
                            {imagePreviews.length > 0 ? 'Add More Photos' : 'Upload Photos'}
                        </span>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Maximum 2 MB per image</p>
                </div>

                {/* Comment */}
                <div>
                    <label htmlFor="feedback-comment" className="block text-sm font-semibold text-gray-700 mb-3">
                        Your Feedback <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="feedback-comment"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your thoughts about the event..."
                        rows={5}
                        required
                        disabled={uploading}
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-500 mt-2">{comment.length} characters</p>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={uploading || !comment.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200"
                >
                    {uploading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting Feedback...
                        </>
                    ) : (
                        <>
                            <Send className="w-5 h-5" />
                            Submit Feedback
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default EventFeedback;
