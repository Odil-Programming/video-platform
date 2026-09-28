import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  addVideoView,
  getRecommendations,
  getVideo,
} from "../api/videoApi";

import { getMediaUrl } from "../api/mediaUrl";

import Comments from "../components/Comments";
import RecommendedVideoCard from "../components/RecommendedVideoCard";

import "./VideoDetailPage.css";


export default function VideoDetailPage() {
  const { id } = useParams();

  const viewSent = useRef(false);

  const [video, setVideo] =
    useState(null);

  const [recommendations, setRecommendations] =
    useState([]);

  const [
    recommendationsLoading,
    setRecommendationsLoading,
  ] = useState(true);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let isMounted = true;

    async function loadVideo() {
      try {
        setLoading(true);
        setError("");
        setVideo(null);

        viewSent.current = false;

        const data = await getVideo(id);

        if (!isMounted) {
          return;
        }

        setVideo(data);

        if (!viewSent.current) {
          viewSent.current = true;

          try {
            const viewData =
              await addVideoView(id);

            if (isMounted) {
              setVideo(
                (currentVideo) => ({
                  ...currentVideo,
                  views_count:
                    viewData.views_count,
                }),
              );
            }
          } catch (viewError) {
            console.error(
              "Не удалось добавить просмотр:",
              viewError,
            );
          }
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки видео:",
          error,
        );

        if (isMounted) {
          setError(
            "Не удалось загрузить видео.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadVideo();
    } else {
      setLoading(false);

      setError(
        "ID видео отсутствует.",
      );
    }

    return () => {
      isMounted = false;
    };
  }, [id]);


  useEffect(() => {
    let isMounted = true;

    async function loadRecommendations() {
      try {
        setRecommendationsLoading(true);
        setRecommendations([]);

        const data = await getRecommendations(
          id,
        );

        const items = Array.isArray(data)
          ? data
          : data?.results || [];

        if (isMounted) {
          setRecommendations(items);
        }
      } catch (error) {
        console.error(
          "Не удалось загрузить рекомендации:",
          error,
        );

        if (isMounted) {
          setRecommendations([]);
        }
      } finally {
        if (isMounted) {
          setRecommendationsLoading(false);
        }
      }
    }

    if (id) {
      loadRecommendations();
    } else {
      setRecommendationsLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [id]);


  if (loading) {
    return (
      <main className="video-detail-page">
        <p className="video-detail-message">
          Загрузка видео...
        </p>
      </main>
    );
  }


  if (error) {
    return (
      <main className="video-detail-page">
        <div className="video-detail-error">
          <p>{error}</p>

          <Link to="/">
            Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }


  if (!video) {
    return (
      <main className="video-detail-page">
        <div className="video-detail-error">
          <p>Видео не найдено.</p>

          <Link to="/">
            Вернуться на главную
          </Link>
        </div>
      </main>
    );
  }


  const videoSource =
    video.video_file ||
    video.video_url ||
    "";

  const videoUrl = videoSource
    ? getMediaUrl(videoSource)
    : "";


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


  const categoryName =
    video.category_name ||
    (
      typeof video.category === "object"
        ? video.category?.name
        : video.category
    ) ||
    "Без категории";


  return (
    <main className="video-detail-page">
      <div className="video-detail-container">
        <Link
          to="/"
          className="video-detail-back"
        >
          ← Назад
        </Link>


        <div className="video-detail-layout">
          <section className="video-detail-main">
            <div className="video-player-wrapper">
              {videoUrl ? (
                <video
                  className="video-player"
                  controls
                  preload="metadata"
                  poster={
                    thumbnailUrl || undefined
                  }
                >
                  <source
                    src={videoUrl}
                    type="video/mp4"
                  />

                  Ваш браузер не поддерживает
                  воспроизведение видео.
                </video>
              ) : (
                <div className="video-player-empty">
                  Видео пока недоступно.
                </div>
              )}
            </div>


            <h1 className="video-detail-title">
              {video.title}
            </h1>


            <div className="video-detail-info">
              <div>
                <p className="video-detail-author">
                  {ownerName}
                </p>

                <p className="video-detail-category">
                  Категория: {categoryName}
                </p>
              </div>


              <div className="video-detail-stats">
                {video.views_count !==
                  undefined && (
                  <p className="video-detail-views">
                    Просмотров:{" "}
                    {video.views_count}
                  </p>
                )}

                {video.created_at && (
                  <p className="video-detail-date">
                    {new Date(
                      video.created_at,
                    ).toLocaleDateString(
                      "ru-RU",
                    )}
                  </p>
                )}
              </div>
            </div>


            <section className="video-description">
              <h2>Описание</h2>

              {video.description ? (
                <p>
                  {video.description}
                </p>
              ) : (
                <p>
                  Описание отсутствует.
                </p>
              )}
            </section>


            <Comments videoId={video.id} />
          </section>


          <aside className="video-recommendations">
            <h2>Рекомендации</h2>

            {recommendationsLoading && (
              <p className="video-recommendations__message">
                Загрузка рекомендаций...
              </p>
            )}

            {!recommendationsLoading &&
              recommendations.length === 0 && (
                <p className="video-recommendations__message">
                  Пока нет рекомендаций.
                </p>
              )}

            {!recommendationsLoading &&
              recommendations.length > 0 && (
                <div className="video-recommendations__list">
                  {recommendations.map(
                    (recommendedVideo) => (
                      <RecommendedVideoCard
                        key={recommendedVideo.id}
                        video={recommendedVideo}
                      />
                    ),
                  )}
                </div>
              )}
          </aside>
        </div>
      </div>
    </main>
  );
}