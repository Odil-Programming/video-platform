# Video Platform

Full-stack видеоплатформа с загрузкой видео, модерацией, уведомлениями, поиском и категориями.

Проект позволяет пользователям создавать аккаунты, загружать видеофайлы или добавлять видео по ссылке, выбирать категорию, добавлять thumbnail и отслеживать статус модерации.

## Возможности

### Пользователи

- Регистрация и вход в аккаунт
- JWT-аутентификация
- Защищённые маршруты
- Профиль пользователя
- Выход из аккаунта

### Видео

- Загрузка видеофайла
- Добавление видео по URL
- Загрузка thumbnail
- Название и описание видео
- Категории
- Поиск видео
- Фильтрация по категориям
- Сортировка
- Пагинация
- Счётчик просмотров
- Рекомендованные видео

### Модерация

Видео после загрузки получают статус:

```text
pending
```

Администратор может одобрить или отклонить видео.

Поддерживаемые статусы:

```text
pending   — На проверке
approved  — Опубликовано
rejected  — Отклонено
```

Для отклонённого видео сохраняется причина отклонения.

### Уведомления

Пользователь получает уведомления, когда:

- Видео отправлено на модерацию
- Видео опубликовано
- Видео отклонено

Также поддерживается:

- Просмотр списка уведомлений
- Фильтрация прочитанных и непрочитанных уведомлений
- Отметка одного уведомления как прочитанного
- Отметка всех уведомлений как прочитанных

## Технологии

### Backend

- Python
- Django
- Django REST Framework
- Simple JWT
- django-filter
- PostgreSQL для production
- Supabase Storage для видеофайлов и thumbnail
- WhiteNoise
- Gunicorn

### Frontend

- React
- React Router
- Axios
- Vite
- CSS

## Архитектура

```text
React frontend
        ↓
Django REST API
        ↓
PostgreSQL database
        ↓
Supabase Storage
```

Видео и thumbnail хранятся в Supabase Storage.

Данные пользователей, статусы видео, категории, уведомления и просмотры хранятся в базе данных.

## Ограничение demo-версии

На текущем бесплатном Supabase Storage плане максимальный размер одного загружаемого видео составляет:

```text
50 MB
```

Для будущей production-версии с файлами до 1 GB планируется:

```text
Direct-to-storage uploads
Signed upload URLs
Resumable uploads
TUS protocol
```

## Локальный запуск

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd video-platform
```

### 2. Backend

Перейдите в backend:

```bash
cd backend
```

Создайте виртуальное окружение:

```bash
python -m venv venv
```

Активируйте его в Windows PowerShell:

```powershell
venv\Scripts\Activate.ps1
```

Установите зависимости:

```bash
python -m pip install -r ..\requirements.txt
```

Создайте файл:

```text
backend/.env
```

На основе:

```text
backend/.env.example
```

Для локальной разработки можно использовать SQLite и оставить `DATABASE_URL` пустым.

Запустите миграции:

```bash
python manage.py migrate
```

Создайте администратора:

```bash
python manage.py createsuperuser
```

Запустите backend:

```bash
python manage.py runserver
```

Backend будет доступен по адресу:

```text
http://127.0.0.1:8000/
```

Django Admin:

```text
http://127.0.0.1:8000/admin/
```

### 3. Frontend

Откройте второй терминал и перейдите в frontend:

```bash
cd frontend
```

Установите зависимости:

```bash
npm install
```

Создайте файл:

```text
frontend/.env
```

На основе:

```text
frontend/.env.example
```

Для локальной разработки:

```env
VITE_API_URL=http://127.0.0.1:8000/api/
```

Запустите frontend:

```bash
npm run dev
```

Приложение будет доступно по адресу:

```text
http://localhost:5173/
```

## API Endpoints

### Auth

```text
POST /api/accounts/register/
POST /api/auth/token/
POST /api/auth/token/refresh/
GET  /api/accounts/me/
```

### Videos

```text
GET  /api/videos/
POST /api/videos/
GET  /api/videos/latest/
GET  /api/videos/my/
GET  /api/videos/{id}/
POST /api/videos/{id}/view/
GET  /api/videos/{id}/recommendations/
POST /api/videos/{id}/approve/
POST /api/videos/{id}/reject/
```

### Notifications

```text
GET   /api/notifications/
PATCH /api/notifications/{id}/read/
PATCH /api/notifications/read-all/
GET   /api/notifications/unread-count/
```

### Categories

```text
GET /api/categories/
```

## Роли и доступ

| Тип пользователя | Возможности |
|---|---|
| Гость | Просмотр опубликованных видео, поиск, фильтрация |
| Авторизованный пользователь | Загрузка видео, профиль, уведомления, свои видео |
| Администратор | Одобрение и отклонение видео, управление через Django Admin |

## Статус проекта

MVP находится в активной разработке.

Реализовано:

- [x] Регистрация и JWT-аутентификация
- [x] Загрузка видео
- [x] Добавление видео по ссылке
- [x] Thumbnail
- [x] Категории
- [x] Поиск и фильтры
- [x] Пагинация
- [x] Просмотры
- [x] Рекомендации
- [x] Модерация
- [x] Уведомления
- [x] Supabase Storage
- [x] Адаптивный интерфейс
- [ ] Likes
- [ ] Comments UI improvements
- [ ] Direct large-file upload
- [ ] Production deployment

## Security

В репозиторий не добавляются:

```text
.env
Secret keys
Database URLs
Supabase S3 credentials
JWT secrets
```

Для настройки окружения используйте:

```text
backend/.env.example
frontend/.env.example
```