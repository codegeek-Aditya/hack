"use client";

import React, { useState, useRef, useEffect } from "react";
import Map, { Marker, NavigationControl } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const INITIAL_VIEW_STATE = {
  longitude: 77.1025,
  latitude: 28.7041,
  zoom: 14,
  bearing: 0,
  pitch: 0,
};

interface HospitalLocationMapProps {
  onLocationSelect: (location: { lat: number; lng: number }) => void;
  selectedLocation?: { lat: number; lng: number } | null;
}

const HospitalLocationMap = ({
  onLocationSelect,
  selectedLocation,
}: HospitalLocationMapProps) => {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const mapRef = useRef(null);

  const access_token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (selectedLocation?.lat && selectedLocation?.lng) {
      setMarkerPosition(selectedLocation);
      setViewState((prev) => ({
        ...prev,
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
        zoom: 16,
      }));
    }
  }, [selectedLocation]);

  const handleMapClick = (event: any) => {
    const { lat, lng } = event.lngLat;
    setMarkerPosition({ lat, lng });
    onLocationSelect({ lat, lng });
  };

  if (!access_token) {
    return <div>Missing Mapbox access token</div>;
  }

  return (
    <div className="relative h-full w-full">
      <Map
        ref={mapRef}
        {...viewState}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={access_token}
        style={{ width: "100%", height: "100%" }}
        onMove={(evt) => setViewState(evt.viewState)}
        maxZoom={20}
        minZoom={3}
        maxPitch={85}
        maxBounds={[
          [76.2, 28.2],
          [77.8, 29.2],
        ]}
        onClick={handleMapClick}
      >
        <NavigationControl position="top-right" />

        {markerPosition && (
          <Marker
            latitude={markerPosition.lat}
            longitude={markerPosition.lng}
            color="red"
          />
        )}
      </Map>
    </div>
  );
};

export default HospitalLocationMap;
