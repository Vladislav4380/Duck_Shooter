import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, Language } from '../../services/language.service';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-start-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './start-screen.component.html',
  styleUrls: ['./start-screen.component.scss']
})
export class StartScreenComponent implements OnInit {
  @Output() startGame = new EventEmitter<void>();
  
  translations: { [key: string]: string } = {};
  currentLanguage: Language = 'en';
  bestScore: number = 0;

  constructor(
    private languageService: LanguageService,
    private telegramService: TelegramService
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getLanguage();
    this.languageService.getTranslations().subscribe(trans => {
      this.translations = trans;
    });
    
    this.bestScore = parseInt(localStorage.getItem('duck_best_score') || '0', 10);
  }

  onStartGame(): void {
    this.startGame.emit();
  }

  onShareGame(): void {
    this.telegramService.shareGame(this.translate('shareInviteText'));
  }

  changeLanguage(lang: Language): void {
    this.languageService.setLanguage(lang);
    this.currentLanguage = lang;
  }

  translate(key: string): string {
    return this.languageService.translate(key);
  }
}
