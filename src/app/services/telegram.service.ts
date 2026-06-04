import { Injectable } from '@angular/core';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            is_bot: boolean;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          auth_date: number;
          hash: string;
        };
        ready: () => void;
        expand: () => void;
        close: () => void;
        MainButton: {
          text: string;
          color: string;
          textColor: string;
          isVisible: boolean;
          isActive: boolean;
          show: () => void;
          hide: () => void;
          enable: () => void;
          disable: () => void;
          onClick: (callback: () => void) => void;
          offClick: (callback: () => void) => void;
        };
        showPopup: (params: any) => void;
        sendData: (data: string) => void;
      };
    };
  }
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private webApp = (window as Window).Telegram?.WebApp;
  private userId: number | null = null;
  private username: string | null = null;
  private firstName: string | null = null;

  constructor() {
    this.initializeTelegram();
  }

  private initializeTelegram(): void {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();

      const userData = this.webApp.initDataUnsafe?.user;
      if (userData) {
        this.userId = userData.id;
        this.username = userData.username || null;
        this.firstName = userData.first_name;
      }
    }
  }

  isRunningInTelegram(): boolean {
    return !!this.webApp;
  }

  getUserId(): number | null {
    return this.userId;
  }

  getUsername(): string | null {
    return this.username;
  }

  getFirstName(): string | null {
    return this.firstName;
  }

  shareResult(score: number, accuracy: number): void {
    if (!this.webApp) return;

    const message = `I scored ${score} points with ${accuracy}% accuracy in Duck Shooter! 🦆🎯`;
    this.webApp.sendData(message);
  }

  showPopup(title: string, message: string, buttons: Array<{ text: string; id: string }> = []): Promise<string> {
    return new Promise((resolve) => {
      if (!this.webApp) {
        resolve('');
        return;
      }

      const defaultButtons = buttons.length > 0 ? buttons : [{ text: 'OK', id: 'ok' }];

      this.webApp.showPopup({
        title,
        message,
        buttons: defaultButtons.map(btn => ({
          id: btn.id,
          text: btn.text,
          type: btn.id === 'ok' ? 'default' : 'destructive'
        }))
      });
    });
  }

  setMainButton(text: string, callback: () => void): void {
    if (!this.webApp?.MainButton) return;

    this.webApp.MainButton.text = text;
    this.webApp.MainButton.show();
    this.webApp.MainButton.onClick(callback);
  }

  hideMainButton(): void {
    if (this.webApp?.MainButton) {
      this.webApp.MainButton.hide();
    }
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }
}
