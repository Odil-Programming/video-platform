import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { getMyVideos } from "../api/videoApi";
import { useAuth } from "../context/AuthContext";

import { getMediaUrl } from "../api/mediaUrl";

import "../styles/profile-page.css";


function getStatusLabel(status) {
  const statusLabels = {
    pending: "На проверке",
    approved: "Опубликовано",
    rejected: "Отклонено",
  };

  return (
    statusLabels[status] ||
    status ||
    "Неизвестно"
  );
}


function getStatusClass(status) {
  if (status === "approved") {
    return "status-badge status-badge--approved";
  }

  if (status === "rejected") {
    return "status-badge status-badge--rejected";
  }

  return "status-badge status-badge--pending";
}


function formatViews(value) {
  const count = Number(value || 0);

  if (count >= 1000000) {
    return `${(
      count / 1000000
    ).toFixed(1)} млн`;
  }

  if (count >= 1000) {
    return `${(
      count / 1000
    ).toFixed(1)} тыс.`;
  }

  return count.toString();
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    "ru-RU",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  );
}


function getInitial(user) {
  return (
    user?.username?.charAt(0) ||
    user?.email?.charAt(0) ||
    "U"
  ).toUpperCase();
}


function getCategoryName(video) {
  if (
    video.category &&
    typeof video.category === "object"
  ) {
    return (
      video.category.name ||
      "Без категории"
    );
  }

  return (
    video.category_name ||
    video.category ||
    "Без категории"
  );
}


