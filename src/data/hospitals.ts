export type Hospital = {
  _id: string;
  name: string;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  director: string;
  email: string;
  phone: string;
  departments: {
    _id: string;
    name: string;
    location: string;
    hod: string;
    beds: number[];
    doctors: string[];
  }[];
  inventory: any[];
  equipments: any[];
  cases: string[];
};

export const calculateBedStats = (departments: Hospital["departments"]) => {
  const totalBeds = departments.reduce(
    (total, dept) => total + dept.beds.length,
    0,
  );
  const occupiedBeds = departments.reduce(
    (total, dept) => total + dept.beds.filter((bed) => bed === 1).length,
    0,
  );
  const availableBeds = totalBeds - occupiedBeds;
  const occupancyPercentage =
    totalBeds === 0 ? "0%" : `${Math.round((occupiedBeds / totalBeds) * 100)}%`;

  return {
    totalBeds,
    availableBeds,
    occupancyPercentage,
  };
};
