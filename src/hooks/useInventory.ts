import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { Stock } from "../lib/types";
import { useUser } from "./useUser";
import { toast } from "./use-toast";

export const useInventory = () => {
  const api = useApi();
  const { user } = useUser();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["Inventory"],
    queryFn: async () => {
      const response = await api.get<{ inventory: Stock[] }>(
        `api/stock/getByHospitalId/${user?.hospitalId}`,
      );
      console.log(response.inventory);
      return response.inventory;
    },
  });

  return {
    stockInventory: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};
