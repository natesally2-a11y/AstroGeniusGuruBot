# 🚀 Деплой AstroGuru на сервер

## Рекомендуемый вариант: Railway (бесплатно, 5 минут)

### Шаг 1 — Установи Git
Скачай и установи: https://git-scm.com/download/win  
Во время установки оставь все настройки по умолчанию.

### Шаг 2 — Создай аккаунт на GitHub
Зайди на https://github.com и зарегистрируйся (бесплатно).

### Шаг 3 — Загрузи код на GitHub
Открой папку `astroguru` в проводнике, затем открой PowerShell в этой папке
(Shift + ПКМ → "Открыть в PowerShell") и выполни команды:

```powershell
git init
git add .
git commit -m "Initial AstroGuru deploy"
git branch -M main
git remote add origin https://github.com/ТВОЙUsername/astroguru.git
git push -u origin main
```

> Замени `ТВОЙUsername` на твой GitHub username.

### Шаг 4 — Деплой на Railway
1. Зайди на https://railway.app и войди через GitHub
2. Нажми **"New Project"** → **"Deploy from GitHub repo"**
3. Выбери репозиторий `astroguru`
4. Railway автоматически определит Node.js проект

### Шаг 5 — Переменные окружения на Railway
В Railway → твой проект → **Variables** добавь:

| Переменная | Значение |
|-----------|---------|
| `BOT_TOKEN` | `8780944132:AAFdvDWZ6CHSro2RzPdL8XL9ojfmwS_JqbE` |
| `NODE_ENV` | `production` |
| `WEBHOOK_URL` | `https://твой-проект.up.railway.app` (Railway даст домен после деплоя) |
| `WEBHOOK_SECRET` | Любой случайный текст, например `astroguru2026` |
| `MINI_APP_URL` | `https://твой-проект.up.railway.app` |
| `DATABASE_PATH` | `/app/data/astroguru.db` |
| `SUBSCRIPTION_PRICE` | `49` |
| `LOG_LEVEL` | `info` |

### Шаг 6 — Добавь Volume (хранилище для базы данных)
В Railway → твой сервис → **Volumes** → **Add Volume**:
- Mount path: `/app/data`

### Шаг 7 — Получи домен
Railway → твой сервис → **Settings** → **Networking** → **Generate Domain**  
Скопируй домен (вида `xxxx.up.railway.app`) и обнови переменные `WEBHOOK_URL` и `MINI_APP_URL`.

### Шаг 8 — Настрой Mini App в BotFather
1. Открой @BotFather → `/newapp`
2. Выбери бота → введи URL: `https://твой-домен.up.railway.app`

---

## Альтернатива: Render (тоже бесплатно)

1. Зайди на https://render.com
2. **New** → **Web Service** → подключи GitHub репозиторий
3. Build Command: `npm install && npm run build`
4. Start Command: `node dist/index.js`
5. Добавь те же переменные окружения

---

## Альтернатива: VPS (DigitalOcean / Timeweb / Beget)

Если есть VPS с Ubuntu:

```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install -y nodejs

# Клонирование проекта
git clone https://github.com/ТВОЙUsername/astroguru.git
cd astroguru
npm install
npm run build

# Создать .env
nano .env  # заполни все переменные

# PM2 для постоянной работы
npm install -g pm2
pm2 start dist/index.js --name astroguru
pm2 startup  # автозапуск после перезагрузки
pm2 save
```

---

## Важно для production

В `.env` / переменных Railway установи:
- `NODE_ENV=production`
- `WEBHOOK_URL=https://твой-домен.com` (не пустую!)
- Без WEBHOOK_URL бот использует polling (подходит только для локалки)

---

## Проверка работы

После деплоя открой в браузере:
- `https://твой-домен/api/health` — должен вернуть `{"status":"ok"}`
- Напиши `/start` своему боту в Telegram
