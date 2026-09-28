import api from "./axios";


export async function getNotifications() {
  const response = await api.get(
    "/notifications/",
  );

  return response.data;
}


export async function getUnreadCount() {
  const response = await api.get(
    "/notifications/unread-count/",
  );

  return response.data;
}


export async function markNotificationAsRead(
  notificationId,
) {
  const response = await api.patch(
    `/notifications/${notificationId}/read/`,
  );

  return response.data;
}


export async function markAllNotificationsAsRead() {
  const response = await api.patch(
    "/notifications/read-all/",
  );

  return response.data;
}