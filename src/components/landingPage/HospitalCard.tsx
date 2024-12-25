import React from "react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { useAtom } from "jotai";
import { destinationAtom } from "~/store/atom";
import { Hospital } from "~/lib/types";
import Link from "next/link";

interface HospitalCardProps {
  hospital: Hospital;
  isSelected: boolean;
}

const HospitalCard = ({ hospital, isSelected }: HospitalCardProps) => {
  const [, setDestination] = useAtom(destinationAtom);

  const departments = Array.isArray(hospital.departments)
    ? hospital.departments
    : [];

  const calculateBedStats = () => {
    if (!departments.length) {
      return {
        totalBeds: 0,
        availableBeds: 0,
      };
    }

    const totalBeds = departments.reduce(
      (acc: number, dept) => acc + (dept.beds?.length || 0),
      0,
    );
    const availableBeds = departments.reduce(
      (acc: number, dept) =>
        acc + (dept.beds?.filter((bed) => bed === 0).length || 0),
      0,
    );
    return { totalBeds, availableBeds };
  };

  const { totalBeds, availableBeds } = calculateBedStats();

  const handleSelect = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const [lng, lat] = hospital.location.coordinates;
    setDestination({ lat, lng });
  };

  return (
    <div
      onClick={handleSelect}
      className={`relative cursor-pointer rounded-lg border p-4 transition-all hover:border-primary ${
        isSelected ? "border-2 border-dashed border-primary" : "border-border"
      }`}
    >
      <div className="flex justify-between">
        <h3 className="text-xl font-semibold">{hospital.name}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(`tel:${hospital.phone}`)}
        >
          Call Now
        </Button>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">{hospital.address}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {departments.map((dept) => (
          <Badge key={dept._id} variant="secondary">
            {dept.name}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-green-600">
            {availableBeds} beds
          </span>{" "}
          available / {totalBeds} total
        </div>
        <Link href="/admin">
          <Button>Book Appointment</Button>
        </Link>
      </div>
    </div>
  );
};

export default HospitalCard;
