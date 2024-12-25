import { useAtom } from "jotai";
import React, { useEffect, useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { sourceAtom } from "~/store/atom";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { MapPin } from "lucide-react";

interface MapboxSuggestion {
  name?: string;
  full_address?: string;
  place_formatted?: string;
  mapbox_id: string;
}

interface MapboxResponse {
  suggestions: MapboxSuggestion[];
}

interface MapboxRetrieveResponse {
  features: Array<{
    geometry: {
      coordinates: [number, number];
    };
  }>;
}

const SearchBox: React.FC = () => {
  const [inputValue, setInputValue] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<string>("");
  const [toAddressList, setToAddressList] = useState<MapboxSuggestion[]>([]);
  const [source, setSource] = useAtom(sourceAtom);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (inputValue === selectedAddress) {
      return;
    }

    if (inputValue) {
      const timeoutId = setTimeout(() => {
        getAddress(inputValue, setToAddressList);
      }, 1000);
      setSearchTimeout(timeoutId);
    } else {
      setToAddressList([]);
    }

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [inputValue, selectedAddress]);

  const getUserLocation = (): void => {
    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        setSource({
          lat: latitude,
          lng: longitude,
          shouldFly: true,
        });
      },
      (error: GeolocationPositionError) =>
        console.log("Error getting location:", error),
      { enableHighAccuracy: true },
    );
  };

  const BASE_URL = "https://api.mapbox.com/search/searchbox/v1";
  const MAPBOX_ACCESS_TOKEN = process.env
    .NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string;

  const getAddress = async (
    query: string,
    setAddressList: (suggestions: MapboxSuggestion[]) => void,
  ): Promise<void> => {
    try {
      const session_token = uuidv4();
      const response = await fetch(
        `${BASE_URL}/suggest?q=${query}&language=en&limit=5&session_token=${session_token}&country=IN&proximity=77.1025,28.7041&bbox=76.2,28.2,77.8,29.2&types=address,place,poi&access_token=${MAPBOX_ACCESS_TOKEN}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      const data = (await response.json()) as MapboxResponse;
      setAddressList(data.suggestions);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleToAddressClick = async (
    address: MapboxSuggestion,
  ): Promise<void> => {
    const addressText = address.name || address.full_address || "";
    setSelectedAddress(addressText);
    setInputValue(addressText);
    setToAddressList([]);
    inputRef.current?.blur();
    await getSourceLongLat(address.mapbox_id);
  };

  const getSourceLongLat = async (mapBoxId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${BASE_URL}/retrieve/${mapBoxId}?session_token=1234&access_token=${MAPBOX_ACCESS_TOKEN}`,
      );
      const data = (await response.json()) as MapboxRetrieveResponse;
      const latLong = data.features[0].geometry;
      setSource({
        lat: latLong.coordinates[1],
        lng: latLong.coordinates[0],
        shouldFly: true,
      });
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setInputValue(value);
    if (value !== selectedAddress) {
      setSelectedAddress("");
    }
    if (!value) {
      setToAddressList([]);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Enter your location"
          className="flex-1"
        />
        <Button
          variant="outline"
          size="icon"
          onClick={getUserLocation}
          className="shrink-0"
        >
          <MapPin className="h-4 w-4" />
        </Button>
      </div>

      {toAddressList.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          {toAddressList
            .filter((item) => item?.name || item?.full_address)
            .map((item, index) => {
              const mainText = item.name || item.place_formatted || "";
              const subText =
                item.place_formatted !== mainText ? item.place_formatted : "";

              return (
                <div
                  onClick={() => handleToAddressClick(item)}
                  className="cursor-pointer p-2 hover:bg-muted"
                  key={index}
                >
                  <div className="font-medium">{mainText}</div>
                  {subText && (
                    <div className="text-xs text-muted-foreground">
                      {subText}
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
