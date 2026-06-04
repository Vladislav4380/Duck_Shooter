import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type Language = 'uk' | 'en';

interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private currentLanguage = new BehaviorSubject<Language>('en');
  public currentLanguage$ = this.currentLanguage.asObservable();

  private translations: Translations = {
    uk: {
      title: 'Мисливець на Качок',
      startGame: 'Почати гру',
      rules: 'Правила',
      rulesText: 'Тапніть по качкам щоб набрати очки. Звичайна качка: +10, швидка: +25, золота: +50. Час гри: 60 секунд.',
      bestScore: 'Найкращий результат',
      score: 'Очки',
      time: 'Час',
      hits: 'Попадання',
      misses: 'Промахи',
      accuracy: 'Точність',
      playAgain: 'Грати знову',
      share: 'Поділитися результатом',
      gameOver: 'Гра закінчена!',
      finalScore: 'Фінальний результат',
      selectLanguage: 'Виберіть мову',
      pts: 'очок',
      seconds: 'сек'
    },
    en: {
      title: 'Duck Shooter',
      startGame: 'Start Game',
      rules: 'Rules',
      rulesText: 'Tap on ducks to score points. Normal duck: +10, fast: +25, golden: +50. Game time: 60 seconds.',
      bestScore: 'Best Score',
      score: 'Score',
      time: 'Time',
      hits: 'Hits',
      misses: 'Misses',
      accuracy: 'Accuracy',
      playAgain: 'Play Again',
      share: 'Share Result',
      gameOver: 'Game Over!',
      finalScore: 'Final Score',
      selectLanguage: 'Select Language',
      pts: 'pts',
      seconds: 'sec'
    }
  };

  constructor() {
    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    const saved = localStorage.getItem('language') as Language | null;
    if (saved) {
      this.currentLanguage.next(saved);
    } else {
      // Try to detect from Telegram or browser
      const detected = this.detectLanguage();
      this.currentLanguage.next(detected);
      localStorage.setItem('language', detected);
    }
  }

  private detectLanguage(): Language {
    // Check if running in Telegram
    if ((window as any).Telegram?.WebApp?.initData) {
      const initData = (window as any).Telegram.WebApp.initData;
      const userMatch = initData.match(/user=([^&]*)/);
      if (userMatch) {
        try {
          const userData = JSON.parse(decodeURIComponent(userMatch[1]));
          const langCode = userData.language_code || 'en';
          if (langCode.startsWith('uk')) return 'uk';
        } catch (e) {
          // Continue with browser detection
        }
      }
    }

    // Fallback to browser language
    const browserLang = navigator.language || 'en';
    if (browserLang.startsWith('uk')) return 'uk';
    return 'en';
  }

  setLanguage(lang: Language): void {
    this.currentLanguage.next(lang);
    localStorage.setItem('language', lang);
  }

  getLanguage(): Language {
    return this.currentLanguage.value;
  }

  translate(key: string): string {
    const lang = this.currentLanguage.value;
    return this.translations[lang][key] || this.translations['en'][key] || key;
  }

  getTranslations(): Observable<{ [key: string]: string }> {
    return new Observable(observer => {
      const lang = this.currentLanguage.value;
      observer.next(this.translations[lang]);
      this.currentLanguage$.subscribe(newLang => {
        observer.next(this.translations[newLang]);
      });
    });
  }
}
