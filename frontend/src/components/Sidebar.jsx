import {
  Link,
  useLocation,
} from "react-router-dom";

import "../styles/sidebar.css";


function SidebarLink({
  to,
  icon,
  children,
  onNavigate,
}) {
  const location = useLocation();

  const isActive =
    to === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(to);


  return (
    <Link
      to={to}
      onClick={onNavigate}
      className={
        isActive
          ? "sidebar__link sidebar__link--active"
          : "sidebar__link"
      }
    >
      <span className="sidebar__icon">
        {icon}
      </span>

      <span>{children}</span>
    </Link>
  );
}


export default function Sidebar({
  isOpen,
  onClose,
}) {
  return (
    <>
      {isOpen && (
        <div
          className="sidebar__overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={
          isOpen
            ? "sidebar sidebar--open"
            : "sidebar"
        }
      >
        <section className="sidebar__section">
          <SidebarLink
            to="/"
            icon="⌂"
            onNavigate={onClose}
          >
            Главная
          </SidebarLink>

          <SidebarLink
            to="/upload"
            icon="⇧"
            onNavigate={onClose}
          >
            Загрузить видео
          </SidebarLink>

          <SidebarLink
            to="/notifications"
            icon="♟"
            onNavigate={onClose}
          >
            Уведомления
          </SidebarLink>

          <SidebarLink
            to="/profile"
            icon="◉"
            onNavigate={onClose}
          >
            Личный кабинет
          </SidebarLink>
        </section>

        <section className="sidebar__section">
          <h2 className="sidebar__section-title">
            Коллекции
          </h2>

          <a
            href="#history"
            className="sidebar__link"
            onClick={onClose}
          >
            <span className="sidebar__icon">
              ◷
            </span>

            <span>История</span>
          </a>

          {/* <a
            href="#subscriptions"
            className="sidebar__link"
            onClick={onClose}
          >
            <span className="sidebar__icon">
              ☆
            </span>

            <span>Подписки</span>
          </a> */}
        </section>
      </aside>
    </>
  );
}