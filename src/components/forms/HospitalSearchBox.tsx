"use client";

import React, { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { GoSearch } from "react-icons/go";

interface SearchResult {
  place_name: string;
  center: [number, number];
}

interface HospitalSearchBoxProps {
  onLocationSelect: (location: {
    lat: number;
    lng: number;
    address: string;
  }) => void;
}

const HospitalSearchBox = ({ onLocationSelect }: HospitalSearchBoxProps) => {
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const access_token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchText,
        )}.json?access_token=${access_token}&bbox=76.2,28.2,77.8,29.2&limit=5`,
      );
      const data = await response.json();
      setSearchResults(data.features);
      setShowResults(true);
    } catch (error) {
      console.log("Error searching location:", error);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const [lng, lat] = result.center;
    onLocationSelect({
      lat,
      lng,
      address: result.place_name,
    });
    setShowResults(false);
    setSearchText(result.place_name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    onLocationSelect({
      lat: 0,
      lng: 0,
      address: value,
    });
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <Input
          type="text"
          value={searchText}
          onChange={handleInputChange}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search for a location..."
          className="w-full"
        />
        <Button
          type="button"
          variant="outline"
          onClick={handleSearch}
          className="px-3"
        >
          <GoSearch className="h-4 w-4" />
        </Button>
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
          {searchResults.map((result, index) => (
            <div
              key={index}
              className="cursor-pointer p-2 hover:bg-muted"
              onClick={() => handleResultClick(result)}
            >
              {result.place_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HospitalSearchBox;
