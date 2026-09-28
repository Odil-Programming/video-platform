import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  Link,
} from "react-router-dom";


import {
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notificationApi";


import "../styles/notifications-page.css";


function getNotificationTypeLabel(type) {
  const labels = {
    video_submitted: "Видео отправлено",
    video_approved: "Видео опубликовано",
    video_rejected: "Видео отклонено",
  };

  return labels[type] || "Уведомление";
}


function getNotificationIcon(type) {
  const icons = {
    video_submitted: "⇧",
    video_approved: "✓",
    video_rejected: "!",
  };

  return icons[type] || "●";
}


function getNotificationIconClass(type) {
  const classes = {
    video_submitted:
      "notification-card__icon notification-card__icon--submitted",

    video_approved:
      "notification-card__icon notification-card__icon--approved",

    video_rejected:
      "notification-card__icon notification-card__icon--rejected",
  };

  return (
    classes[type] ||
    "notification-card__icon"
  );
}


function formatNotificationDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString(
    "ru-RU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}


export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [markingAll, setMarkingAll] =
    useState(false);

  const [markingId, setMarkingId] =
    useState(null);

  const [activeFilter, setActiveFilter] =
    useState("all");

  const [error, setError] =
    useState("");


  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      try {
        setLoading(true);
        setError("");

        const data = await getNotifications();

        const items = Array.isArray(data)
          ? data
          : data?.results || [];

        if (isMounted) {
          setNotifications(items);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки уведомлений:",
          error,
        );

        if (isMounted) {
          setError(
            "Не удалось загрузить уведомления.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadNotifications();

    return () => {
      isMounted = false;
    };
  }, []);


  const unreadCount = useMemo(() => {
    return notifications.filter(
      (notification) =>
        !notification.is_read,
    ).length;
  }, [notifications]);


  const filteredNotifications = useMemo(() => {
    if (activeFilter === "unread") {
      return notifications.filter(
        (notification) =>
          !notification.is_read,
      );
    }

    if (activeFilter === "read") {
      return notifications.filter(
        (notification) =>
          notification.is_read,
      );
    }

    return notifications;
  }, [
    notifications,
    activeFilter,
  ]);


  async function handleRead(notificationId) {
    const currentNotification =
      notifications.find(
        (notification) =>
          notification.id === notificationId,
      );

    if (
      !currentNotification ||
      currentNotification.is_read
    ) {
      return;
    }

    try {
      setMarkingId(notificationId);
      setError("");

      const updatedNotification =
        await markNotificationAsRead(
          notificationId,
        );

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id ===
          updatedNotification.id
            ? updatedNotification
            : notification,
        ),
      );
    } catch (error) {
      console.error(
        "Ошибка обновления уведомления:",
        error,
      );

      setError(
        "Не удалось отметить уведомление "
        + "как прочитанное.",
      );
    } finally {
      setMarkingId(null);
    }
  }


  async function handleReadAll() {
    if (unreadCount === 0) {
      return;
    }

    try {
      setMarkingAll(true);
      setError("");

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          is_read: true,
        })),
      );
    } catch (error) {
      console.error(
        "Ошибка обновления уведомлений:",
        error,
      );

      setError(
        "Не удалось отметить все уведомления "
        + "как прочитанные.",
      );
    } finally {
      setMarkingAll(false);
    }
  }


  return (
    <main className="notifications-page">
      <div className="notifications-page__container">
        <section className="notifications-page__header">
          <div>
            <p className="notifications-page__eyebrow">
              Личный кабинет
            </p>

            <h1>
              Уведомления
            </h1>

            <p>
              Следите за статусом ваших видео
              и новыми событиями платформы.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              className="notifications-page__read-all"
              disabled={markingAll}
              onClick={handleReadAll}
            >
              {markingAll
                ? "Обновление..."
                : "✓ Прочитать все"}
            </button>
          )}
        </section>


        {!loading && !error && (
          <section className="notifications-summary">
            <div className="notifications-summary__item">
              <span>
                Всего
              </span>

              <strong>
                {notifications.length}
              </strong>
            </div>

            <div className="notifications-summary__item notifications-summary__item--unread">
              <span>
                Непрочитанных
              </span>

              <strong>
                {unreadCount}
              </strong>
            </div>

            <div className="notifications-summary__item">
              <span>
                Прочитанных
              </span>

              <strong>
                {notifications.length -
                  unreadCount}
              </strong>
            </div>
          </section>
        )}


        <section className="notifications-panel">
          <div className="notifications-panel__top">
            <div>
              <h2>
                Все уведомления
              </h2>

              <p>
                Новые события отображаются
                первыми.
              </p>
            </div>

            <div className="notifications-filters">
              <button
                type="button"
                onClick={() =>
                  setActiveFilter("all")
                }
                className={
                  activeFilter === "all"
                    ? "notifications-filter notifications-filter--active"
                    : "notifications-filter"
                }
              >
                Все
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("unread")
                }
                className={
                  activeFilter === "unread"
                    ? "notifications-filter notifications-filter--active"
                    : "notifications-filter"
                }
              >
                Непрочитанные
              </button>

              <button
                type="button"
                onClick={() =>
                  setActiveFilter("read")
                }
                className={
                  activeFilter === "read"
                    ? "notifications-filter notifications-filter--active"
                    : "notifications-filter"
                }
              >
                Прочитанные
              </button>
            </div>
          </div>


          {loading && (
            <div className="notifications-message">
              Загрузка уведомлений...
            </div>
          )}


          {!loading && error && (
            <div className="notifications-message notifications-message--error">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            filteredNotifications.length === 0 && (
              <div className="notifications-empty">
                <div className="notifications-empty__icon">
                  ✓
                </div>

                <h3>
                  Уведомлений нет
                </h3>

                <p>
                  Здесь появятся уведомления
                  о статусе ваших видео.
                </p>

                <Link to="/upload">
                  Загрузить видео
                </Link>
              </div>
            )}


          {!loading &&
            !error &&
            filteredNotifications.length > 0 && (
              <div className="notifications-list">
                {filteredNotifications.map(
                  (notification) => (
                    <article
                      key={notification.id}
                      className={
                        notification.is_read
                          ? "notification-card"
                          : "notification-card notification-card--unread"
                      }
                    >
                      <div className="notification-card__main">
                        <span
                          className={getNotificationIconClass(
                            notification.notification_type,
                          )}
                        >
                          {getNotificationIcon(
                            notification.notification_type,
                          )}
                        </span>

                        <div className="notification-card__content">
                          <div className="notification-card__title-row">
                            <strong>
                              {notification.title ||
                                getNotificationTypeLabel(
                                  notification.notification_type,
                                )}
                            </strong>

                            {!notification.is_read && (
                              <span className="notification-card__new">
                                Новое
                              </span>
                            )}
                          </div>

                          <p className="notification-card__message">
                            {notification.message}
                          </p>

                          <div className="notification-card__meta">
                            <span>
                              {getNotificationTypeLabel(
                                notification.notification_type,
                              )}
                            </span>

                            <span>
                              •
                            </span>

                            <span>
                              {formatNotificationDate(
                                notification.created_at,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>


                      <div className="notification-card__actions">
                        {!notification.is_read && (
                          <button
                            type="button"
                            className="notification-card__read-button"
                            disabled={
                              markingId ===
                              notification.id
                            }
                            onClick={() =>
                              handleRead(
                                notification.id,
                              )
                            }
                          >
                            {markingId ===
                            notification.id
                              ? "..."
                              : "Прочитать"}
                          </button>
                        )}

                        {notification.notification_type ===
                          "video_rejected" && (
                          <span className="notification-card__rejected-status">
                            Видео недоступно
                          </span>
                        )}
                      </div>
                    </article>
                  ),
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}