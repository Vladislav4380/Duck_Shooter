# 🦆 Duck Shooter - Telegram Mini App

Мультяшна гра "Мисливець на качок" для Telegram Mini Apps, розроблена на Angular з TypeScript.

**English version below** ⬇️

---

## 🎮 Українська (Ukrainian)

### Про гру

**Duck Shooter** — це аркадна гра у стилі класичних "shooting gallery", де гравець має 60 секунд, щоб збити якомога більше качок. Кожна качка має свій тип та вартість очок.

### 🎯 Типи качок

| Тип | Спрайт | Очки | Опис |
|-----|--------|------|------|
| 🦆 Звичайна | Коричнева | +10 | Стандартна швидкість |
| 💙 Швидка | Синя | +25 | Швидше літає, складніше влучити |
| ⭐ Золота | Жовта | +50 | Рідкісна, найбільше очок |

### ✨ Особливості

- **Canvas-based рендеринг** — плавна анімація на HTML5 Canvas
- **Мультяшний фон** — красивий пейзаж з полем, деревами, забором, озером
- **Різні розміри уток** — динамічна складність
- **Звукові ефекти** — Web Audio API для звуків попадання/промаху
- **Багатомовність** — Українська 🇺🇦 та Англійська 🇬🇧
- **Автозбереження результатів** — localStorage для лучшого результату
- **Адаптивний дизайн** — працює на мобільних та десктопних пристроях
- **Telegram Mini App API** — інтеграція з Telegram

### 🚀 Швидкий старт

#### 1. Встановлення залежностей

```bash
cd Duck_Shooter
npm install
# або
pnpm install
```

#### 2. Запуск dev-сервера

```bash
npm start
# або
pnpm start
```

Гра буде доступна на `http://localhost:4200`

#### 3. Побудова для production

```bash
npm run build
# або
pnpm build
```

Результат буде в папці `dist/duck-shooter/`

### 🔧 Налаштування

#### Зміна часу гри

У файлі `src/app/services/game.service.ts`:

```typescript
readonly GAME_DURATION = 60; // Змініть на бажаний час в секундах
```

#### Зміна очок за типи уток

У файлі `src/app/services/game.service.ts`:

```typescript
points: type === 'normal' ? 10 : type === 'fast' ? 25 : 50
```

### 📱 Розгортання

#### На Vercel (рекомендується)

```bash
npm install -g vercel
vercel
```

#### На власному сервері

```bash
npm run build
# Завантажте вміст dist/duck-shooter/ на ваш веб-сервер
```

**Важливо:** Telegram Mini Apps вимагають HTTPS!

---

## 🎮 English

### About the Game

**Duck Shooter** is an arcade-style "shooting gallery" game where players have 60 seconds to shoot as many ducks as possible. Each duck type has its own sprite and point value.

### 🎯 Duck Types

| Type | Sprite | Points | Description |
|------|--------|--------|-------------|
| 🦆 Normal | Brown | +10 | Standard speed |
| 💙 Fast | Blue | +25 | Faster, harder to hit |
| ⭐ Golden | Yellow | +50 | Rare, most points |

### ✨ Features

- **Canvas-based rendering** — smooth animations on HTML5 Canvas
- **Cartoon background** — beautiful landscape with field, trees, fence, pond
- **Variable duck sizes** — dynamic difficulty
- **Sound effects** — Web Audio API for hit/miss sounds
- **Multilingual** — Ukrainian 🇺🇦 and English 🇬🇧
- **Auto-save results** — localStorage for best score
- **Responsive design** — works on mobile and desktop
- **Telegram Mini App API** — Telegram integration

### 🚀 Quick Start

#### 1. Install Dependencies

```bash
cd Duck_Shooter
npm install
# or
pnpm install
```

#### 2. Run Dev Server

```bash
npm start
# or
pnpm start
```

Game will be available at `http://localhost:4200`

#### 3. Build for Production

```bash
npm run build
# or
pnpm build
```

Output will be in `dist/duck-shooter/` folder

### 🔧 Configuration

#### Change Game Duration

In `src/app/services/game.service.ts`:

```typescript
readonly GAME_DURATION = 60; // Change to desired seconds
```

#### Change Points for Duck Types

In `src/app/services/game.service.ts`:

```typescript
points: type === 'normal' ? 10 : type === 'fast' ? 25 : 50
```

### 📱 Deployment

#### On Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

#### On Your Own Server

```bash
npm run build
# Upload contents of dist/duck-shooter/ to your web server
```

**Important:** Telegram Mini Apps require HTTPS!

---

**Created with ❤️ for Telegram Mini Apps**
