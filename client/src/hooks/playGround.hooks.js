import { apiInstance } from '../api/index';
import { useMutation, useQueryClient} from '@tanstack/react-query';

export const useCreatPlayGround = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({image}) => {
        const { data } = await apiInstance.post("/playground/create", {
            image
        });

        return data;
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["playGround"] });
      },
    });
    return mutation;
  };
