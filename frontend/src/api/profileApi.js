import api from "./axios";

export async function getMyVideos() {
  const response = await api.get(
    "/videos/",
  );

  return response.data;
}