import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';
import { ResultScreenComponent } from './components/result-screen/result-screen.component';
import { GameService, GameState } from './services/game.service';
import { TelegramService } from './services/telegram.service';

type Screen = 'start' | 'game' | 'result';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StartScreenComponent, GameScreenComponent, ResultScreenComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  currentScreen: Screen = 'start';
  gameState: GameState | null = null;
  showLandscapeHint = false;
  private portraitMediaQuery: MediaQueryList | null = null;
  private orientationListener = () => {
    this.ngZone.run(() => this.updateLandscapeHint());
  };

  constructor(
    private gameService: GameService,
    private telegramService: TelegramService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
    });
    this.setupLandscapeHint();
  }

  ngOnDestroy(): void {
    this.portraitMediaQuery?.removeEventListener('change', this.orientationListener);
    window.removeEventListener('resize', this.orientationListener);
  }

  onStartGame(): void {
    this.telegramService.enterFullscreen();
    this.telegramService.requestLandscape();
    this.currentScreen = 'game';
    this.updateLandscapeHint();
  }

  onGameEnd(): void {
    this.currentScreen = 'result';
  }

  onPlayAgain(): void {
    this.telegramService.enterFullscreen();
    this.telegramService.requestLandscape();
    this.gameService.resetGame();
    this.currentScreen = 'game';
    this.updateLandscapeHint();
  }

  private setupLandscapeHint(): void {
    this.portraitMediaQuery = window.matchMedia('(pointer: coarse) and (orientation: portrait)');
    this.portraitMediaQuery.addEventListener('change', this.orientationListener);
    window.addEventListener('resize', this.orientationListener);
    this.updateLandscapeHint();
  }

  private updateLandscapeHint(): void {
    this.showLandscapeHint = this.telegramService.isRunningInTelegram()
      && !!this.portraitMediaQuery?.matches;
  }
}
