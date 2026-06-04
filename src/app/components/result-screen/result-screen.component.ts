import { Component, Output, EventEmitter, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameService } from '../../services/game.service';
import { TelegramService } from '../../services/telegram.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-result-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './result-screen.component.html',
  styleUrls: ['./result-screen.component.scss']
})
export class ResultScreenComponent implements OnInit {
  @Output() playAgain = new EventEmitter<void>();
  @Input() finalScore: number = 0;
  @Input() hits: number = 0;
  @Input() misses: number = 0;

  translations: { [key: string]: string } = {};
  accuracy: number = 0;
  bestScore: number = 0;
  isNewRecord: boolean = false;

  constructor(
    private gameService: GameService,
    private telegramService: TelegramService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.languageService.getTranslations().subscribe(trans => {
      this.translations = trans;
    });

    this.bestScore = this.gameService.getBestScore();
    this.accuracy = this.gameService.getAccuracy();
    this.isNewRecord = this.finalScore > this.bestScore;
  }

  onPlayAgain(): void {
    this.gameService.resetGame();
    this.playAgain.emit();
  }

  onShare(): void {
    if (this.telegramService.isRunningInTelegram()) {
      this.telegramService.shareResult(this.finalScore, this.accuracy);
    } else {
      alert(`Score: ${this.finalScore} | Accuracy: ${this.accuracy}%`);
    }
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
