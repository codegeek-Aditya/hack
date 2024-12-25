import { useQuery } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { Hospital } from "~/lib/types";

export const useHospitals = () => {
  const api = useApi();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["hospitals"],
    queryFn: async () => {
      const response = await api.get<{ hospitals: Hospital[] }>(
        "api/hospital/getAll",
      );

      const transformedHospitals = response.hospitals.map((hospital) => {
        const depts =
          hospital.departments && "$each" in hospital.departments
            ? hospital.departments.$each
            : hospital.departments;

        return {
          ...hospital,
          departments: Array.isArray(depts) ? depts : [],
        };
      });

      return transformedHospitals;
    },
  });

  return {
    hospitals: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
