import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useApi } from "./useApi";
import { toast } from "./use-toast";

export const useDisposable = () => {
  const api = useApi();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["disposable"],
    queryFn: async () => {
      const response = await api.get<{ result: any }>(
        `api/stock/disposable/getAll`,
      );
      console.log(response.result);
      return response.result.issued;
    },
  });

  return {
    disposables: data ?? [],
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
};

export const useCreateDisposable = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (formData: {
      userName: string;
      itemId: string;
      quantity: number;
      hazardType: string;
    }) => {
      const response = await api.post("api/stock/disposable/create", formData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disposable"] });
      toast({
        title: "Disposable requested successfully",
        description: "Disposable requested successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error requesting disposable",
        description: "There was an error requesting the disposable",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export const useUpdateDisposable1 = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      isDisposed,
    }: {
      id: string;
      isDisposed: boolean;
    }) => {
      const response = await api.post("api/stock/disposable/update", {
        id,
        isDisposed,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disposable"] });
      toast({
        title: "Disposable updated",
        description: "Disposable status updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating disposable",
        description: "There was an error updating the disposable status",
        variant: "destructive",
      });
    },
  });

  return mutation;
};

export const useUpdateDisposable2 = () => {
  const api = useApi();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({
      id,
      isCollected,
    }: {
      id: string;
      isCollected: boolean;
    }) => {
      const response = await api.post("api/stock/disposable/update", {
        id,
        isCollected,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disposable"] });
      toast({
        title: "Disposable updated",
        description: "Disposable status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error updating disposable",
        description: "There was an error updating the disposable status",
        variant: "destructive",
      });
    },
  });

  return mutation;
};
