import { Link } from "react-router-dom";

import { getMediaUrl } from "../api/mediaUrl";

import "../styles/video-card.css";


function formatViews(count) {
  const value = Number(count || 0);

  if (value >= 1000000) {
    return `${(
      value / 1000000
    ).toFixed(1)} млн`;
  }

  if (value >= 1000) {
    return `${(
      value / 1000
    ).toFixed(1)} тыс.`;
  }

  return value.toString();
}


function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
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


export default function VideoCard({
  video,
}) {
  const thumbnailUrl = video.thumbnail
    ? getMediaUrl(video.thumbnail)
    : "";


  const categoryName =
    typeof video.category === "object"
      ? video.category?.name
      : video.category_name ||
        video.category ||
        "Без категории";


  const ownerName =
    video.owner_username ||
    (
      typeof video.owner === "object"
        ? video.owner?.username ||
          video.owner?.email
        : video.owner
    ) ||
    "Неизвестный автор";


  const videoDate =
    video.published_at ||
    video.created_at;


  return (
    <article className="video-card">
      <Link
        to={`/videos/${video.id}`}
        className="video-card__link"
      >
        <div className="video-card__thumbnail">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              className="video-card__image"
              loading="lazy"
            />
          ) : (
            <div className="video-card__no-thumbnail">
              Нет превью
            </div>
          )}

          <span
            className="video-card__play"
            aria-hidden="true"
          >
            ▶
          </span>

          <span className="video-card__duration">
            Видео
          </span>
        </div>


        <div className="video-card__content">
          <h3 className="video-card__title">
            {video.title}
          </h3>

          <p className="video-card__owner">
            {ownerName}
          </p>

          <div className="video-card__meta">
            <span>{categoryName}</span>

            <span>•</span>

            <span>
              {formatViews(
                video.views_count,
              )} просмотров
            </span>
          </div>

          {videoDate && (
            <p className="video-card__date">
              {formatDate(videoDate)}
            </p>
          )}
        </div>
      </Link>
    </article>
  );
}