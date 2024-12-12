import axios from "axios";

export const apiInstance = axios.create({
  baseURL: "http://localhost:1001",
  responseType: "json",
});

apiInstance.interceptors.request.use((reqPayload) => {
  const token = localStorage.getItem("token");
  console.log("Token:", token);
  if (token) {
    reqPayload.headers.Authorization = `Bearer ${token}`;
  }
  return reqPayload;
});
