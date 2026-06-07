# 🌟 AstroGuru — Telegram Astrology Bot

Полнофункциональный Telegram-бот астролога с подпиской, мини-приложением и натальными картами.

## ✨ Возможности

| Функция | Бесплатно | Premium |
|---------|-----------|---------|
| Ежедневный гороскоп по знаку Солнца | ✅ | ✅ |
| Персональный гороскоп по натальной карте | ❌ | ✅ |
| Анализ планетарных транзитов | ❌ | ✅ |
| Натальная карта с визуализацией | ❌ | ✅ |
| Совместимость знаков | ✅ | ✅ |
| Недельный прогноз | ❌ | ✅ |
| Ежедневные уведомления в 9:00 | ✅ | ✅ |
| Mini App с интерактивной картой | ✅ | ✅ |

## 🛠 Tech Stack

- **Bot Framework:** Grammy.js
- **Server:** Express.js + TypeScript
- **Database:** SQLite (better-sqlite3)
- **Scheduler:** node-cron
- **Payments:** Telegram Stars (XTR)
- **Frontend:** Vanilla JS + Telegram WebApp API
- **Astrology:** Jean Meeus algorithms (без внешних API)

## 🚀 Быстрый старт

### 1. Клонирование и установка

```bash
cd astroguru
npm install
```

### 2. Настройка окружения

```bash
cp .env.example .env
```

Откройте `.env` и заполните:

```env
BOT_TOKEN=ваш_токен_от_BotFather
BOT_USERNAME=YourBotUsername
PORT=3000
NODE_ENV=development
```

### 3. Запуск в режиме разработки (polling)

```bash
npm run dev
```

Бот запустится в режиме long polling. Mini App будет доступен на `http://localhost:3000/app`.

## 📦 Деплой на сервер (Production)

### Требования
- Node.js 18+
- Домен с HTTPS (обязательно для Telegram Mini App)

### Railway / Render

1. Создайте новый проект
2. Подключите репозиторий
3. Установите переменные окружения:
   - `BOT_TOKEN`
   - `WEBHOOK_URL=https://your-domain.com`
   - `WEBHOOK_SECRET=random_secret_string`
   - `MINI_APP_URL=https://your-domain.com`
   - `NODE_ENV=production`
4. Deploy!

### VPS (Ubuntu/Debian)

```bash
# Установка Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Клонирование
git clone <your-repo> astroguru
cd astroguru
npm install
npm run build

# PM2 для управления процессом
npm install -g pm2
pm2 start dist/index.js --name astroguru
pm2 startup
pm2 save
```

### Nginx конфигурация

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## ⚙️ Настройка BotFather

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен
3. Установите описание: `/setdescription`
4. Установите команды: `/setcommands`
   ```
   start - Главное меню
   today - Гороскоп на сегодня
   subscribe - Оформить Premium подписку
   settings - Изменить данные рождения
   help - Справка
   ```
5. Настройте Mini App:
   - `/newapp` → выберите бота → укажите URL вашего приложения
6. Для оплаты Stars: активируйте через `/mybots` → Payments

## 🏗 Структура проекта

```
astroguru/
├── src/
│   ├── index.ts              # Точка входа
│   ├── bot/
│   │   ├── index.ts          # Создание бота
│   │   ├── handlers/
│   │   │   ├── start.ts      # /start команда
│   │   │   ├── today.ts      # /today команда
│   │   │   ├── subscribe.ts  # /subscribe команда
│   │   │   ├── settings.ts   # /settings + диалог ввода данных
│   │   │   └── payment.ts    # Обработка платежей
│   │   └── middleware/
│   │       └── userMiddleware.ts
│   ├── database/
│   │   ├── setup.ts          # Инициализация SQLite
│   │   └── queries.ts        # CRUD операции
│   ├── astrology/
│   │   ├── engine.ts         # Расчёт планетарных позиций (Jean Meeus)
│   │   ├── horoscope.ts      # Генерация текстов гороскопов
│   │   └── compatibility.ts  # Матрица совместимости
│   ├── payments/
│   │   └── stars.ts          # Интеграция Telegram Stars
│   ├── scheduler/
│   │   └── cron.ts           # Ежедневная рассылка в 9:00
│   ├── webapp/
│   │   └── routes.ts         # API для Mini App
│   └── utils/
│       ├── logger.ts         # Winston логгер
│       └── initData.ts       # Валидация Telegram initData
├── public/
│   ├── index.html            # Mini App
│   ├── styles.css            # Стили
│   └── app.js                # Frontend логика
├── data/                     # SQLite база данных (создаётся автоматически)
├── logs/                     # Логи (создаётся автоматически)
├── .env.example
├── package.json
└── tsconfig.json
```

## 🔭 Астрологические расчёты

Движок основан на алгоритмах из книги **Jean Meeus "Astronomical Algorithms"** (2nd ed.):

- **Солнце**: Уравнение центра, средняя аномалия, средняя долгота
- **Луна**: Теория с 16 гармониками (точность ≈ 0.5°)
- **Планеты**: Упрощённые коэффициенты VSOP87 (точность ≈ 1°)
- **Асцендент**: Местное звёздное время + наклон эклиптики
- **Дома**: Равные дома (Equal House System)
- **Аспекты**: Соединение, оппозиция, трин, квадрат, секстиль и другие

## 💳 Система подписки

- **Бесплатно**: гороскоп по знаку Солнца
- **Premium (49 ⭐ Stars/месяц)**: полный персональный гороскоп
- Оплата через **Telegram Stars** (встроенная система Telegram)
- При активной подписке — автоматическое продление даты истечения

## 🔒 Безопасность Mini App

Все запросы к API Mini App проверяются через HMAC-SHA256 подпись Telegram:

```
secretKey = HMAC-SHA256("WebAppData", botToken)
hash = HMAC-SHA256(checkString, secretKey)
```

## 📊 База данных

```sql
users              -- Пользователи + данные рождения + подписка
horoscopes         -- Кэш сгенерированных гороскопов
payments           -- История платежей Telegram Stars
natal_charts       -- Рассчитанные натальные карты
```

## 📝 Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|-------------|
| `BOT_TOKEN` | Токен Telegram бота | обязательно |
| `BOT_USERNAME` | Username бота | — |
| `WEBHOOK_URL` | URL для вебхука (prod) | polling mode |
| `WEBHOOK_SECRET` | Секрет вебхука | astroguru-secret |
| `PORT` | Порт сервера | 3000 |
| `NODE_ENV` | Окружение | development |
| `DATABASE_PATH` | Путь к SQLite файлу | ./data/astroguru.db |
| `MINI_APP_URL` | Публичный URL Mini App | https://yourdomain.com |
| `SUBSCRIPTION_PRICE` | Цена в Telegram Stars | 49 |
| `SUBSCRIPTION_DAYS` | Дней подписки | 30 |
| `LOG_LEVEL` | Уровень логирования | info |

## 🐛 Отладка

```bash
# Просмотр логов в реальном времени
tail -f logs/combined.log

# Только ошибки
tail -f logs/error.log

# Установить debug уровень
LOG_LEVEL=debug npm run dev
```

## 📄 Лицензия

MIT
