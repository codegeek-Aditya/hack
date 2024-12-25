import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { Hospital } from "~/lib/types";

interface Coordinates {
  lat: number;
  lng: number;
  shouldFly?: boolean;
}

export const useNearbyHospitals = (coordinates: Coordinates | null) => {
  const api = useApi();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nearby-hospitals", coordinates],
    queryFn: async () => {
      const response = await api.post<{ hospitals: Hospital[] }>(
        "api/hospital/getNearby",
        {
          lat: coordinates?.lat,
          long: coordinates?.lng,
        },
      );
      return response.hospitals;
    },
    enabled: !!coordinates?.lat && !!coordinates?.lng,
  });

  return {
    hospitals: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
