import {
  Component, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, Output, EventEmitter, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { GameService, GameState, Duck, HitEffect } from '../../services/game.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-game-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './game-screen.component.html',
  styleUrls: ['./game-screen.component.scss']
})
export class GameScreenComponent implements OnInit, AfterViewInit, OnDestroy {
  @Output() gameEnd = new EventEmitter<void>();
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  gameState: GameState | null = null;
  private sub!: Subscription;
  private ctx!: CanvasRenderingContext2D;
  private renderFrameId: number | null = null;

  // Loaded images
  private bgImg = new Image();
  private duckImgs: Record<string, HTMLImageElement> = {};
  private hitImg = new Image();
  private imagesLoaded = 0;
  private readonly totalImages = 5;

  // Audio
  private audioCtx: AudioContext | null = null;

  constructor(
    private gameService: GameService,
    private langService: LanguageService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.sub = this.gameService.gameState$.subscribe(state => {
      this.gameState = state;
      if (state.gameOver) {
        setTimeout(() => this.gameEnd.emit(), 900);
      }
    });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    this.loadImages().then(() => {
      this.ngZone.runOutsideAngular(() => {
        this.gameService.startGame();
        this.renderLoop();
      });
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    if (this.renderFrameId) cancelAnimationFrame(this.renderFrameId);
    window.removeEventListener('resize', () => this.resizeCanvas());
  }

  private resizeCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.gameService.setCanvasSize(canvas.width, canvas.height);
  }

  private loadImages(): Promise<void> {
    return new Promise(resolve => {
      let loaded = 0;
      const done = () => { loaded++; if (loaded >= this.totalImages) resolve(); };

      this.bgImg.src = 'assets/bg_game.png';
      this.bgImg.onload = done; this.bgImg.onerror = done;

      ['normal', 'fast', 'golden'].forEach(t => {
        const img = new Image();
        img.src = `assets/duck_${t}.png`;
        img.onload = done; img.onerror = done;
        this.duckImgs[t] = img;
      });

      this.hitImg.src = 'assets/hit_effect.png';
      this.hitImg.onload = done; this.hitImg.onerror = done;
    });
  }

  private renderLoop(): void {
    this.draw();
    this.renderFrameId = requestAnimationFrame(() => this.renderLoop());
  }

  private draw(): void {
    if (!this.ctx || !this.gameState) return;
    const canvas = this.canvasRef.nativeElement;
    const ctx = this.ctx;
    const w = canvas.width;
    const h = canvas.height;

    // Background
    if (this.bgImg.complete && this.bgImg.naturalWidth > 0) {
      ctx.drawImage(this.bgImg, 0, 0, w, h);
    } else {
      const sky = ctx.createLinearGradient(0, 0, 0, h * 0.65);
      sky.addColorStop(0, '#5BC8F5');
      sky.addColorStop(1, '#A8E6CF');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);
      const grass = ctx.createLinearGradient(0, h * 0.65, 0, h);
      grass.addColorStop(0, '#56C02B');
      grass.addColorStop(1, '#3A8A1E');
      ctx.fillStyle = grass;
      ctx.fillRect(0, h * 0.65, w, h * 0.35);
    }

    // Ducks
    this.gameState.ducks.forEach(d => this.drawDuck(ctx, d));

    // Hit effects
    this.gameState.hitEffects.forEach(fx => this.drawHitEffect(ctx, fx));

    // HUD
    this.drawHUD(ctx, w, h);
  }

  private drawDuck(ctx: CanvasRenderingContext2D, duck: Duck): void {
    ctx.save();
    ctx.globalAlpha = duck.opacity;

    const img = this.duckImgs[duck.type];
    const cx = duck.x + duck.width / 2;
    const cy = duck.y + duck.height / 2;

    ctx.translate(cx, cy);
    if (duck.flipX) ctx.scale(-1, 1);

    if (duck.hit) {
      const elapsed = performance.now() - duck.hitTime;
      const t = elapsed / 450;
      ctx.rotate(t * Math.PI * 2);
      ctx.scale(1 - t * 0.8, 1 - t * 0.8);
    }

    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -duck.width / 2, -duck.height / 2, duck.width, duck.height);
    } else {
      // Fallback colored rectangle with type indicator
      const colors: Record<string, string> = { normal: '#8B4513', fast: '#1E90FF', golden: '#FFD700' };
      ctx.fillStyle = colors[duck.type] || '#888';
      ctx.beginPath();
      ctx.ellipse(0, 0, duck.width / 2, duck.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = `${duck.height * 0.7}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🦆', 0, 0);
    }

    ctx.restore();
  }

  private drawHitEffect(ctx: CanvasRenderingContext2D, fx: HitEffect): void {
    ctx.save();
    ctx.globalAlpha = fx.opacity;
    ctx.translate(fx.x, fx.y);

    if (this.hitImg.complete && this.hitImg.naturalWidth > 0) {
      const s = 80 * fx.scale;
      ctx.drawImage(this.hitImg, -s / 2, -s / 2, s, s);
    }

    // Points label floating up
    const elapsed = performance.now() - fx.startTime;
    const yOffset = -(elapsed / fx.duration) * 60;

    ctx.font = 'bold 30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.fillStyle = fx.points >= 50 ? '#FFD700' : fx.points >= 25 ? '#FF6B00' : '#FFFFFF';
    const label = `+${fx.points}`;
    ctx.strokeText(label, 0, yOffset - 40);
    ctx.fillText(label, 0, yOffset - 40);

    ctx.restore();
  }

  private drawHUD(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    if (!this.gameState) return;
    const t = this.gameState.timeLeft;

    // Top HUD bar
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(10, 10, w - 20, 62, 14);
    ctx.fill();

    ctx.textBaseline = 'middle';

    // Score
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText(`🎯 ${this.gameState.score}`, 22, 41);

    // Timer (center)
    ctx.textAlign = 'center';
    if (t <= 10) {
      ctx.fillStyle = t % 2 === 0 ? '#FF4444' : '#FFD700';
      ctx.font = 'bold 28px Arial';
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 24px Arial';
    }
    ctx.fillText(`⏱ ${t}s`, w / 2, 41);

    // Hits / Misses
    ctx.font = 'bold 20px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'right';
    ctx.fillText(`✅ ${this.gameState.hits}  ❌ ${this.gameState.misses}`, w - 22, 41);

    ctx.restore();
  }

  onCanvasClick(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      if (!event.changedTouches.length) return;
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;

    this.ngZone.run(() => {
      const pts = this.gameService.shoot(canvasX, canvasY);
      if (pts > 0) this.playHitSound(pts);
      else this.playMissSound();
    });
  }

  private getAudioCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.audioCtx;
  }

  private playHitSound(pts: number): void {
    try {
      const ac = this.getAudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.setValueAtTime(pts >= 50 ? 880 : pts >= 25 ? 660 : 440, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pts >= 50 ? 1760 : 880, ac.currentTime + 0.18);
      gain.gain.setValueAtTime(0.3, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.35);
      osc.start(); osc.stop(ac.currentTime + 0.35);
    } catch { /* ignore */ }
  }

  private playMissSound(): void {
    try {
      const ac = this.getAudioCtx();
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain); gain.connect(ac.destination);
      osc.frequency.setValueAtTime(220, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, ac.currentTime + 0.18);
      gain.gain.setValueAtTime(0.15, ac.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.22);
      osc.start(); osc.stop(ac.currentTime + 0.22);
    } catch { /* ignore */ }
  }

  translate(key: string): string {
    return this.langService.translate(key);
  }
}
