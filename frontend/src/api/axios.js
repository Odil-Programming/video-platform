import axios from "axios";


const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://127.0.0.1:8000/api/";


const api = axios.create({
  baseURL: BASE_URL,
});


api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem(
      "accessToken",
    );

    if (accessToken) {
      config.headers.Authorization =
        `Bearer ${accessToken}`;
    }

    return config;
  },
);


export default api;