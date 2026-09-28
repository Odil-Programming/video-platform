import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../context/AuthContext";

import "../styles/auth-page.css";


function getRegisterErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return (
      "Не удалось зарегистрироваться. "
      + "Проверьте подключение к серверу."
    );
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (Array.isArray(data.username)) {
    return `Логин: ${data.username[0]}`;
  }

  if (Array.isArray(data.email)) {
    return `Email: ${data.email[0]}`;
  }

  if (Array.isArray(data.password)) {
    return `Пароль: ${data.password[0]}`;
  }

  if (Array.isArray(data.password_confirm)) {
    return `Подтверждение пароля: ${
      data.password_confirm[0]
    }`;
  }

  if (Array.isArray(data.non_field_errors)) {
    return data.non_field_errors[0];
  }

  return "Не удалось зарегистрироваться.";
}


export default function RegisterPage() {
  const navigate = useNavigate();

  const { register } = useAuth();

  const [form, setForm] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    password_confirm: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }


  function validateForm() {
    if (form.username.trim().length < 3) {
      return (
        "Логин должен содержать минимум "
        + "3 символа."
      );
    }

    if (!form.email.trim()) {
      return "Введите email.";
    }

    if (form.password.length < 8) {
      return (
        "Пароль должен содержать минимум "
        + "8 символов."
      );
    }

    if (
      form.password !==
      form.password_confirm
    ) {
      return "Пароли не совпадают.";
    }

    return "";
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

      await register({
        username: form.username.trim(),
        email: form.email.trim(),
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        password: form.password,
        password_confirm: form.password_confirm,
      });

      setSuccess(
        "Регистрация прошла успешно. "
        + "Сейчас вы будете перенаправлены "
        + "на страницу входа.",
      );

      window.setTimeout(() => {
        navigate(
          "/login",
          {
            replace: true,
          },
        );
      }, 1200);
    } catch (error) {
      console.error(
        "Ошибка регистрации:",
        error,
      );

      setError(
        getRegisterErrorMessage(error),
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="auth-page">
      <div className="auth-page__container">
        <section className="auth-page__intro">
          <Link
            to="/"
            className="auth-brand"
          >
            <span className="auth-brand__mark">
              ▶
            </span>

            <span>
              VideoHub
            </span>
          </Link>

          <div className="auth-page__intro-content">
            <p className="auth-page__eyebrow">
              Присоединяйтесь
            </p>

            <h1>
              Начните делиться своими видео
              уже сегодня.
            </h1>

            <p>
              Создайте аккаунт, загрузите
              первое видео и соберите свою
              аудиторию на платформе.
            </p>

            <ul className="auth-page__benefits">
              <li>
                Публикуйте собственные видео
              </li>

              <li>
                Получайте уведомления о статусе
              </li>

              <li>
                Управляйте своими публикациями
              </li>
            </ul>
          </div>

          <p className="auth-page__copyright">
            © {new Date().getFullYear()} VideoHub
          </p>
        </section>


        <section className="auth-page__form-section">
          <div className="auth-card auth-card--register">
            <div className="auth-card__header">
              <p className="auth-card__eyebrow">
                Новый аккаунт
              </p>

              <h2>
                Создайте аккаунт
              </h2>

              <p>
                Заполните данные для регистрации.
              </p>
            </div>


            {error && (
              <div
                className="auth-alert auth-alert--error"
                role="alert"
              >
                <span>
                  !
                </span>

                <p>
                  {error}
                </p>
              </div>
            )}


            {success && (
              <div
                className="auth-alert auth-alert--success"
                role="status"
              >
                <span>
                  ✓
                </span>

                <p>
                  {success}
                </p>
              </div>
            )}


            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="username">
                  Логин
                  <span>
                    Обязательно
                  </span>
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Например, video_creator"
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                  minLength="3"
                  required
                />

                <small>
                  Минимум 3 символа.
                </small>
              </div>


              <div className="auth-field">
                <label htmlFor="email">
                  Email
                  <span>
                    Обязательно
                  </span>
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>


              <div className="auth-form__row">
                <div className="auth-field">
                  <label htmlFor="first_name">
                    Имя
                    <span>
                      Необязательно
                    </span>
                  </label>

                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    placeholder="Ваше имя"
                    value={form.first_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="auth-field">
                  <label htmlFor="last_name">
                    Фамилия
                    <span>
                      Необязательно
                    </span>
                  </label>

                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    placeholder="Ваша фамилия"
                    value={form.last_name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>


              <div className="auth-field">
                <label htmlFor="password">
                  Пароль
                  <span>
                    Обязательно
                  </span>
                </label>

                <div className="auth-password-field">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Минимум 8 символов"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                    minLength="8"
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-field__toggle"
                    onClick={() =>
                      setShowPassword(
                        (previous) => !previous,
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showPassword
                        ? "Скрыть пароль"
                        : "Показать пароль"
                    }
                  >
                    {showPassword
                      ? "Скрыть"
                      : "Показать"}
                  </button>
                </div>

                <small>
                  Используйте не менее 8 символов.
                </small>
              </div>


              <div className="auth-field">
                <label htmlFor="password_confirm">
                  Повторите пароль
                  <span>
                    Обязательно
                  </span>
                </label>

                <div className="auth-password-field">
                  <input
                    id="password_confirm"
                    name="password_confirm"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="new-password"
                    placeholder="Повторите пароль"
                    value={form.password_confirm}
                    onChange={handleChange}
                    disabled={loading}
                    required
                  />

                  <button
                    type="button"
                    className="auth-password-field__toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (previous) => !previous,
                      )
                    }
                    disabled={loading}
                    aria-label={
                      showConfirmPassword
                        ? "Скрыть пароль"
                        : "Показать пароль"
                    }
                  >
                    {showConfirmPassword
                      ? "Скрыть"
                      : "Показать"}
                  </button>
                </div>
              </div>


              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading || Boolean(success)}
              >
                {loading
                  ? "Создание аккаунта..."
                  : "Создать аккаунт"}
              </button>
            </form>


            <div className="auth-card__footer">
              <p>
                Уже есть аккаунт?
              </p>

              <Link to="/login">
                Войти
              </Link>
            </div>


            <Link
              to="/"
              className="auth-back-link"
            >
              ← Вернуться на главную
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}