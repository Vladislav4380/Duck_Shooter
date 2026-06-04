import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StartScreenComponent } from './components/start-screen/start-screen.component';
import { GameScreenComponent } from './components/game-screen/game-screen.component';
import { ResultScreenComponent } from './components/result-screen/result-screen.component';
import { GameService, GameState } from './services/game.service';

type Screen = 'start' | 'game' | 'result';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, StartScreenComponent, GameScreenComponent, ResultScreenComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  currentScreen: Screen = 'start';
  gameState: GameState | null = null;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
    });
  }

  onStartGame(): void {
    this.currentScreen = 'game';
  }

  onGameEnd(): void {
    this.currentScreen = 'result';
  }

  onPlayAgain(): void {
    this.gameService.resetGame();
    this.currentScreen = 'start';
  }
}
