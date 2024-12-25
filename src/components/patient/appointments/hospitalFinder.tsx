"use client";

import { useState, useMemo } from "react";
import { Search, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

interface Hospital {
  id: number;
  name: string;
  speciality: string;
  doctor: string;
  distance: number;
  selected?: boolean;
}

const hospitals: Hospital[] = [
  {
    id: 1,
    name: "Aakshary Hospital",
    speciality: "Pediatrics",
    doctor: "Dr. Smith",
    distance: 3,
    selected: true,
  },
  {
    id: 2,
    name: "Swastik Hospital",
    speciality: "Child Specialist",
    doctor: "Dr. Gandhi",
    distance: 5,
  },
  {
    id: 3,
    name: "Shridhar Hospital",
    speciality: "Gynecologist",
    doctor: "Dr. Patel",
    distance: 7,
  },
  {
    id: 4,
    name: "City General Hospital",
    speciality: "General Medicine",
    doctor: "Dr. Johnson",
    distance: 4,
  },
  {
    id: 5,
    name: "Family Care Center",
    speciality: "Family Medicine",
    doctor: "Dr. Williams",
    distance: 2,
  },
  {
    id: 6,
    name: "Heart & Vascular Institute",
    speciality: "Cardiology",
    doctor: "Dr. Chen",
    distance: 6,
  },
  {
    id: 7,
    name: "Orthopedic Specialists",
    speciality: "Orthopedics",
    doctor: "Dr. Miller",
    distance: 8,
  },
  {
    id: 8,
    name: "Women's Wellness Center",
    speciality: "Obstetrics",
    doctor: "Dr. Garcia",
    distance: 5,
  },
];

export function NearbyHospitals() {
  const [selectedHospital, setSelectedHospital] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialties, setSelectedSpecialties] = useState<string[]>([]);

  // Get unique specialties for filter dropdown
  const specialties = useMemo(() => {
    return Array.from(new Set(hospitals.map((h) => h.speciality)));
  }, []);

  // Filter hospitals based on search and speciality filters
  const filteredHospitals = useMemo(() => {
    let filtered = hospitals;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (hospital) =>
          hospital.name.toLowerCase().includes(query) ||
          hospital.doctor.toLowerCase().includes(query) ||
          hospital.speciality.toLowerCase().includes(query),
      );
    }

    // Apply speciality filters
    if (selectedSpecialties.length > 0) {
      filtered = filtered.filter((hospital) =>
        selectedSpecialties.includes(hospital.speciality),
      );
    }

    // Apply selected hospital filter
    if (selectedHospital) {
      filtered = filtered.filter(
        (hospital) => hospital.id === selectedHospital,
      );
    }

    return filtered;
  }, [searchQuery, selectedSpecialties, selectedHospital]);

  const handleHospitalClick = (hospitalId: number) => {
    setSelectedHospital((currentSelected) =>
      currentSelected === hospitalId ? null : hospitalId,
    );
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search hospitals..."
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Filters</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {specialties.map((speciality) => (
              <DropdownMenuCheckboxItem
                key={speciality}
                checked={selectedSpecialties.includes(speciality)}
                onCheckedChange={(checked) => {
                  setSelectedSpecialties((prev) =>
                    checked
                      ? [...prev, speciality]
                      : prev.filter((s) => s !== speciality),
                  );
                }}
              >
                {speciality}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="max-h-[350px] overflow-y-auto rounded-lg border">
        {filteredHospitals.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No hospitals found
          </div>
        ) : (
          filteredHospitals.map((hospital) => (
            <div
              key={hospital.id}
              className="flex cursor-pointer items-center border-b p-4 transition-colors last:border-b-0 hover:bg-muted"
              onClick={() => handleHospitalClick(hospital.id)}
            >
              <div className="flex w-6 flex-shrink-0 items-center justify-center">
                {(hospital.selected || hospital.id === selectedHospital) && (
                  <Check className="mr-2 h-4 w-4 text-primary" />
                )}
              </div>
              <div className="ml-2">
                <h3 className="font-medium">{hospital.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {hospital.speciality}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hospital.doctor}
                </p>
                <p className="text-sm text-muted-foreground">
                  {hospital.distance} km
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
