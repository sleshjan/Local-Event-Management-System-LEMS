import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Child component to handle map clicks
const MapEventsHandler = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

// Component to handle auto-panning when initial coordinates change
const ChangeView = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

const LocationPicker = ({ initialLat, initialLng, onLocationChange }) => {
    const [position, setPosition] = useState(
        initialLat && initialLng
            ? [parseFloat(initialLat), parseFloat(initialLng)]
            : [27.7172, 85.3240] // Default to Kathmandu if no location
    );
    const [address, setAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Update position if initial coordinates change (e.g., when editing an event)
    useEffect(() => {
        if (initialLat && initialLng) {
            const newPos = [parseFloat(initialLat), parseFloat(initialLng)];
            if (newPos[0] !== position[0] || newPos[1] !== position[1]) {
                setPosition(newPos);
            }
        }
    }, [initialLat, initialLng]);

    const handleLocationSelect = async (lat, lng) => {
        const newPos = [lat, lng];
        setPosition(newPos);
        setIsLoading(true);

        try {
            // Reverse geocoding using Nominatim (free)
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
            );
            const data = await response.json();

            const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || 'Unknown Location';
            const displayName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

            setAddress(displayName);
            onLocationChange({
                lat,
                lng,
                locationName: city,
                fullAddress: displayName
            });
        } catch (error) {
            console.error('Error in reverse geocoding:', error);
            onLocationChange({
                lat,
                lng,
                locationName: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
                fullAddress: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="h-[300px] w-full rounded-xl overflow-hidden border-2 border-purple-100 shadow-inner relative z-0">
                <MapContainer
                    center={position}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <Marker position={position} />
                    <MapEventsHandler onLocationSelect={handleLocationSelect} />
                    <ChangeView center={position} />
                </MapContainer>
            </div>

            {isLoading ? (
                <p className="text-sm text-purple-600 animate-pulse">Fetching address details...</p>
            ) : address ? (
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                    <p className="text-sm text-gray-700 italic">
                        <span className="font-semibold text-purple-700 not-italic">Selected:</span> {address}
                    </p>
                </div>
            ) : (
                <p className="text-sm text-gray-500 italic text-center">Click on the map to pick a location</p>
            )}
        </div>
    );
};

export default LocationPicker;
