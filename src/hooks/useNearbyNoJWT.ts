import { useQuery } from "@tanstack/react-query";
import { Hospital } from "~/lib/types";

interface Coordinates {
  lat: number;
  lng: number;
  shouldFly?: boolean;
}

export const useNearbyNoJWT = (coordinates: Coordinates | null) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["nearby-hospitals-Nojwt", coordinates],
    queryFn: async () => {
      const response = await fetch("/api/getNearby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lat: coordinates?.lat,
          long: coordinates?.lng,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.hospitals;
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
