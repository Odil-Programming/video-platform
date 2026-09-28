import {
  useEffect,
  useRef,
  useState,
} from "react";

import { getCategories } from "../api/categoryApi";

import {
  uploadVideoByUrl,
  uploadVideoFile,
} from "../api/videoApi";

import "../styles/upload-video-page.css";


function getErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return "Не удалось отправить видео.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  const firstKey = Object.keys(data)[0];

  if (
    firstKey &&
    Array.isArray(data[firstKey])
  ) {
    return data[firstKey][0];
  }

  if (firstKey && data[firstKey]) {
    return String(data[firstKey]);
  }

  return "Не удалось отправить видео.";
}


function formatFileSize(bytes) {
  if (!bytes) {
    return "";
  }

  const units = [
    "Б",
    "КБ",
    "МБ",
    "ГБ",
  ];

  let value = bytes;
  let unitIndex = 0;

  while (
    value >= 1024 &&
    unitIndex < units.length - 1
  ) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(
    unitIndex === 0 ? 0 : 1,
  )} ${units[unitIndex]}`;
}


export default function UploadVideoPage() {
  const videoInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [categories, setCategories] =
    useState([]);

  const [uploadType, setUploadType] =
    useState("file");

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "",
    videoFile: null,
    videoUrl: "",
    thumbnail: null,
  });

  const [videoPreviewUrl, setVideoPreviewUrl] =
    useState("");

  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState("");

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
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(
          videoPreviewUrl,
        );
      }

      if (thumbnailPreviewUrl) {
        URL.revokeObjectURL(
          thumbnailPreviewUrl,
        );
      }
    };
  }, [
    videoPreviewUrl,
    thumbnailPreviewUrl,
  ]);


  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  }


  function handleUploadTypeChange(type) {
    setUploadType(type);
    setError("");
    setSuccess("");

    setForm((previousForm) => ({
      ...previousForm,
      videoFile: null,
      videoUrl: "",
    }));

    if (videoPreviewUrl) {
      URL.revokeObjectURL(
        videoPreviewUrl,
      );
    }

    setVideoPreviewUrl("");

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }


  function handleVideoFileChange(event) {
    const selectedFile =
      event.target.files?.[0] || null;

    if (!selectedFile) {
      return;
    }

    if (videoPreviewUrl) {
      URL.revokeObjectURL(
        videoPreviewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setVideoPreviewUrl(previewUrl);

    setForm((previousForm) => ({
      ...previousForm,
      videoFile: selectedFile,
      videoUrl: "",
    }));

    setError("");
  }


  function handleThumbnailChange(event) {
    const selectedFile =
      event.target.files?.[0] || null;

    if (!selectedFile) {
      return;
    }

    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(
        thumbnailPreviewUrl,
      );
    }

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setThumbnailPreviewUrl(previewUrl);

    setForm((previousForm) => ({
      ...previousForm,
      thumbnail: selectedFile,
    }));

    setError("");
  }


  function removeVideoFile() {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(
        videoPreviewUrl,
      );
    }

    setVideoPreviewUrl("");

    setForm((previousForm) => ({
      ...previousForm,
      videoFile: null,
    }));

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }


  function removeThumbnail() {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(
        thumbnailPreviewUrl,
      );
    }

    setThumbnailPreviewUrl("");

    setForm((previousForm) => ({
      ...previousForm,
      thumbnail: null,
    }));

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }


  function validateForm() {
    if (!form.title.trim()) {
      return "Введите название видео.";
    }

    if (!form.category) {
      return "Выберите категорию.";
    }

    if (
      uploadType === "file" &&
      !form.videoFile
    ) {
      return "Выберите видеофайл.";
    }

    if (
      uploadType === "url" &&
      !form.videoUrl.trim()
    ) {
      return "Введите ссылку на видео.";
    }

    return "";
  }


  function resetForm() {
    if (videoPreviewUrl) {
      URL.revokeObjectURL(
        videoPreviewUrl,
      );
    }

    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(
        thumbnailPreviewUrl,
      );
    }

    setForm({
      title: "",
      description: "",
      category: "",
      videoFile: null,
      videoUrl: "",
      thumbnail: null,
    });

    setVideoPreviewUrl("");
    setThumbnailPreviewUrl("");
    setUploadType("file");

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }


  async function handleSubmit(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (uploadType === "file") {
        await uploadVideoFile({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          videoFile: form.videoFile,
          thumbnail: form.thumbnail,
        });
      } else {
        await uploadVideoByUrl({
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category,
          videoUrl: form.videoUrl.trim(),
          thumbnail: form.thumbnail,
        });
      }

      setSuccess(
        "Видео отправлено на модерацию. "
        + "После проверки оно появится "
        + "на главной странице.",
      );

      resetForm();
    } catch (error) {
      console.error(
        "Ошибка загрузки видео:",
        error,
      );

      setError(
        getErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }


  const selectedCategoryName =
    categories.find(
      (category) =>
        String(category.id) ===
        String(form.category),
    )?.name || "Не выбрана";


  return (
    <main className="upload-page">
      <div className="upload-page__container">
        <section className="upload-page__header">
          <div>
            <p className="upload-page__breadcrumb">
              Главная / Загрузить видео
            </p>

            <h1>
              Загрузить видео
            </h1>

            <p>
              Поделитесь качественным контентом
              с многотысячной аудиторией.
              Публикация доступна после быстрой
              модерации.
            </p>
          </div>

          <div className="upload-page__service-status">
            <span>
              Сервис: ONLINE
            </span>

            <strong>
              Модерация работает
            </strong>
          </div>
        </section>


        <section className="upload-moderation">
          <div className="upload-moderation__icon">
            ✓
          </div>

          <div>
            <h2>
              Предварительная модерация
            </h2>

            <p>
              Все загружаемые видео проходят
              автоматическую и ручную проверку.
              Пожалуйста, убедитесь, что контент
              соответствует правилам платформы.
            </p>
          </div>

          <span className="upload-moderation__time">
            Обычно до 24 часов
          </span>
        </section>


        {success && (
          <div className="upload-alert upload-alert--success">
            <strong>Готово.</strong> {success}
          </div>
        )}


        {error && (
          <div className="upload-alert upload-alert--error">
            <strong>Ошибка.</strong> {error}
          </div>
        )}


        <div className="upload-page__layout">
          <form
            className="upload-form"
            onSubmit={handleSubmit}
          >
            <section className="upload-card">
              <div className="upload-card__header">
                <div>
                  <p className="upload-card__step">
                    Шаг 1 из 2
                  </p>

                  <h2>
                    Медиафайл
                  </h2>
                </div>

                <span>
                  Видео
                </span>
              </div>


              <div className="upload-type-tabs">
                <button
                  type="button"
                  onClick={() =>
                    handleUploadTypeChange(
                      "file",
                    )
                  }
                  className={
                    uploadType === "file"
                      ? "upload-type-tabs__button upload-type-tabs__button--active"
                      : "upload-type-tabs__button"
                  }
                >
                  Загрузить файл
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleUploadTypeChange(
                      "url",
                    )
                  }
                  className={
                    uploadType === "url"
                      ? "upload-type-tabs__button upload-type-tabs__button--active"
                      : "upload-type-tabs__button"
                  }
                >
                  Добавить ссылку
                </button>
              </div>


              {uploadType === "file" && (
                <>
                  {!form.videoFile ? (
                    <label
                      htmlFor="videoFile"
                      className="upload-dropzone"
                    >
                      <input
                        ref={videoInputRef}
                        id="videoFile"
                        type="file"
                        accept="video/*"
                        onChange={
                          handleVideoFileChange
                        }
                      />

                      <span className="upload-dropzone__icon">
                        ⇧
                      </span>

                      <strong>
                        Перетащите видеофайл
                      </strong>

                      <span>
                        или выберите на компьютере
                      </span>

                      <small>
                        Форматы MP4, WebM, MOV.
                        Максимальный размер зависит
                        от настроек сервера.
                      </small>
                    </label>
                  ) : (
                    <div className="upload-selected-file">
                      <div className="upload-selected-file__icon">
                        ▶
                      </div>

                      <div>
                        <strong>
                          {form.videoFile.name}
                        </strong>

                        <span>
                          {formatFileSize(
                            form.videoFile.size,
                          )}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={removeVideoFile}
                      >
                        Удалить
                      </button>
                    </div>
                  )}
                </>
              )}


              {uploadType === "url" && (
                <div className="upload-field">
                  <label htmlFor="videoUrl">
                    Прямая ссылка на видео
                  </label>

                  <input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    placeholder="https://example.com/video.mp4"
                    value={form.videoUrl}
                    onChange={handleChange}
                  />

                  <small>
                    Укажите прямую ссылку на
                    видеофайл в формате MP4,
                    WebM или другом доступном
                    браузеру формате.
                  </small>
                </div>
              )}


              <div className="upload-field upload-thumbnail-field">
                <label htmlFor="thumbnail">
                  Обложка видео
                  <span>
                    Необязательно
                  </span>
                </label>

                {!form.thumbnail ? (
                  <label
                    htmlFor="thumbnail"
                    className="upload-thumbnail-upload"
                  >
                    <input
                      ref={thumbnailInputRef}
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={
                        handleThumbnailChange
                      }
                    />

                    <span>
                      + Добавить обложку
                    </span>

                    <small>
                      JPG, PNG или WebP
                    </small>
                  </label>
                ) : (
                  <div className="upload-thumbnail-preview">
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Превью обложки"
                    />

                    <button
                      type="button"
                      onClick={removeThumbnail}
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
            </section>


            <section className="upload-card">
              <div className="upload-card__header">
                <div>
                  <p className="upload-card__step">
                    Шаг 2 из 2
                  </p>

                  <h2>
                    Описание и метаданные
                  </h2>
                </div>
              </div>


              <div className="upload-field">
                <label htmlFor="title">
                  Название видео
                  <span>
                    Обязательно
                  </span>
                </label>

                <input
                  id="title"
                  name="title"
                  type="text"
                  maxLength="255"
                  placeholder="Например: Полный курс по веб-разработке"
                  value={form.title}
                  onChange={handleChange}
                />

                <small>
                  {form.title.length}/255
                </small>
              </div>


              <div className="upload-field">
                <label htmlFor="description">
                  Описание видео
                </label>

                <textarea
                  id="description"
                  name="description"
                  rows="7"
                  maxLength="5000"
                  placeholder="Расскажите зрителям, о чем это видео, что они узнают и для кого оно будет полезно..."
                  value={form.description}
                  onChange={handleChange}
                />

                <small>
                  {form.description.length}/5000
                </small>
              </div>


              <div className="upload-form__row">
                <div className="upload-field">
                  <label htmlFor="category">
                    Категория
                    <span>
                      Обязательно
                    </span>
                  </label>

                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">
                      Выберите категорию
                    </option>

                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.icon
                          ? `${category.icon} `
                          : ""}
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="upload-field">
                  <label>
                    Статус публикации
                  </label>

                  <div className="upload-readonly">
                    На проверке
                  </div>
                </div>
              </div>
            </section>


            <div className="upload-submit-area">
              <label className="upload-rules">
                <input
                  type="checkbox"
                  required
                />

                <span>
                  Я подтверждаю, что обладаю
                  правами на публикацию видео
                  и принимаю правила платформы.
                </span>
              </label>

              <button
                type="submit"
                className="upload-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Отправка..."
                  : "▶ Отправить на модерацию"}
              </button>
            </div>
          </form>


          <aside className="upload-preview">
            <section className="upload-preview__card">
              <div className="upload-preview__header">
                <h2>
                  Предпросмотр в ленте
                </h2>

                <span>
                  Вид карточки
                </span>
              </div>

              <div className="upload-preview-card">
                <div className="upload-preview-card__media">
                  {thumbnailPreviewUrl ? (
                    <img
                      src={thumbnailPreviewUrl}
                      alt="Обложка видео"
                    />
                  ) : (
                    <div className="upload-preview-card__empty">
                      Нет обложки
                    </div>
                  )}

                  <span>
                    ▶
                  </span>
                </div>

                <div className="upload-preview-card__content">
                  <h3>
                    {form.title ||
                      "Название вашего видео"}
                  </h3>

                  <p>
                    {userNamePlaceholder()}
                  </p>

                  <small>
                    {selectedCategoryName} •
                    ожидает модерации
                  </small>
                </div>
              </div>

              <p className="upload-preview__hint">
                Так видео будет отображаться
                в ленте после одобрения.
              </p>
            </section>


            <section className="upload-checklist">
              <h2>
                Контрольный чек-лист перед
                отправкой
              </h2>

              <ul>
                <li>
                  Название видео понятно
                  описывает содержимое.
                </li>

                <li>
                  Выбрана подходящая категория.
                </li>

                <li>
                  Загружено видео или указана
                  рабочая ссылка.
                </li>

                <li>
                  Добавлена обложка для лучшего
                  отображения в ленте.
                </li>

                <li>
                  Контент соответствует правилам
                  платформы.
                </li>
              </ul>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}


function userNamePlaceholder() {
  return "Ваш канал";
}