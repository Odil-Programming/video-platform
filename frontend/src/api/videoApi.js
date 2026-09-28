import api from "./axios";


export async function getLatestVideos() {
  const response = await api.get(
    "/videos/latest/",
  );

  return response.data;
}


export async function uploadVideoFile({
  title,
  description,
  category,
  videoFile,
  thumbnail = null,
}) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("video_file", videoFile);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.post(
    "/videos/",
    formData,
  );

  return response.data;
}


export async function uploadVideoByUrl({
  title,
  description,
  category,
  videoUrl,
  thumbnail = null,
}) {
  const formData = new FormData();

  formData.append("title", title);
  formData.append("description", description);
  formData.append("category", category);
  formData.append("video_url", videoUrl);

  if (thumbnail) {
    formData.append("thumbnail", thumbnail);
  }

  const response = await api.post(
    "/videos/",
    formData,
  );

  return response.data;
}


export async function getVideos(
  params = {},
) {
  const response = await api.get(
    "/videos/",
    {
      params,
    },
  );

  return response.data;
}


export async function getVideo(id) {
  const response = await api.get(
    `/videos/${id}/`,
  );

  return response.data;
}


export async function addVideoView(id) {
  const response = await api.post(
    `/videos/${id}/view/`,
  );

  return response.data;
}


export async function getMyVideos(
  params = {},
) {
  const response = await api.get(
    "/videos/my/",
    {
      params,
    },
  );

  return response.data;
}


export async function getRecommendations(
  videoId,
) {
  const response = await api.get(
    `/videos/${videoId}/recommendations/`,
  );

  return response.data;
}