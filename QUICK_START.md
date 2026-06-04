# Duck Shooter - Быстрый старт 🚀

## За 5 минут до первой игры

### 1️⃣ Установка (2 минуты)

```bash
# Перейдите в папку проекта
cd Duck_Shooter

# Установите зависимости
pnpm install
```

### 2️⃣ Запуск (1 минута)

```bash
# Запустите dev-сервер
pnpm start
```

Браузер откроется автоматически на `http://localhost:4200`

### 3️⃣ Играйте! (2 минуты)

1. Выберите язык (🇺🇦 Українська или 🇬🇧 English)
2. Нажмите "Почати гру" / "Start Game"
3. Тапайте по уткам! 🦆
4. Смотрите результаты

## 🎯 Как набирать очки

| Утка | Очки | Описание |
|------|------|---------|
| 🦆 | +10 | Обычная утка |
| 🦆💨 | +25 | Быстрая утка |
| 🦆✨ | +50 | Золотая утка |

## ⏱️ Правила

- **Время:** 60 секунд
- **Цель:** Набрать максимум очков
- **Точность:** Отслеживается количество попаданий и промахов

## 🛠️ Полезные команды

```bash
# Запустить dev-сервер
pnpm start

# Собрать для продакшена
pnpm run build

# Запустить тесты
pnpm test

# Проверить типы
pnpm run type-check
```

## 📱 Тестирование в Telegram

1. Создайте Telegram бота через @BotFather
2. Добавьте Mini App с URL вашего приложения
3. Откройте Mini App в Telegram

## 🌐 Развертывание

### На Vercel (рекомендуется)

```bash
# Установите Vercel CLI
npm i -g vercel

# Разверните
vercel
```

### На GitHub Pages

```bash
# Соберите проект
pnpm run build

# Загрузите содержимое dist/ на GitHub Pages
```

### На собственном сервере

```bash
# Соберите проект
pnpm run build

# Загрузите содержимое dist/duck-shooter/ на ваш сервер
# Убедитесь, что сервер поддерживает HTTPS
```

## 🔧 Кастомизация

### Изменить время игры

Откройте `src/app/services/game.service.ts` и найдите:

```typescript
private readonly GAME_DURATION = 60; // Измените на нужное значение
```

### Изменить очки

В том же файле найдите метод `getPointsForDuck()`:

```typescript
private getPointsForDuck(type: 'normal' | 'fast' | 'golden'): number {
  switch (type) {
    case 'normal':
      return 10;   // Измените
    case 'fast':
      return 25;   // Измените
    case 'golden':
      return 50;   // Измените
  }
}
```

### Добавить новый язык

Откройте `src/app/services/language.service.ts` и добавьте переводы в объект `translations`.

## 🐛 Решение проблем

### Проблема: "pnpm: command not found"

**Решение:** Установите pnpm
```bash
npm install -g pnpm
```

### Проблема: Порт 4200 уже занят

**Решение:** Используйте другой порт
```bash
pnpm start -- --port 4300
```

### Проблема: Звуки не работают

**Решение:** Это нормально в некоторых браузерах. Проверьте консоль (F12).

### Проблема: Утки не появляются

**Решение:** Очистите кэш браузера (Ctrl+Shift+Delete) и перезагрузите страницу.

## 📚 Дополнительные ресурсы

- [Angular документация](https://angular.io/docs)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Telegram WebApp](https://core.telegram.org/bots/webapps)
- [TypeScript документация](https://www.typescriptlang.org/docs/)

## 💡 Советы

- Используйте DevTools (F12) для отладки
- Проверяйте консоль на ошибки
- Тестируйте на разных устройствах
- Используйте Telegram Desktop для тестирования Mini App

## 🎉 Готово!

Теперь у вас есть полнофункциональная игра Duck Shooter!

**Приятной игры! 🦆🎯**

---

**Нужна помощь?** Проверьте `SETUP.md` для более подробной информации.
