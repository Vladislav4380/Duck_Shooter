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
        requestFullscreen?: () => void;
        exitFullscreen?: () => void;
        isFullscreen?: boolean;
        isVersionAtLeast?: (version: string) => boolean;
        setHeaderColor?: (color: string) => void;
        setBackgroundColor?: (color: string) => void;
        disableVerticalSwipes?: () => void;
        openTelegramLink?: (url: string) => void;
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
  private readonly botUsername = 'duck_shooter_bot';
  private readonly miniAppShortName = 'duck_shooter';
  private webApp = (window as Window).Telegram?.WebApp;
  private userId: number | null = null;
  private username: string | null = null;
  private firstName: string | null = null;
  private fullscreenRetryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.initializeTelegram();
  }

  private initializeTelegram(): void {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
      this.webApp.setHeaderColor?.('#5BC8F5');
      this.webApp.setBackgroundColor?.('#5BC8F5');
      this.webApp.disableVerticalSwipes?.();
      this.enterFullscreen();

      const userData = this.webApp.initDataUnsafe?.user;
      if (userData) {
        this.userId = userData.id;
        this.username = userData.username || null;
        this.firstName = userData.first_name;
      }
    }
  }

  enterFullscreen(): void {
    this.requestFullscreen();
    this.requestLandscape();

    if (!this.fullscreenRetryTimer && this.webApp?.requestFullscreen && !this.webApp.isFullscreen) {
      this.fullscreenRetryTimer = setTimeout(() => {
        this.fullscreenRetryTimer = null;
        this.requestFullscreen();
        this.requestLandscape();
      }, 500);
    }
  }

  private requestFullscreen(): void {
    const webApp = this.webApp;
    const supportsFullscreen = !!webApp?.requestFullscreen
      && (webApp.isVersionAtLeast?.('8.0') ?? true);

    if (supportsFullscreen && !webApp?.isFullscreen) {
      try {
        webApp.requestFullscreen?.();
      } catch {
        // Older Telegram clients can expose the API but reject the request.
      }
    }
  }

  requestLandscape(): void {
    const orientation = screen.orientation as ScreenOrientation & {
      lock?: (orientation: 'landscape') => Promise<void>;
    };

    orientation?.lock?.('landscape').catch(() => {
      // Telegram, iOS, or disabled auto-rotate can reject orientation locking.
    });
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
    this.shareGame(`I scored ${score} points with ${accuracy}% accuracy in Duck Shooter!`);
  }

  shareGame(text = 'Play Duck Shooter with me!'): void {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(this.getMiniAppUrl())}&text=${encodeURIComponent(text)}`;

    if (this.webApp?.openTelegramLink) {
      this.webApp.openTelegramLink(shareUrl);
      return;
    }

    window.open(shareUrl, '_blank', 'noopener');
  }

  getMiniAppUrl(): string {
    return `https://t.me/${this.botUsername}?startapp=share`;
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
