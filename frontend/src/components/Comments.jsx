import {
  useEffect,
  useState,
} from "react";

import {
  createComment,
  deleteComment,
  getComments,
} from "../api/commentApi";

import { useAuth } from "../context/AuthContext";


export default function Comments({
  videoId,
}) {
  const auth = useAuth();

  const user = auth?.user || null;

  const [comments, setComments] =
    useState([]);

  const [text, setText] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState("");


  useEffect(() => {
    let isMounted = true;


    async function loadComments() {
      try {
        setLoading(true);
        setError("");
        setComments([]);

        const data = await getComments(
          videoId,
        );

        const items = Array.isArray(data)
          ? data
          : data?.results || [];

        if (isMounted) {
          setComments(items);
        }
      } catch (error) {
        console.error(
          "Ошибка загрузки комментариев:",
          error,
        );

        if (isMounted) {
          setError(
            "Не удалось загрузить комментарии.",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }


    if (videoId) {
      loadComments();
    } else {
      setLoading(false);
      setComments([]);
    }


    return () => {
      isMounted = false;
    };
  }, [videoId]);


  async function handleSubmit(event) {
    event.preventDefault();

    const cleanText = text.trim();

    if (!cleanText || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const newComment =
        await createComment(
          videoId,
          cleanText,
        );

      setComments((currentComments) => [
        newComment,
        ...currentComments,
      ]);

      setText("");
    } catch (error) {
      console.error(
        "Ошибка создания комментария:",
        error,
      );

      const serverMessage =
        error.response?.data?.text?.[0] ||
        error.response?.data?.detail ||
        "Не удалось добавить комментарий.";

      setError(serverMessage);
    } finally {
      setSubmitting(false);
    }
  }


  async function handleDelete(commentId) {
    const confirmed = window.confirm(
      "Удалить этот комментарий?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(commentId);
      setError("");

      await deleteComment(commentId);

      setComments((currentComments) =>
        currentComments.filter(
          (comment) =>
            comment.id !== commentId,
        ),
      );
    } catch (error) {
      console.error(
        "Ошибка удаления комментария:",
        error,
      );

      const serverMessage =
        error.response?.data?.detail ||
        "Не удалось удалить комментарий.";

      setError(serverMessage);
    } finally {
      setDeletingId(null);
    }
  }


  return (
    <section className="comments">
      <h2>
        Комментарии ({comments.length})
      </h2>


      {user ? (
        <form onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Напишите комментарий..."
            rows="4"
            maxLength="1000"
            disabled={submitting}
          />

          <button
            type="submit"
            disabled={
              submitting ||
              !text.trim()
            }
          >
            {submitting
              ? "Отправка..."
              : "Отправить"}
          </button>
        </form>
      ) : (
        <p>
          Войдите, чтобы оставить
          комментарий.
        </p>
      )}


      {loading && (
        <p>
          Загрузка комментариев...
        </p>
      )}


      {!loading && error && (
        <p className="comments__error">
          {error}
        </p>
      )}


      {!loading &&
        !error &&
        comments.length === 0 && (
          <p>
            Пока нет комментариев.
          </p>
        )}


      {!loading && (
        <div className="comments__list">
          {comments.map((comment) => {
            const canDelete =
              user &&
              (
                user.id === comment.user ||
                user.is_staff
              );

            return (
              <article
                key={comment.id}
                className="comments__item"
              >
                <div className="comments__header">
                  <strong>
                    {comment.username ||
                      "Пользователь"}
                  </strong>

                  {canDelete && (
                    <button
                      type="button"
                      disabled={
                        deletingId ===
                        comment.id
                      }
                      onClick={() =>
                        handleDelete(
                          comment.id,
                        )
                      }
                    >
                      {deletingId ===
                      comment.id
                        ? "Удаление..."
                        : "Удалить"}
                    </button>
                  )}
                </div>

                <p>
                  {comment.text}
                </p>

                {comment.created_at && (
                  <small>
                    {new Date(
                      comment.created_at,
                    ).toLocaleString(
                      "ru-RU",
                    )}
                  </small>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}