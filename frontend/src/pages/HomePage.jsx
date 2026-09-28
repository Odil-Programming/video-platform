import {
  useEffect,
  useState,
} from "react";

import { getCategories } from "../api/categoryApi";
import { getVideos } from "../api/videoApi";

import VideoCard from "../components/VideoCard";

import "../styles/home-page.css";


const PAGE_SIZE = 6;


export default function HomePage() {
  const [categories, setCategories] =
    useState([]);

  const [videos, setVideos] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [selectedCategory, setSelectedCategory] =
    useState("");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalVideos, setTotalVideos] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        const data = await getCategories();

        const categoryItems = Array.isArray(data)
          ? data
          : data?.results || [];

        if (isMounted) {
          setCategories(categoryItems);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки категорий:",
          error,
        );

        if (isMounted) {
          setError(
            "Не удалось загрузить категории.",
          );
        }
      }
    }

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);


  useEffect(() => {
    let isMounted = true;

    async function loadVideos() {
      try {
        setLoading(true);
        setError("");

        const data = await getVideos({
          page: currentPage,
          search: search || undefined,
          category:
            selectedCategory || undefined,
        });

        const videoItems = Array.isArray(data)
          ? data
          : data?.results || [];

        const totalItems = Array.isArray(data)
          ? data.length
          : data?.count || 0;

        if (isMounted) {
          setVideos(videoItems);
          setTotalVideos(totalItems);

          setTotalPages(
            Math.max(
              Math.ceil(
                totalItems / PAGE_SIZE,
              ),
              1,
            ),
          );
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

          setVideos([]);
          setTotalVideos(0);
          setTotalPages(1);
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
  }, [
    search,
    selectedCategory,
    currentPage,
  ]);


  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }


  function handleCategoryClick(categoryId) {
    const newCategory =
      String(selectedCategory) ===
      String(categoryId)
        ? ""
        : String(categoryId);

    setSelectedCategory(newCategory);
    setCurrentPage(1);
  }


  function handlePreviousPage() {
    setCurrentPage((page) =>
      Math.max(page - 1, 1),
    );
  }


  function handleNextPage() {
    setCurrentPage((page) =>
      Math.min(
        page + 1,
        totalPages,
      ),
    );
  }


  return (
    <main className="page-container home-page">
      <section className="home-page__header">
        <div>
          <p className="home-page__eyebrow">
            Видеоплатформа
          </p>

          <h1 className="home-page__title">
            Найдите интересное видео
          </h1>

          <p className="home-page__subtitle">
            Обучение, технологии, музыка,
            развлечения и многое другое.
          </p>
        </div>

        <div className="home-page__search">
          <input
            type="search"
            placeholder="Поиск видео..."
            value={search}
            onChange={handleSearchChange}
            aria-label="Поиск видео"
          />

          <span
            aria-hidden="true"
            className="home-page__search-icon"
          >
            ⌕
          </span>
        </div>
      </section>


      <section className="category-tabs">
        <button
          type="button"
          onClick={() =>
            handleCategoryClick("")
          }
          className={
            !selectedCategory
              ? "category-tabs__button category-tabs__button--active"
              : "category-tabs__button"
          }
        >
          Все категории
        </button>

        {categories.map((category) => {
          const isActive =
            String(selectedCategory) ===
            String(category.id);

          return (
            <button
              key={category.id}
              type="button"
              onClick={() =>
                handleCategoryClick(
                  category.id,
                )
              }
              className={
                isActive
                  ? "category-tabs__button category-tabs__button--active"
                  : "category-tabs__button"
              }
            >
              {category.icon && (
                <span>
                  {category.icon}{" "}
                </span>
              )}

              {category.name}
            </button>
          );
        })}
      </section>


      <section className="home-page__content">
        <div className="home-page__results-header">
          <h2>
            {search
              ? `Результаты поиска: ${search}`
              : "Популярные видео"}
          </h2>

          {!loading && !error && (
            <span>
              Всего: {totalVideos}
            </span>
          )}
        </div>


        {loading && (
          <div className="home-page__message">
            Загрузка видео...
          </div>
        )}


        {!loading && error && (
          <div className="home-page__error">
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          videos.length === 0 && (
            <div className="home-page__message">
              Видео не найдены.
            </div>
          )}


        {!loading &&
          !error &&
          videos.length > 0 && (
            <section className="video-grid">
              {videos.map((video) => (
                <VideoCard
                  key={video.id}
                  video={video}
                />
              ))}
            </section>
          )}


        {!loading &&
          !error &&
          totalPages > 1 && (
            <section className="pagination">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={handlePreviousPage}
              >
                ← Назад
              </button>

              <div className="pagination__info">
                <strong>
                  Страница {currentPage} из{" "}
                  {totalPages}
                </strong>

                <span>
                  Всего {totalVideos} видео
                </span>
              </div>

              <button
                type="button"
                disabled={
                  currentPage === totalPages
                }
                onClick={handleNextPage}
              >
                Вперед →
              </button>
            </section>
          )}
      </section>
    </main>
  );
}