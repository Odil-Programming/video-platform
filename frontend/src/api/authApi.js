import api from "./axios";

export async function registerUser(userData) {
  const response = await api.post(
    "/accounts/register/",
    userData,
  );

  return response.data;
}

export async function loginUser(username, password) {
  const response = await api.post(
    "/auth/token/",
    {
      username,
      password,
    },
  );

  localStorage.setItem(
    "accessToken",
    response.data.access,
  );

  localStorage.setItem(
    "refreshToken",
    response.data.refresh,
  );

  return response.data;
}

export async function getCurrentUser() {
  const response = await api.get(
    "/accounts/me/",
  );

  return response.data;
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem(
    "refreshToken",
  );

  const response = await api.post(
    "/auth/token/refresh/",
    {
      refresh: refreshToken,
    },
  );

  localStorage.setItem(
    "accessToken",
    response.data.access,
  );

  if (response.data.refresh) {
    localStorage.setItem(
      "refreshToken",
      response.data.refresh,
    );
  }

  return response.data;
}

export function logoutUser() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}