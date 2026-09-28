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


function getLoginErrorMessage(error) {
  const data = error.response?.data;

  if (!data) {
    return (
      "Не удалось выполнить вход. "
      + "Проверьте подключение к серверу."
    );
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.detail) {
    return data.detail;
  }

  if (Array.isArray(data.non_field_errors)) {
    return data.non_field_errors[0];
  }

  if (Array.isArray(data.username)) {
    return data.username[0];
  }

  if (Array.isArray(data.password)) {
    return data.password[0];
  }

  return (
    "Не удалось выполнить вход. "
    + "Проверьте логин и пароль."
  );
}


export default function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
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


  async function handleSubmit(event) {
    event.preventDefault();

    const username = form.username.trim();
    const password = form.password;

    if (!username || !password) {
      setError(
        "Введите логин и пароль.",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      await login(
        username,
        password,
      );

      navigate(
        "/",
        {
          replace: true,
        },
      );
    } catch (error) {
      console.error(
        "Ошибка авторизации:",
        error,
      );

      setError(
        getLoginErrorMessage(error),
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
              Видео-платформа
            </p>

            <h1>
              Смотрите, публикуйте и находите
              интересные видео.
            </h1>

            <p>
              Войдите в свой аккаунт, чтобы
              загружать ролики, управлять
              публикациями и получать
              уведомления о модерации.
            </p>

            <ul className="auth-page__benefits">
              <li>
                Загружайте видео и обложки
              </li>

              <li>
                Следите за статусом модерации
              </li>

              <li>
                Находите новые видео по темам
              </li>
            </ul>
          </div>

          <p className="auth-page__copyright">
            © {new Date().getFullYear()} VideoHub
          </p>
        </section>


        <section className="auth-page__form-section">
          <div className="auth-card">
            <div className="auth-card__header">
              <p className="auth-card__eyebrow">
                Добро пожаловать
              </p>

              <h2>
                Войдите в аккаунт
              </h2>

              <p>
                Введите данные своего аккаунта.
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


            <form
              className="auth-form"
              onSubmit={handleSubmit}
            >
              <div className="auth-field">
                <label htmlFor="username">
                  Логин
                </label>

                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="Введите ваш логин"
                  value={form.username}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </div>


              <div className="auth-field">
                <div className="auth-field__label-row">
                  <label htmlFor="password">
                    Пароль
                  </label>
                </div>

                <div className="auth-password-field">
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    autoComplete="current-password"
                    placeholder="Введите пароль"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
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
              </div>


              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading
                  ? "Выполняется вход..."
                  : "Войти в аккаунт"}
              </button>
            </form>


            <div className="auth-card__footer">
              <p>
                Ещё нет аккаунта?
              </p>

              <Link to="/register">
                Создать аккаунт
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