import { useState, useEffect } from 'react';
import { X, Filter, MapPin, Calendar, DollarSign, Tag, CheckCircle } from 'lucide-react';

const EventFilters = ({ isOpen, onClose, onApply, categories = [], currentFilters }) => {
    const [filters, setFilters] = useState({
        categories: currentFilters?.categories || [],
        status: currentFilters?.status || 'all',
        dateRange: currentFilters?.dateRange || { start: '', end: '', preset: 'all' },
        price: currentFilters?.price || { free: false, min: 0, max: 10000 },
        nearMe: currentFilters?.nearMe || { enabled: false, radius: 5, userLocation: null }
    });

    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

    // Get user's current location
    const getUserLocation = async () => {
        setLocationLoading(true);
        setLocationError('');

        try {
            if (!navigator.geolocation) {
                throw new Error('Geolocation is not supported by your browser');
            }

            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    timeout: 10000,
                    enableHighAccuracy: true
                });
            });

            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            setFilters(prev => ({
                ...prev,
                nearMe: { ...prev.nearMe, userLocation, enabled: true }
            }));
        } catch (error) {
            setLocationError(error.message || 'Failed to get your location');
            setFilters(prev => ({
                ...prev,
                nearMe: { ...prev.nearMe, enabled: false }
            }));
        } finally {
            setLocationLoading(false);
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setFilters(prev => ({
            ...prev,
            categories: prev.categories.includes(categoryId)
                ? prev.categories.filter(id => id !== categoryId)
                : [...prev.categories, categoryId]
        }));
    };

    const handleDatePreset = (preset) => {
        const today = new Date();
        let start = '';
        let end = '';

        switch (preset) {
            case 'today':
                start = today.toISOString().split('T')[0];
                end = start;
                break;
            case 'week':
                start = today.toISOString().split('T')[0];
                const weekEnd = new Date(today);
                weekEnd.setDate(today.getDate() + 7);
                end = weekEnd.toISOString().split('T')[0];
                break;
            case 'month':
                start = today.toISOString().split('T')[0];
                const monthEnd = new Date(today);
                monthEnd.setMonth(today.getMonth() + 1);
                end = monthEnd.toISOString().split('T')[0];
                break;
            default:
                start = '';
                end = '';
        }

        setFilters(prev => ({
            ...prev,
            dateRange: { start, end, preset }
        }));
    };

    const handleApply = () => {
        onApply(filters);
        onClose();
    };

    const handleClearAll = () => {
        setFilters({
            categories: [],
            status: 'all',
            dateRange: { start: '', end: '', preset: 'all' },
            price: { free: false, min: 0, max: 10000 },
            nearMe: { enabled: false, radius: 5, userLocation: null }
        });
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (filters.categories.length > 0) count++;
        if (filters.status !== 'all') count++;
        if (filters.dateRange.start || filters.dateRange.end) count++;
        if (filters.price.free || filters.price.min > 0 || filters.price.max < 10000) count++;
        if (filters.nearMe.enabled) count++;
        return count;
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Filter Panel */}
            <div className="relative bg-white h-full w-full sm:w-[600px] shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                            <Filter className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                            {getActiveFilterCount() > 0 && (
                                <p className="text-xs text-purple-600">{getActiveFilterCount()} active</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Filter Sections */}
                <div className="p-6 space-y-6">
                    {/* Category Filter */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Categories</h3>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {categories.map((category) => (
                                <label
                                    key={category.id}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={filters.categories.includes(category.id)}
                                        onChange={() => handleCategoryToggle(category.id)}
                                        className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                    />
                                    <span className="text-sm text-gray-700">{category.name}</span>
                                    {filters.categories.includes(category.id) && (
                                        <CheckCircle className="w-4 h-4 text-purple-600 ml-auto" />
                                    )}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <h3 className="font-semibold text-gray-900">Event Status</h3>
                        <div className="space-y-2">
                            {[
                                { value: 'all', label: 'All Events' },
                                { value: 'upcoming', label: 'Upcoming' },
                                { value: 'ongoing', label: 'Ongoing' },
                                { value: 'past', label: 'Past Events' }
                            ].map((option) => (
                                <label
                                    key={option.value}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                                >
                                    <input
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={filters.status === option.value}
                                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                                        className="w-4 h-4 text-purple-600 focus:ring-2 focus:ring-purple-200"
                                    />
                                    <span className="text-sm text-gray-700">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Date Range</h3>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {[
                                { value: 'all', label: 'All' },
                                { value: 'today', label: 'Today' },
                                { value: 'week', label: 'This Week' },
                                { value: 'month', label: 'This Month' }
                            ].map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => handleDatePreset(preset.value)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filters.dateRange.preset === preset.value
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {preset.label}
                                </button>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
                                <input
                                    type="date"
                                    value={filters.dateRange.start}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, start: e.target.value, preset: 'custom' }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                                <input
                                    type="date"
                                    value={filters.dateRange.end}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        dateRange: { ...prev.dateRange, end: e.target.value, preset: 'custom' }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Price Filter */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Price Range</h3>
                        </div>
                        <label className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={filters.price.free}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    price: { ...prev.price, free: e.target.checked }
                                }))}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                            />
                            <span className="text-sm text-gray-700">Free Events Only</span>
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Min Price</label>
                                <input
                                    type="number"
                                    value={filters.price.min}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        price: { ...prev.price, min: Number(e.target.value) }
                                    }))}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Max Price</label>
                                <input
                                    type="number"
                                    value={filters.price.max}
                                    onChange={(e) => setFilters(prev => ({
                                        ...prev,
                                        price: { ...prev.price, max: Number(e.target.value) }
                                    }))}
                                    min="0"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Near Me Filter */}
                    <div className="space-y-3 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-600" />
                            <h3 className="font-semibold text-gray-900">Near Me</h3>
                        </div>

                        {!filters.nearMe.userLocation ? (
                            <button
                                onClick={getUserLocation}
                                disabled={locationLoading}
                                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                <MapPin className="w-4 h-4" />
                                {locationLoading ? 'Getting Location...' : 'Enable Location'}
                            </button>
                        ) : (
                            <>
                                <div className="p-3 bg-green-50 rounded-xl text-sm text-green-700 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Location enabled
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-2">Radius</label>
                                    <select
                                        value={filters.nearMe.radius}
                                        onChange={(e) => setFilters(prev => ({
                                            ...prev,
                                            nearMe: { ...prev.nearMe, radius: Number(e.target.value) }
                                        }))}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
                                    >
                                        <option value={0.1}>Within 100m</option>
                                        <option value={1}>Within 1 km</option>
                                        <option value={5}>Within 5 km</option>
                                        <option value={10}>Within 10 km</option>
                                        <option value={25}>Within 25 km</option>
                                    </select>
                                </div>
                            </>
                        )}

                        {locationError && (
                            <p className="text-xs text-red-600">{locationError}</p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 flex gap-3">
                    <button
                        onClick={handleClearAll}
                        className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                    >
                        Clear All
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventFilters;
