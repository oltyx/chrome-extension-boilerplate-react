// src/pages/MapPicker/MapPicker.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon issue
L.Marker.prototype.options.icon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow
});

interface MapPickerProps {
    latitude: number;
    longitude: number;
    onLocationChange: (lat: number, lng: number) => void;
}

const MapPicker: React.FC<MapPickerProps> = ({ latitude, longitude, onLocationChange }) => {
    const mapRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (mapRef.current) {
            const provider = new OpenStreetMapProvider();
            const searchControl = new GeoSearchControl({
                provider,
                style: 'bar',
                showMarker: true,
                showPopup: false,
                autoClose: true,
                retainZoomLevel: false,
                animateZoom: true,
                keepResult: true
            });
            mapRef.current.addControl(searchControl);
        }
    }, []);

    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                onLocationChange(e.latlng.lat, e.latlng.lng);
            }
        });

        return latitude !== null && longitude !== null ? (
            <Marker position={[latitude, longitude]}></Marker>
        ) : null;
    };

    return (
        <MapContainer
            center={[latitude, longitude]}
            zoom={13}
            style={{ height: '400px', width: '100%' }}
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker />
        </MapContainer>
    );
};

export default MapPicker;
