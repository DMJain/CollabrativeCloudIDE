import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { apiInstance } from "../api/index";

export const useSignup = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({ firstName, lastName, email, password }) => {
        const { data } = await apiInstance.post("/auth/sign-up", {
          firstName,
          lastName,
          email,
          password,
        });
        const token = data.data.token;
        if (token) localStorage.setItem("token", token);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    });
    return mutation;
  };
  
  export const useSignin = () => {
    const queryClient = useQueryClient();
  
    const mutation = useMutation({
      mutationFn: async ({ email, password }) => {
        const { data } = await apiInstance.post("/auth/sign-in", {
          email,
          password,
        });
        const token = data.data.token;
        if (token) localStorage.setItem("token", token);
      },
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ["user"] });
      },
    });
    return mutation;
  };
  
  export const useLoggedInUser = () => {
    return useQuery({
      queryKey: ["user"],
      queryFn: async () => {
        try {
          const { data } = await apiInstance.get("/auth/current-user");
          // console.log("User data:", data); // Debugging line
          if (!data.isLoggedIn) return false;
          return data.data.user;
        } catch (error) {
          console.error("Error fetching user data:", error); // Error handling
          return null;
        }
      },
    });
  };
  
  export const useSignOut = () => {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
  
    return useMutation({
      mutationFn: async () => {
        // Removing the token from localStorage
        localStorage.removeItem("token");
  
        // Clear user data from the cache
        queryClient.setQueryData("user", null);
  
        // Optionally invalidate queries if multiple queries are involved
        queryClient.invalidateQueries("user");
      },
      onSuccess: () => {
        // Redirecting to sgin-in page
        navigate("/sign-in", { replace: true });
      },
    });
  };
  