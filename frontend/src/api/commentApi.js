import api from "./axios";


export async function getComments(
  videoId,
) {
  const response = await api.get(
    "/comments/",
    {
      params: {
        video: videoId,
      },
    },
  );

  return response.data;
}


export async function createComment(
  videoId,
  text,
) {
  const response = await api.post(
    "/comments/",
    {
      video: videoId,
      text,
    },
  );

  return response.data;
}


export async function deleteComment(
  commentId,
) {
  const response = await api.delete(
    `/comments/${commentId}/`,
  );

  return response.data;
}