export default function ProfilePage() {
  const { user } = useAuth();

  const [videos, setVideos] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeStatus, setActiveStatus] =
    useState("all");

  const [search, setSearch] =
    useState("");


  useEffect(() => {
    let isMounted = true;


    async function loadVideos() {
      try {
        setLoading(true);
        setError("");

        const data = await getMyVideos();

        const videoItems = Array.isArray(data)
          ? data
          : data?.results || [];

        if (isMounted) {
          setVideos(videoItems);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки видео:",
          error,
        );

        if (isMounted) {
          setError(
            "Не удалось загрузить ваши видео.",
          );

          setVideos([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }


    loadVideos();


    return () => {
      isMounted = false;
    };
  }, []);


  const statistics = useMemo(() => {
    const total = videos.length;

    const approved = videos.filter(
      (video) =>
        video.status === "approved",
    ).length;

    const pending = videos.filter(
      (video) =>
        video.status === "pending",
    ).length;

    const rejected = videos.filter(
      (video) =>
        video.status === "rejected",
    ).length;

    const totalViews = videos.reduce(
      (sum, video) =>
        sum + Number(
          video.views_count || 0,
        ),
      0,
    );

    return {
      total,
      approved,
      pending,
      rejected,
      totalViews,
    };
  }, [videos]);


  const filteredVideos = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return videos.filter((video) => {
      const matchesStatus =
        activeStatus === "all" ||
        video.status === activeStatus;

      const matchesSearch =
        !normalizedSearch ||
        video.title
          ?.toLowerCase()
          .includes(normalizedSearch);

      return (
        matchesStatus &&
        matchesSearch
      );
    });
  }, [
    videos,
    activeStatus,
    search,
  ]);


  return (
    <main className="profile-page">
      <div className="profile-page__container">
        <section className="profile-hero">
          <div className="profile-hero__cover" />

          <div className="profile-hero__body">
            <div className="profile-avatar">
              {getInitial(user)}
            </div>

            <div className="profile-hero__info">
              <div className="profile-hero__name-row">
                <h1>
                  {user?.first_name ||
                    user?.username ||
                    "Пользователь"}{" "}
                  {user?.last_name || ""}
                </h1>

                <span className="profile-role">
                  PRO АВТОР
                </span>
              </div>

              <p className="profile-username">
                @{user?.username || "username"}
              </p>

              <p className="profile-email">
                {user?.email || "Email не указан"}
              </p>
            </div>

            <div className="profile-hero__actions">
              <Link
                to="/upload"
                className="profile-button profile-button--primary"
              >
                + Добавить видео
              </Link>

              <button
                type="button"
                className="profile-button profile-button--secondary"
                onClick={() =>
                  window.alert(
                    "Редактирование профиля добавим позже.",
                  )
                }
              >
                Редактировать профиль
              </button>
            </div>
          </div>
        </section>


        <section className="profile-stats">
          <div className="profile-stat">
            <span className="profile-stat__icon">
              ▣
            </span>

            <div>
              <strong>
                {statistics.total}
              </strong>

              <span>
                Всего видео
              </span>
            </div>
          </div>

          <div className="profile-stat">
            <span className="profile-stat__icon profile-stat__icon--green">
              ◉
            </span>

            <div>
              <strong>
                {formatViews(
                  statistics.totalViews,
                )}
              </strong>

              <span>
                Всего просмотров
              </span>
            </div>
          </div>

          <div className="profile-stat">
            <span className="profile-stat__icon profile-stat__icon--blue">
              ✓
            </span>

            <div>
              <strong>
                {statistics.approved}
              </strong>

              <span>
                Опубликовано
              </span>
            </div>
          </div>

          <div className="profile-stat">
            <span className="profile-stat__icon profile-stat__icon--orange">
              ◷
            </span>

            <div>
              <strong>
                {statistics.pending}
              </strong>

              <span>
                На проверке
              </span>
            </div>
          </div>
        </section>


        <section className="profile-management">
          <div className="profile-management__header">
            <div>
              <h2>
                Управление видео
              </h2>

              <p>
                Контролируйте статус,
                редактируйте и управляйте
                вашими видео.
              </p>
            </div>

            <div className="profile-management__search">
              <span>⌕</span>

              <input
                type="search"
                placeholder="Поиск по названию..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
              />
            </div>
          </div>


          <div className="profile-filters">
            <button
              type="button"
              className={
                activeStatus === "all"
                  ? "profile-filter profile-filter--active"
                  : "profile-filter"
              }
              onClick={() =>
                setActiveStatus("all")
              }
            >
              Все видео{" "}
              <span>
                {statistics.total}
              </span>
            </button>

            <button
              type="button"
              className={
                activeStatus === "approved"
                  ? "profile-filter profile-filter--active"
                  : "profile-filter"
              }
              onClick={() =>
                setActiveStatus("approved")
              }
            >
              Опубликовано{" "}
              <span>
                {statistics.approved}
              </span>
            </button>

            <button
              type="button"
              className={
                activeStatus === "pending"
                  ? "profile-filter profile-filter--active"
                  : "profile-filter"
              }
              onClick={() =>
                setActiveStatus("pending")
              }
            >
              На проверке{" "}
              <span>
                {statistics.pending}
              </span>
            </button>

            <button
              type="button"
              className={
                activeStatus === "rejected"
                  ? "profile-filter profile-filter--active"
                  : "profile-filter"
              }
              onClick={() =>
                setActiveStatus("rejected")
              }
            >
              Отклонено{" "}
              <span>
                {statistics.rejected}
              </span>
            </button>
          </div>


          {loading && (
            <div className="profile-message">
              Загрузка видео...
            </div>
          )}


          {!loading && error && (
            <div className="profile-message profile-message--error">
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            filteredVideos.length === 0 && (
              <div className="profile-message">
                Видео не найдены.
              </div>
            )}


          {!loading &&
            !error &&
            filteredVideos.length > 0 && (
              <div className="profile-video-list">
                {filteredVideos.map(
                  (video) => (
                    <ProfileVideoCard
                      key={video.id}
                      video={video}
                    />
                  ),
                )}
              </div>
            )}
        </section>
      </div>
    </main>
  );
}


function ProfileVideoCard({
  video,
}) {
  const thumbnailUrl = video.thumbnail
    ? getMediaUrl(video.thumbnail)
    : "";


  const categoryName =
    getCategoryName(video);


  return (
    <article className="profile-video-card">
      <Link
        to={`/videos/${video.id}`}
        className="profile-video-card__thumbnail"
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={video.title}
            loading="lazy"
          />
        ) : (
          <div className="profile-video-card__empty">
            Нет превью
          </div>
        )}

        <span className="profile-video-card__play">
          ▶
        </span>
      </Link>


      <div className="profile-video-card__body">
        <div className="profile-video-card__top">
          <div>
            <h3>
              {video.title}
            </h3>

            <p>
              {categoryName}
              {" • "}
              {formatDate(
                video.created_at,
              )}
            </p>
          </div>

          <span
            className={getStatusClass(
              video.status,
            )}
          >
            {getStatusLabel(
              video.status,
            )}
          </span>
        </div>


        <p className="profile-video-card__description">
          {video.description ||
            "Без описания"}
        </p>


        <div className="profile-video-card__footer">
          <span>
            {formatViews(
              video.views_count,
            )} просмотров
          </span>

          {video.published_at && (
            <span>
              Опубликовано:{" "}
              {formatDate(
                video.published_at,
              )}
            </span>
          )}


          <div className="profile-video-card__actions">
            {video.status ===
              "approved" && (
              <button
                type="button"
                onClick={() =>
                  window.alert(
                    "Статистика добавим позже.",
                  )
                }
              >
                Статистика
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                window.alert(
                  "Редактирование добавим позже.",
                )
              }
            >
              Редактировать
            </button>
          </div>
        </div>


        {video.status === "rejected" &&
          video.rejection_reason && (
            <div className="profile-video-card__rejection">
              <strong>
                Причина отклонения:
              </strong>

              <span>
                {video.rejection_reason}
              </span>
            </div>
          )}
      </div>
    </article>
  );
}