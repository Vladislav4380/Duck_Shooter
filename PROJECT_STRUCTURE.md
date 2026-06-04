# Duck Shooter - Структура проекта

## 📁 Полная структура файлов

```
Duck_Shooter/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── start-screen/
│   │   │   │   ├── start-screen.component.ts       # Логика стартового экрана
│   │   │   │   ├── start-screen.component.html     # Шаблон
│   │   │   │   └── start-screen.component.scss     # Стили
│   │   │   ├── game-screen/
│   │   │   │   ├── game-screen.component.ts        # Логика игрового экрана
│   │   │   │   ├── game-screen.component.html      # Шаблон
│   │   │   │   └── game-screen.component.scss      # Стили
│   │   │   └── result-screen/
│   │   │       ├── result-screen.component.ts      # Логика экрана результатов
│   │   │       ├── result-screen.component.html    # Шаблон
│   │   │       └── result-screen.component.scss    # Стили
│   │   ├── services/
│   │   │   ├── game.service.ts                     # Сервис игровой логики
│   │   │   ├── language.service.ts                 # Сервис многоязычности
│   │   │   └── telegram.service.ts                 # Сервис Telegram API
│   │   ├── app.component.ts                        # Главный компонент
│   │   ├── app.component.html                      # Главный шаблон
│   │   ├── app.component.scss                      # Главные стили
│   │   ├── app.config.ts                           # Конфигурация Angular
│   │   └── app.routes.ts                           # Маршруты
│   ├── index.html                                  # HTML с Telegram SDK
│   ├── main.ts                                     # Точка входа
│   └── styles.scss                                 # Глобальные стили
├── public/
│   └── favicon.ico                                 # Иконка
├── angular.json                                    # Конфигурация Angular CLI
├── package.json                                    # Зависимости
├── tsconfig.json                                   # Конфигурация TypeScript
├── tsconfig.app.json                               # TS конфиг для приложения
├── tsconfig.spec.json                              # TS конфиг для тестов
├── .editorconfig                                   # Конфиг редактора
├── .gitignore                                      # Git ignore
├── README.md                                       # Документация
└── SETUP.md                                        # Инструкции по установке
```

## 🎯 Основные компоненты

### 1. StartScreenComponent
**Файлы:** `src/app/components/start-screen/`

**Функциональность:**
- Отображение названия игры и правил
- Переключатель языка (Украинский/Английский)
- Отображение лучшего результата
- Кнопка "Начать игру"
- Декоративные анимированные утки

**Стили:**
- Голубой градиент фона
- Анимация прыгающего названия
- Плавающие утки на фоне
- Адаптивный дизайн

### 2. GameScreenComponent
**Файлы:** `src/app/components/game-screen/`

**Функциональность:**
- Отображение игровой области
- Управление утками (появление, движение, удаление)
- Обработка кликов по уткам
- Отслеживание времени, очков, попаданий
- Звуковые эффекты выстрелов
- Анимации попаданий

**Стили:**
- Зеленый градиент фона (небо и трава)
- Анимация исчезновения уток при попадании
- Пульсирующий таймер при времени < 10 сек
- Кроссхейр курсор

### 3. ResultScreenComponent
**Файлы:** `src/app/components/result-screen/`

**Функциональность:**
- Отображение финального результата
- Показ статистики (попадания, промахи, точность)
- Отображение лучшего результата
- Бейдж "NEW RECORD" при новом рекорде
- Кнопка "Играть снова"
- Кнопка "Поделиться" (интеграция с Telegram)

**Стили:**
- Оранжевый/красный градиент фона
- Анимация появления результатов
- Пульсирующий рекорд

## 🔧 Сервисы

### GameService
**Файл:** `src/app/services/game.service.ts`

**Основные методы:**
```typescript
startGame()              // Начать новую игру
resetGame()              // Сбросить игру
shootDuck(duckId)        // Выстрелить по утке
updateDuckPositions()    // Обновить позиции уток
getBestScore()           // Получить лучший результат
getAccuracy()            // Получить точность
```

**Состояние (GameState):**
```typescript
score: number            // Текущие очки
hits: number             // Количество попаданий
misses: number           // Количество промахов
time: number             // Оставшееся время
isRunning: boolean       // Игра идет?
gameOver: boolean        // Игра закончена?
ducks: Duck[]             // Массив уток
```

**Типы уток:**
- `normal` - обычная утка (+10 очков)
- `fast` - быстрая утка (+25 очков)
- `golden` - золотая утка (+50 очков)

