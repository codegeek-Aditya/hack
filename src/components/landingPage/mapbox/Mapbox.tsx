"use client";

import { useAtom } from "jotai";
import React, { useEffect, useState, useRef } from "react";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  MapRef,
  MapLayerMouseEvent,
  ErrorEvent,
} from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapRoute from "./MapRoute";
import { destinationAtom, directionAtom, sourceAtom } from "~/store/atom";
import { Button } from "~/components/ui/button";

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

interface LocationUpdate {
  lat: number;
  lng: number;
}

interface MapBoxProps {
  onLocationUpdate?: (location: LocationUpdate) => void;
}

interface SourceDestination {
  lat: number;
  lng: number;
  shouldFly?: boolean;
}

const INITIAL_VIEW_STATE: ViewState = {
  longitude: 77.1025,
  latitude: 28.7041,
  zoom: 14,
  bearing: 0,
  pitch: 0,
};

const MapBox: React.FC<MapBoxProps> = ({ onLocationUpdate }) => {
  const [source, setSource] = useAtom(sourceAtom);
  const [destinationLatLng, setDestinationLatLng] = useAtom(destinationAtom);
  const [direction, setDirection] = useAtom(directionAtom);
  const [travelTime, setTravelTime] = useState<number | null>(null);
  const [isJourneyStarted, setIsJourneyStarted] = useState<boolean>(false);
  const [viewState, setViewState] = useState<ViewState>(INITIAL_VIEW_STATE);

  const mapRef = useRef<MapRef>(null);
  const geolocateControlRef = useRef<mapboxgl.GeolocateControl | null>(null);

  const access_token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    if (!access_token) {
      console.log("Mapbox access token is missing!");
      return;
    }

    setSource({ lat: 28.7041, lng: 77.1025 });
  }, []);

  useEffect(() => {
    if (
      source?.lat &&
      source?.lng &&
      destinationLatLng?.lat &&
      destinationLatLng?.lng
    ) {
      const destination: SourceDestination = {
        lat: destinationLatLng.lat,
        lng: destinationLatLng.lng,
      };

      getDirections(source, destination);
    }
  }, [source, destinationLatLng]);

  useEffect(() => {
    if (destinationLatLng?.lat && destinationLatLng?.lng && mapRef.current) {
      mapRef.current.flyTo({
        center: [destinationLatLng.lng, destinationLatLng.lat],
        zoom: 15,
        pitch: 30,
        bearing: 0,
        duration: 2000,
        essential: true,
      });
    }
  }, [destinationLatLng]);

  useEffect(() => {
    if (source?.shouldFly && source?.lat && source?.lng && mapRef.current) {
      mapRef.current.flyTo({
        center: [source.lng, source.lat],
        zoom: 15,
        pitch: 30,
        bearing: 0,
        duration: 2000,
        essential: true,
      });
    }
  }, [source]);

  const getDirections = async (
    source: SourceDestination,
    destination: SourceDestination,
  ) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&access_token=${access_token}`,
      );
      const data = await response.json();
      if (data.routes && data.routes[0]) {
        setDirection(data.routes[0].geometry.coordinates);
        setTravelTime(Math.round(data.routes[0].duration / 60));
      }
    } catch (error) {
      console.log("Error fetching directions:", error);
    }
  };

  const handleGeolocate = (e: {
    coords?: { latitude: number; longitude: number };
  }) => {
    if (!e?.coords) return;

    const { latitude, longitude } = e.coords;
    setSource({
      lat: latitude,
      lng: longitude,
      shouldFly: !isJourneyStarted,
    });

    if (onLocationUpdate) {
      onLocationUpdate({ lat: latitude, lng: longitude });
    }
  };

  const startJourney = () => {
    setIsJourneyStarted(true);
    if (geolocateControlRef.current) {
      geolocateControlRef.current.trigger();
    }
  };

  const handleMapError = (e: ErrorEvent) => {
    console.log("Map interaction error:", e.error);
    if (mapRef.current) {
      mapRef.current.flyTo({
        ...INITIAL_VIEW_STATE,
        duration: 2000,
      });
    }
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
        onError={handleMapError}
        maxZoom={20}
        minZoom={3}
        maxPitch={85}
        maxBounds={[
          [76.2, 28.2],
          [77.8, 29.2],
        ]}
        onClick={(evt: MapLayerMouseEvent) => {
          if (evt.originalEvent) {
            evt.originalEvent.stopPropagation();
          }
        }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl
          ref={geolocateControlRef}
          position="top-right"
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onGeolocate={handleGeolocate}
        />

        {!isJourneyStarted && source?.lat && source?.lng && (
          <Marker latitude={source.lat} longitude={source.lng} color="red" />
        )}

        {destinationLatLng?.lat && destinationLatLng?.lng && (
          <Marker
            latitude={destinationLatLng.lat}
            longitude={destinationLatLng.lng}
            anchor="bottom"
          >
            <img
              className="h-12 w-12"
              src="https://res.cloudinary.com/dkysrpdi6/image/upload/v1717534056/pin_uov3cy.png"
              alt="Destination"
            />
          </Marker>
        )}

        {direction?.length > 0 && <MapRoute />}
      </Map>

      {travelTime && (
        <div className="absolute bottom-4 right-4 rounded border bg-background p-2 text-foreground shadow">
          Estimated travel time: {travelTime} minutes
        </div>
      )}

      {destinationLatLng?.lat && destinationLatLng?.lng && (
        <Button className="absolute bottom-4 left-4" onClick={startJourney}>
          Start Journey
        </Button>
      )}
    </div>
  );
};

export default MapBox;
