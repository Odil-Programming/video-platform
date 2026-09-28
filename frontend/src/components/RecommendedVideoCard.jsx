import { Link } from "react-router-dom";

import { getMediaUrl } from "../api/mediaUrl";

import "../styles/recommended-video-card.css";


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


export default function RecommendedVideoCard({
  video,
}) {
  const thumbnailUrl = video.thumbnail
    ? getMediaUrl(video.thumbnail)
    : "";


  const ownerName =
    video.owner_username ||
    (
      typeof video.owner === "object"
        ? video.owner?.username ||
          video.owner?.email
        : video.owner
    ) ||
    "Неизвестный автор";


  return (
    <article className="recommended-video-card">
      <Link
        to={`/videos/${video.id}`}
        className="recommended-video-card__link"
      >
        <div className="recommended-video-card__thumbnail">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={video.title}
              loading="lazy"
            />
          ) : (
            <div>
              Нет превью
            </div>
          )}

          <span>
            ▶
          </span>
        </div>


        <div className="recommended-video-card__content">
          <h3>
            {video.title}
          </h3>

          <p>
            {ownerName}
          </p>

          <small>
            {formatViews(
              video.views_count,
            )} просмотров
          </small>
        </div>
      </Link>
    </article>
  );
}