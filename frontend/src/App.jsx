import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";


import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import RegisterPage from "./pages/RegisterPage";
import UploadVideoPage from "./pages/UploadVideoPage";
import ProtectedRoute from "./components/ProtectedRoute";
import VideoDetailPage from "./pages/VideoDetailPage";


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={<MainLayout />}
        >
          <Route
            path="/"
            element={<HomePage />}
          />

          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={<RegisterPage />}
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/upload"
            element={
              <ProtectedRoute>
                <UploadVideoPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/videos/:id"
            element={<VideoDetailPage />}
          />
        </Route>

        <Route
          path="*"
          element={
            <main>
              <h1>Страница не найдена</h1>

              <a href="/">
                Вернуться на главную
              </a>
            </main>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}