### LanguageService
**Файл:** `src/app/services/language.service.ts`

**Основные методы:**
```typescript
setLanguage(lang)        // Установить язык
getLanguage()            // Получить текущий язык
translate(key)           // Перевести ключ
getTranslations()        // Получить все переводы
```

**Поддерживаемые языки:**
- `uk` - Украинский
- `en` - Английский

**Автоматическое определение:**
- Проверяет язык Telegram пользователя
- Проверяет язык браузера
- Сохраняет выбор в localStorage

### TelegramService
**Файл:** `src/app/services/telegram.service.ts`

**Основные методы:**
```typescript
isRunningInTelegram()    // Запущено ли в Telegram?
getUserId()              // Получить ID пользователя
getUsername()            // Получить имя пользователя
getFirstName()           // Получить имя
shareResult(score, acc)  // Поделиться результатом
showPopup(title, msg)    // Показать popup
setMainButton(text, cb)  // Установить главную кнопку
```

## 🎮 Игровая механика

### Появление уток
- Утки появляются каждые 800 мс
- Появляются с 4 сторон: сверху, снизу, слева, справа
- Каждая утка имеет случайную скорость и траекторию
- Утки удаляются через 8 секунд (если не сбиты)

### Система очков
```
Обычная утка:  +10 очков
Быстрая утка:  +25 очков
Золотая утка:  +50 очков
```

### Время игры
- Общее время: 60 секунд
- Таймер отсчитывает вниз
- При времени < 10 сек таймер пульсирует красным

### Точность
```
Точность = (Попадания / (Попадания + Промахи)) * 100%
```

## 🎨 Дизайн и анимации

### Цветовая схема
- **Стартовый экран:** Голубой градиент (небо)
- **Игровой экран:** Голубо-зеленый градиент (небо и трава)
- **Результаты:** Оранжево-красный градиент (закат)

### Анимации
- **Прыгающее название:** Bounce анимация 2 сек
- **Плавающие утки:** Float анимация 6 сек
- **Попадание утки:** Spin и scale анимация 0.3 сек
- **Золотая утка:** Glow эффект
- **Быстрая утка:** Pulse эффект

### Адаптивность
- Полная поддержка мобильных устройств
- Viewport-fit для notch-дизайна
- Масштабирование элементов на маленьких экранах
- Touch-friendly размеры кнопок

## 📊 Сохранение данных

### localStorage
```
bestScore       // Лучший результат
language        // Выбранный язык
```

## 🔌 Интеграция с Telegram

### Telegram WebApp API
```javascript
window.Telegram.WebApp.ready()           // Готовность
window.Telegram.WebApp.expand()          // Развернуть
window.Telegram.WebApp.initDataUnsafe    // Данные пользователя
window.Telegram.WebApp.sendData()        // Отправить данные
```

### Данные пользователя
```typescript
{
  id: number
  is_bot: boolean
  first_name: string
  last_name?: string
  username?: string
  language_code?: string
}
```

## 🚀 Сборка и развертывание

### Разработка
```bash
pnpm start
```

### Сборка
```bash
pnpm run build
```

### Выходные файлы
```
dist/duck-shooter/
├── index.html
├── main-*.js
├── polyfills-*.js
└── styles-*.css
```

## 📝 Переводы

### Ключи переводов
```
title           - Название игры
startGame       - Кнопка начала
rules           - Правила
rulesText       - Текст правил
bestScore       - Лучший результат
score           - Очки
time            - Время
hits            - Попадания
misses          - Промахи
accuracy        - Точность
playAgain       - Играть снова
share           - Поделиться
gameOver        - Конец игры
finalScore      - Финальный результат
selectLanguage  - Выбрать язык
```

## 🔄 Поток данных

```
AppComponent
├── StartScreenComponent
│   └── LanguageService (переводы)
├── GameScreenComponent
│   ├── GameService (логика)
│   ├── LanguageService (переводы)
│   └── Web Audio API (звуки)
└── ResultScreenComponent
    ├── GameService (результаты)
    ├── TelegramService (поделиться)
    └── LanguageService (переводы)
```

## 🐛 Отладка

### Консоль браузера
Откройте F12 для просмотра ошибок и логов

### Telegram WebApp Debug
```javascript
window.Telegram.WebApp.showAlert('Debug message')
```

### Локальное тестирование
Используйте `http://localhost:4200` для тестирования перед развертыванием

---

**Версия:** 1.0.0  
**Последнее обновление:** 2026-06-04
