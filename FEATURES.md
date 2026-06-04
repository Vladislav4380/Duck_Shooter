# 🎮 Game Features / Особливості гри

## Українська 🇺🇦

### Механіка гри

#### 🦆 Типи качок

1. **Звичайна качка** (Коричнева)
   - Очки: +10
   - Швидкість: Середня
   - Розмір: Середній
   - Траєкторія: Пряма лінія

2. **Швидка качка** (Синя)
   - Очки: +25
   - Швидкість: Висока
   - Розмір: Маленька
   - Траєкторія: Хаотична

3. **Золота качка** (Жовта)
   - Очки: +50
   - Швидкість: Дуже висока
   - Розмір: Велика
   - Траєкторія: Дугоподібна
   - Рідкість: 10% від всіх качок

### Система очок

```
Попадання:
- Звичайна качка: +10 очків
- Швидка качка: +25 очків
- Золота качка: +50 очків

Бонуси:
- Комбо (3+ попадання поспіль): +5 бонус очків
- Точність > 80%: +10 бонус очків
```

### Таймер та час гри

- **Тривалість гри**: 60 секунд
- **Попередження**: Останні 10 секунд — червоний пульс
- **Звуковий сигнал**: На 10, 5, 3, 2, 1 секунді

### Анімації

#### Рендеринг
- Canvas 2D для максимальної продуктивності
- 60 FPS на більшості пристроїв
- Апаратне прискорення (GPU)

#### Рухи уток
- Плавна інтерполяція позицій
- Ротація при льоті
- Ефект "падіння" при попаданні

#### Ефекти
- Вибух при попаданні
- Частинки розлітаються
- Числа очків плавають вгору

### Звукові ефекти

- **Попадання**: Короткий "пшик" звук
- **Промах**: Низький "бум" звук
- **Таймер**: Тиканння в останні 10 сек
- **Кінець гри**: Фанфари

### Багатомовність

Підтримуються мови:
- 🇺🇦 Українська
- 🇬🇧 Англійська

Переклади охоплюють:
- Назви екранів
- Правила гри
- Повідомлення про результати
- Кнопки та меню

### Збереження даних

#### localStorage
- Найкращий результат
- Вибір мови
- Статистика (всього ігор, загальні очки)

#### Структура

```json
{
  "duckShooter_bestScore": 1250,
  "duckShooter_language": "uk",
  "duckShooter_totalGames": 5,
  "duckShooter_totalPoints": 3450
}
```

### Адаптивність

#### Мобільні пристрої
- Сенсорні клики
- Портретна та ландшафтна орієнтація
- Оптимізація для малих екранів

#### Десктоп
- Клики мишею
- Підтримка клавіатури (Space для паузи)
- Повна HD підтримка

### Інтеграція з Telegram

#### WebApp API
- Отримання інформації про користувача
- Відправка даних в Telegram
- Поділ результатів

#### Функції
```typescript
// Отримання користувача
const user = window.Telegram.WebApp.initData;

// Закриття додатку
window.Telegram.WebApp.close();

// Поділ результату
window.Telegram.WebApp.shareToStory(imageUrl);
```

---

## English 🇬🇧

### Game Mechanics

#### 🦆 Duck Types

1. **Normal Duck** (Brown)
   - Points: +10
   - Speed: Medium
   - Size: Medium
   - Trajectory: Straight line

2. **Fast Duck** (Blue)
   - Points: +25
   - Speed: High
   - Size: Small
   - Trajectory: Chaotic

3. **Golden Duck** (Yellow)
   - Points: +50
   - Speed: Very high
   - Size: Large
   - Trajectory: Arc
   - Rarity: 10% of all ducks

### Scoring System

```
Hits:
- Normal duck: +10 points
- Fast duck: +25 points
- Golden duck: +50 points

Bonuses:
- Combo (3+ hits in a row): +5 bonus points
- Accuracy > 80%: +10 bonus points
```

### Timer and Game Duration

- **Game Duration**: 60 seconds
- **Warning**: Last 10 seconds — red pulse
- **Sound Alert**: At 10, 5, 3, 2, 1 second

### Animations

#### Rendering
- Canvas 2D for maximum performance
- 60 FPS on most devices
- Hardware acceleration (GPU)

#### Duck Movement
- Smooth position interpolation
- Rotation during flight
- "Falling" effect on hit

#### Effects
- Explosion on hit
- Particles scatter
- Score numbers float up

### Sound Effects

- **Hit**: Short "plink" sound
- **Miss**: Low "boom" sound
- **Timer**: Ticking in last 10 sec
- **Game End**: Fanfare

### Multilingual Support

Supported languages:
- 🇺🇦 Ukrainian
- 🇬🇧 English

Translations include:
- Screen names
- Game rules
- Result messages
- Buttons and menus

### Data Persistence

#### localStorage
- Best score
- Language preference
- Statistics (total games, total points)

#### Structure

```json
{
  "duckShooter_bestScore": 1250,
  "duckShooter_language": "en",
  "duckShooter_totalGames": 5,
  "duckShooter_totalPoints": 3450
}
```

### Responsiveness

#### Mobile Devices
- Touch clicks
- Portrait and landscape orientation
- Small screen optimization

#### Desktop
- Mouse clicks
- Keyboard support (Space for pause)
- Full HD support

### Telegram Integration

#### WebApp API
- Get user information
- Send data to Telegram
- Share results

#### Functions
```typescript
// Get user
const user = window.Telegram.WebApp.initData;

// Close app
window.Telegram.WebApp.close();

// Share result
window.Telegram.WebApp.shareToStory(imageUrl);
```
