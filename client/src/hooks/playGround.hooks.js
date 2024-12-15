import { apiInstance } from '../api/index';
import { useMutation, useQueryClient, useQuery} from '@tanstack/react-query';

export const useCreatPlayGround = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({image}) => {
        const { data } = await apiInstance.post("/playground/create", {
            image,
            "userId" : "1234",
            "projectId" : "12"
        });

        return data;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["playGround"] });
      },
    });
    return mutation;
  };

  export const useGetPlayGround = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({id}) => {
        const { data } = await apiInstance.post(`/playground/${id}`, {
            projectID : `${id}`
        });

        return data;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["playGround"] });
      },
    });
    return mutation;
}

  export const useGetAllPlayGround = () => {
    return useQuery({
      queryKey: ['playGround'],
      queryFn: async () => {
          try {
              const { data } = await apiInstance.get('/playground/list');
              if (data.status === 'success') {
                  return data.data || []; // Ensure a default empty array if `user` is undefined
              } else {
                  console.warn('Failed to fetch PlayGround:', data.message);
                  return []; // Return an empty array on failure
              }
          } catch (error) {
              console.error('Error fetching PlayGround:', error); // Handle errors
              return []; // Return an empty array on error
          }
      },
  });
  }

  export const useDeletePlayGround = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({containerId}) => {
        const { data } = await apiInstance.post("/playground/delete", {
            containerId : `${containerId}`
        });

        return data;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["playGround"] });
      },
    });
    return mutation;
  };