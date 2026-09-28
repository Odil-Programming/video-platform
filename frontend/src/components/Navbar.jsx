import {
  useEffect,
  useState,
} from "react";

import { Link } from "react-router-dom";

import { getUnreadCount } from "../api/notificationApi";
import { useAuth } from "../context/AuthContext";

import "../styles/navbar.css";


export default function Navbar({
  onMenuClick,
}) {
  const auth = useAuth();

  const user = auth?.user || null;
  const logout = auth?.logout;

  const [unreadCount, setUnreadCount] =
    useState(0);


  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;


    async function loadUnreadCount() {
      try {
        const data = await getUnreadCount();

        if (isMounted) {
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error(
          "Не удалось загрузить уведомления:",
          error,
        );
      }
    }

    loadUnreadCount();

    return () => {
      isMounted = false;
    };
  }, [user]);


  function handleLogout() {
    if (logout) {
      logout();
    }
  }


  const initial =
    user?.username?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U";


  return (
    <header className="navbar">
      <button
        type="button"
        className="navbar__menu-button"
        onClick={onMenuClick}
        aria-label="Открыть меню"
      >
        ☰
      </button>


      <Link
        to="/"
        className="navbar__brand"
      >
        Видео<span>Платформа</span>
      </Link>


      <div className="navbar__search">
        <input
          type="search"
          className="navbar__search-input"
          placeholder="Поиск видео..."
          aria-label="Поиск видео"
        />

        <button
          type="button"
          className="navbar__search-button"
          aria-label="Найти"
        >
          ⌕
        </button>
      </div>


      <div className="navbar__actions">
        {user ? (
          <>
            <Link
              to="/upload"
              className="navbar__upload-link"
            >
              + Добавить видео
            </Link>

            <Link
              to="/notifications"
              className="navbar__notification-link"
              aria-label="Уведомления"
            >
              ♟

              {unreadCount > 0 && (
                <span className="navbar__notification-badge">
                  {unreadCount > 99
                    ? "99+"
                    : unreadCount}
                </span>
              )}
            </Link>

            <div className="navbar__user">
              <div className="navbar__avatar">
                {initial}
              </div>

              <span className="navbar__username">
                {user.username ||
                  user.email}
              </span>

              <button
                type="button"
                className="navbar__logout-button"
                onClick={handleLogout}
              >
                Выйти
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="navbar__auth-link"
            >
              Войти
            </Link>

            <Link
              to="/register"
              className="navbar__upload-link"
            >
              Регистрация
            </Link>
          </>
        )}
      </div>
    </header>
  );
}